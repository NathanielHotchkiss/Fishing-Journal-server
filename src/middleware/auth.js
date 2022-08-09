const { JsonWebTokenError } = require('jsonwebtoken');
const {verifyJwt, getUserWithEmail} = require('../actions/auth');

async function requireAuth(req, res, next) {
  const authToken = req.get('Authorization') || '';

  let bearerToken;
  if (!authToken.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token' });
  } else {
    bearerToken = authToken.slice(7, authToken.length);
  }

  try {
    const payload = verifyJwt(bearerToken);

    const user = await getUserWithEmail(
      payload.sub,
    );

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized request' });
    }
      
    req.member = user;
    next();
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      return res.status(401).json({ error: 'Unauthorized request' });
    }

    next(error);
  }
};

module.exports = {
  requireAuth,
};