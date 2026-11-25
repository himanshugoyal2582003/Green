require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { seedDatabase } = require('./utils/seed');
const { startTelegramBot } = require('./bot/telegramBot');
const authRoutes = require('./routes/auth.routes');
const listingRoutes = require('./routes/listing.routes');
const adminRoutes = require('./routes/admin.routes');
const paymentRoutes = require('./routes/payment.routes');
const chatRoutes = require('./routes/chat.routes');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 3001;
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet({ crossOriginOpenerPolicy: false, contentSecurityPolicy: false }));
app.use(express.json({ limit: '20kb' }));
app.get('/api/health', (_req, res) => res.json({ ok: true, database: 'connected' }));
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chats', chatRoutes);
app.use(notFound);
app.use(errorHandler);

async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET is required in backend/.env and must be at least 32 characters.');
  await connectDB();
  await seedDatabase();
  startTelegramBot();
  app.listen(PORT, () => console.log(`Green Second Life is running at http://localhost:${PORT}`));
}
start().catch(error => { console.error(`Startup failed: ${error.message}`); process.exit(1); });
