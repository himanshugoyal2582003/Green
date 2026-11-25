const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authenticate(req, res, next) {
  try {
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Sign in to continue.' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('name email role profileImage');
    if (!user) return res.status(401).json({ error: 'Account not found. Sign in again.' });
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: 'Your session is invalid or expired. Please sign in again.' });
  }
}

function allowRoles(...roles) {
  return (req, res, next) => roles.includes(req.user.role) ? next() : res.status(403).json({ error: `This action requires a ${roles.join(' or ')} account.` });
}

module.exports = { authenticate, allowRoles };
