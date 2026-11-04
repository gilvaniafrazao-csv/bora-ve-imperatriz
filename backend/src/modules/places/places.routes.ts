import { Router } from 'express';
import { asyncHandler } from '../../shared/http/asyncHandler';
import { listPlaces, showPlace } from './places.controller';

export const placesRouter = Router();

placesRouter.get('/search', asyncHandler(listPlaces));
placesRouter.get('/:placeId', asyncHandler(showPlace));
