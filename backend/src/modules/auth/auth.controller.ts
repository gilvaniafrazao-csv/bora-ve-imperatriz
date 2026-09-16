import { Request, Response } from 'express';
import { loginUser, registerUser } from './auth.service';

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
