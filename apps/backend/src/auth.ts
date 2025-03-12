import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./config";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies["token"];

  if (!token) {
    res.status(400).json({ error: "Unauthorized." });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

    req.userId = payload.userId;
    next();
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: "Invalid Token." });
    return;
  }
}
