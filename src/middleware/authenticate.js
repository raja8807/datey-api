const jwt = require('jsonwebtoken');

function verifyAuthToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Authorization header missing',
    });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  //
  try {
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);

    req.user = decoded;
    req.accessToken = token;

    next();
  } catch (err) {
    return res.status(401).json({
      error: 'Invalid or expired token',
      message: err.message,
    });
  }
  return {};
}

module.exports = verifyAuthToken;
