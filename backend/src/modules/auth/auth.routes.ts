import { Router } from 'express';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { login, register } from './auth.controller';
import { oauthCallback, oauthExchange, oauthRegister, oauthStart } from './oauth.controller';

export const authRouter = Router();

authRouter.post('/register', asyncHandler(register));
authRouter.post('/login', asyncHandler(login));
authRouter.get('/oauth/:provider/start', asyncHandler(oauthStart));
authRouter.get('/oauth/:provider/callback', asyncHandler(oauthCallback));
authRouter.post('/oauth/:provider/callback', asyncHandler(oauthCallback));
authRouter.post('/oauth/exchange', asyncHandler(oauthExchange));
authRouter.post('/oauth/register', asyncHandler(oauthRegister));
