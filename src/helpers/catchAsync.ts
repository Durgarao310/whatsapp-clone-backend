import { Request, Response, NextFunction } from 'express';

const catchAsync = <T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req as T, res, next)).catch((err) => next(err));
  };
};

export default catchAsync;
