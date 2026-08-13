require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

const { authRouter } = require('./routes/auth.routes');
const { resumeRouter } = require('./routes/resume.routes');
const { analysisRouter, aiRouter } = require('./routes/analysis.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// ── Security & parsing ─────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? (process.env.CLIENT_URL || false) : (process.env.CLIENT_URL || '*'),
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ── Routes ─────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running 🚀' });
});

app.use('/api/auth', authRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/analysis', analysisRouter);
app.use('/api/ai', aiRouter);

// ── Global error handler (must be last) ────────────────────────
app.use(errorHandler);

// ── Start server ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const start = async () => {
    try {
        if (process.env.MONGO_URI) {
            await mongoose.connect(process.env.MONGO_URI);
            console.log('✅ Connected to MongoDB');
        } else {
            console.warn('⚠️  MONGO_URI not set — running without database');
        }

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err.message);
        process.exit(1);
    }
};

// Only start if this is the main module (not in tests)
if (require.main === module) {
    start();
}

module.exports = app;
