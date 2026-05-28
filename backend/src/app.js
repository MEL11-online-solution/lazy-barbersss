const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { passport } = require('./config/passport');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { ok } = require('./utils/response');

const authRoutes = require('./routes/auth.routes');
const servicesRoutes = require('./routes/services.routes');
const barbersRoutes = require('./routes/barbers.routes');
const availabilityRoutes = require('./routes/availability.routes');
const bookingsRoutes = require('./routes/bookings.routes');
const customerRoutes = require('./routes/customer.routes');
const barberPortalRoutes = require('./routes/barber.routes');
const adminRoutes = require('./routes/admin.routes');
const contactRoutes = require('./routes/contact.routes');
const reviewsRoutes = require('./routes/reviews.routes');
const chatbotRoutes = require('./routes/chatbot.routes');
const clubRoutes = require('./routes/club.routes');

const app = express();

// ---- Core middleware ----
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    credentials: true, // allow cookies
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Passport — stateless (JWT cookies), so initialize() only, no sessions.
app.use(passport.initialize());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ---- Health check ----
app.get('/api/v1/health', (_req, res) => ok(res, { status: 'ok', time: new Date().toISOString() }));

// ---- API routes (versioned) ----
const api = express.Router();
api.use('/auth', authRoutes);
api.use('/services', servicesRoutes);
api.use('/barbers', barbersRoutes);
api.use('/availability', availabilityRoutes);
api.use('/bookings', bookingsRoutes);
api.use('/customer', customerRoutes);
api.use('/barber', barberPortalRoutes);
api.use('/admin', adminRoutes);
api.use('/contact', contactRoutes);
api.use('/reviews', reviewsRoutes);
api.use('/chatbot', chatbotRoutes);
api.use('/club', clubRoutes);

app.use('/api/v1', api);

// ---- 404 + error handler (must be last) ----
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
