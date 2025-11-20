// const { default: axios } = require('axios');

const supabaseAdmin = require('../../../libs/supabaseAdmin');

exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    const { data: linkData, error: linkErr } =
      await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: `91${phone}@datey.app`,
      });

    return res.status(200).json({
      success: !linkErr,
      otp: linkData.properties.email_otp,
      error: linkErr,
    });
  } catch (err) {
    console.log('Error: ', err.message);
    return res.status(500).json({ error: err.message });
  }
};

// exports.sendOtp = async (req, res) => {
//   const { mobile, send } = req.body;

//   const isSendOtp = send;

//   if (!mobile) {
//     return res.status(400).json({ error: 'Mobile number is required' });
//   }

//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//   const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
//   let smsId = '';
//   let status = '';
//   let credit = '';

//   try {
//     if (isSendOtp) {
//       const message = `${otp}%20is%20your%20OTP%20for%20accessing%20the%20JOBTHALAM%20job%20portal.%20This%20OTP%20is%20valid%20for%2010%20minutes.%20Do%20not%20share%20this%20code%20with%20anyone%20to%20ensure%20the%20security%20of%20your%20account.`;

//       const smsUrl = `https://pay4sms.in/sendsms/?token=${process.env.SMS_TOKEN}&credit=2&sender=JOBTLM&message=${message}&number=${mobile}&templateid`;

//       const smsRes = await axios.get(smsUrl);
//       if (!smsRes.data) {
//         return res.status(500).json({ error: 'Something went wrong' });
//       }
//       const [, smsIdValue, statusValue, creditValue] = smsRes.data[0];
//       smsId = smsIdValue;
//       status = statusValue;
//       credit = creditValue;

//       if (creditValue !== 2) {
//         return res.status(500).json({ error: 'Something went wrong' });
//       }
//     }

//     // await db.collection('otps').doc(mobile).set

//     console.log({
//       otp,
//       expiresAt,
//       smsId,
//       status,
//       credit,
//       createdAt: new Date(),
//     });

//     return res.json({ sucess: true, message: 'OTP sent successfully' });
//   } catch (err) {
//     console.error('Error sending OTP:', err);
//     return res.status(500).json({ error: err.message });
//   }
// };
