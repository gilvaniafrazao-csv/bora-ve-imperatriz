import { Router } from 'express';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { register } from './auth.controller';

export const authRouter = Router();

authRouter.post('/register', asyncHandler(register));
