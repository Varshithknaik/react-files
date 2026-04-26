import jwt from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'
import { sendError } from '../lib/http-response.js'

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return sendError(res, 401, 'Unauthorized')
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    req.user = decoded
    next()
  } catch (error) {
    return sendError(res, 401, 'Unauthorized')
  }
}
