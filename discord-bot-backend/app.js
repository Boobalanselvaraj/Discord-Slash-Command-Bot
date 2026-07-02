import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import interactionsRoutes from './src/routes/interactions.js';
import commandsRoutes from './src/routes/commands.js';
import authRoutes from './src/routes/auth.js';
import configRoutes from './src/routes/config.js';
import usersRoutes from './src/routes/users.js';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { verifyAuth } from './src/middleware/verifyAuth.js';

dotenv.config();

const app = express();

app.use(morgan('dev'));
app.use(cors({
  origin: [
    process.env.FRONTEND_URL, 
    'http://localhost:5173', 
    'https://discord-slash-app-sage.vercel.app'
  ].filter(Boolean),
  credentials: true
}));
app.use(cookieParser());
// Note: Discord interactions require raw body parsing to verify the signature.
// We will apply express.json() but preserve the raw body.
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use('/api/interactions', interactionsRoutes);
app.use('/api/auth', authRoutes); // Auth routes (login/logout/me) are unprotected by default, individual endpoints can be protected

// Protected routes
app.use('/api/commands', verifyAuth, commandsRoutes);
app.use('/api/config', verifyAuth, configRoutes);
app.use('/api/users', verifyAuth, usersRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
