import { Response } from 'express';
import { AuthenticatedRequest } from '../../shared/http/requireAuth';
import { getUserPreferences, updateUserPreferences } from './preferences.service';

export async function getPreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
  const preferences = await getUserPreferences(req.userId as string);
  res.status(200).json({ preferences });
}

export async function putPreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
  const preferences = await updateUserPreferences(req.userId as string, req.body);
  res.status(200).json({
    message: 'Preferências salvas com sucesso.',
    preferences,
  });
}
