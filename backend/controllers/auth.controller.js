const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { uploadImage, destroyImages } = require('../utils/cloudinaryUpload');

const publicUser = user => ({ id: user._id, name: user.name, email: user.email, role: user.role, profileImage: user.profileImage?.url || '' });
const issueToken = user => jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

async function signup(req, res, next) {
  try {
    const { name, email, password, role = 'buyer', adminKey } = req.body || {};
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 60) return res.status(400).json({ error: 'Name must be between 2 and 60 characters.' });
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return res.status(400).json({ error: 'Enter a valid email address.' });
    if (typeof password !== 'string' || password.length < 8 || password.length > 72) return res.status(400).json({ error: 'Password must be 8–72 characters long.' });
    if (!['buyer', 'seller', 'admin'].includes(role)) return res.status(400).json({ error: 'Choose buyer, seller, or admin.' });
    if (role === 'admin' && (!process.env.ADMIN_SIGNUP_KEY || adminKey !== process.env.ADMIN_SIGNUP_KEY)) return res.status(403).json({ error: 'A valid admin invite key is required.' });
    if (await User.exists({ email: email.toLowerCase().trim() })) return res.status(409).json({ error: 'That email address is already registered.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), passwordHash, role });
    return res.status(201).json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) { return next(error); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ error: 'Email and password are required.' });
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: 'Email or password is incorrect.' });
    return res.json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) { return next(error); }
}

function me(req, res) { res.json({ user: publicUser(req.user) }); }

async function updateProfileImage(req, res, next) {
  let uploaded;
  try {
    if (!req.file) return res.status(400).json({ error: 'Choose a profile image to upload.' });
    uploaded = await uploadImage(req.file.buffer, 'profiles');
    const previous = req.user.profileImage;
    req.user.profileImage = uploaded;
    await req.user.save();
    if (previous?.publicId) await destroyImages([previous]);
    return res.json({ user: publicUser(req.user) });
  } catch (error) {
    if (uploaded) await destroyImages([uploaded]);
    return next(error);
  }
}

module.exports = { signup, login, me, updateProfileImage };
