import { Request, Response } from 'express';
import {
  loginUser,
  registerUser,
  requestPasswordRecovery,
  resetUserPassword
} from './auth.service';

export async function register(req: Request, res: Response): Promise<void> {
  const user = await registerUser(req.body);
  res.status(201).json({
    message: 'Conta criada com sucesso.',
    user,
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const result = await loginUser(req.body);
  res.status(200).json({
    message: 'Login realizado com sucesso.',
    user: result.user,
    token: result.token,
  });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  await requestPasswordRecovery(req.body);
  
  res.status(200).json({
    message: 'Se o e-mail fornecido estiver cadastrado, você receberá as instruções de recuperação.',
  });
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  await resetUserPassword(req.body);
  
  res.status(200).json({
    message: 'Senha redefinida com sucesso.',
  });
}