const authenticate = (req, res, next) => {
  next();
  //   const publicEndpoints = ['/api/x'];

  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  // Check token validity (for simplicity, assuming 'Bearer <token>')
  const isValidToken = token.startsWith('Bearer ');

  if (!isValidToken) {
    return res.status(403).json({ message: 'Invalid token' });
  }

  next(); // Continue to the next middleware or route

  return null;
};

module.exports = authenticate;
