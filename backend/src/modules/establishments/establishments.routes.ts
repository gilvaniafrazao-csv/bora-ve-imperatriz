import { Router } from 'express';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { getEstablishment } from './establishments.controller';

export const establishmentsRouter = Router();

establishmentsRouter.get('/:id', asyncHandler(getEstablishment));