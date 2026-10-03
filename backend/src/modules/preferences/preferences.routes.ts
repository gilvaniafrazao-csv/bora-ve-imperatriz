import { Router } from 'express';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { requireAuth } from '../../shared/http/requireAuth';
import { getPreferences, putPreferences } from './preferences.controller';

export const preferencesRouter = Router();

preferencesRouter.use(requireAuth);
preferencesRouter.get('/', asyncHandler(getPreferences));
preferencesRouter.put('/', asyncHandler(putPreferences));
