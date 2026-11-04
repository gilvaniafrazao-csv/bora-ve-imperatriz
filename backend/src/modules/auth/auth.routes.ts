import { Router } from 'express';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { login, register, forgotPassword, resetPassword } from './auth.controller';
import { forgotPasswordLimiter, resetPasswordLimiter } from '../../shared/http/rateLimit';

export const authRouter = Router();

authRouter.post('/register', asyncHandler(register));
authRouter.post('/login', asyncHandler(login));
authRouter.post('/forgot-password', forgotPasswordLimiter, asyncHandler(forgotPassword));
authRouter.post('/reset-password', resetPasswordLimiter, asyncHandler(resetPassword));