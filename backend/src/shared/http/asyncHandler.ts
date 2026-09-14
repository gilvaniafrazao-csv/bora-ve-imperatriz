import { NextFunction, Request, RequestHandler, Response } from 'express';

/** Encaminha rejeições de handlers async para o errorHandler global. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    void fn(req, res, next).catch(next);
  };
}
