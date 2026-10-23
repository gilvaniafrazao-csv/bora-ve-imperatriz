import { Router } from 'express';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { login, register, forgotPassword, resetPassword } from './auth.controller';

export const authRouter = Router();

authRouter.post('/register', asyncHandler(register));
authRouter.post('/login', asyncHandler(login));
authRouter.post('/forgot-password', asyncHandler(forgotPassword));
authRouter.post('/reset-password', asyncHandler(resetPassword));