const {
  StandardCheckoutClient,
  Env,
  MetaInfo,
  StandardCheckoutPayRequest,
} = require('pg-sdk-node');

const Payment = require('../../models/payment.model');
const Request = require('../../models/request.model');
const Package = require('../../models/package.model');
const {
  sendJobsForRequest,
} = require('../request/functions/request.functions');
const Candidate = require('../../models/candidate.model');

const isTest = process.env.VERCEL !== '1';

exports.initiatePayment = async (req, res) => {
  console.log('payment initiated----->>');

  try {
    const { candidateId, packageId, skillId, location } = req.body;

    const clientId = isTest
      ? process.env.TEST_CLIENT_ID
      : process.env.PROD_CLIENT_ID;
    const clientSecret = isTest
      ? process.env.TEST_CLIENT_SECRET
      : process.env.PROD_CLIENT_SECRET;
    const clientVersion = isTest
      ? process.env.TEST_CLIENT_VERSION
      : process.env.PROD_CLIENT_VERSION;

    const env = isTest ? Env.SANDBOX : Env.PRODUCTION;

    // Create Request
    const request = await Request.create(
      {
        candidate_id: candidateId,
        skill_id: skillId,
        package_id: packageId,
        isTest,
        location,
      },
      {
        returning: true,
      },
    );

    // // Create Payment linked to Request
    const payment = await Payment.create(
      {
        candidate_id: candidateId,
        package_id: packageId,
        request_id: request.dataValues.id,
        status: 'PENDING',
      },
      {
        returning: true,
      },
    );

    // // Update request with payment_id
    await request.update({ payment_id: payment.id });

    const client = StandardCheckoutClient.getInstance(
      clientId,
      clientSecret,
      clientVersion,
      env,
    );

    const merchantOrderId = payment.dataValues.id;

    const ReqPackage = await Package.findOne({
      where: {
        id: packageId,
      },
    });

    const amount = isTest
      ? parseInt(ReqPackage.dataValues.price, 10) * 100
      : 100;

    console.log('1');

    const redirectUrl = `${req.headers.origin}/candidate?t=2&o=${merchantOrderId}`;

    console.log('2');

    const metaInfo = MetaInfo.builder().udf1('udf1').udf2('udf2').build();

    console.log('3');

    const payRequest = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(amount)
      .redirectUrl(redirectUrl)
      .metaInfo(metaInfo)
      .build();

    console.log('4');

    console.log(merchantOrderId);
    console.log(payRequest);

    const payentRespose = await client.pay(payRequest);

    console.log('5');

    await payment.update({ order_id: payentRespose.orderId });

    console.log('6');

    return res.status(200).json(payentRespose);
  } catch (error) {
    console.log('error--->', error);
    return res.status(500).send(error);
  }
};

exports.checkPaymentStatusAndSendJob = async (req, res) => {
  try {
    const { paymentId } = req.body;

    const request = await Request.findOne({
      where: { payment_id: paymentId },
      include: [
        {
          model: Candidate,
          as: 'candidate',
        },

        {
          model: Package,
          as: 'package',
        },
      ],
    });

    const clientId = isTest
      ? process.env.TEST_CLIENT_ID
      : process.env.PROD_CLIENT_ID;
    const clientSecret = isTest
      ? process.env.TEST_CLIENT_SECRET
      : process.env.PROD_CLIENT_SECRET;
    const clientVersion = isTest
      ? process.env.TEST_CLIENT_VERSION
      : process.env.PROD_CLIENT_VERSION;
    const env = isTest ? Env.SANDBOX : Env.PRODUCTION;

    const client = StandardCheckoutClient.getInstance(
      clientId,
      clientSecret,
      clientVersion,
      env,
    );

    const statusResponse = await client.getOrderStatus(paymentId);

    await Payment.update(
      { status: statusResponse.state },
      {
        where: { id: paymentId },
        returning: true, // works only in Postgres
      },
    );

    if (statusResponse.state === 'COMPLETED') {
      const result = await sendJobsForRequest(request);
      return res.status(200).json(result);
    }

    return res.status(200).json(statusResponse);
  } catch (error) {
    console.log('error--->', error);
    return res.status(500).send(error);
  }
};
