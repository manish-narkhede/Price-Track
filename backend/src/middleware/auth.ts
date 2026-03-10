import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
  };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    // Upsert user record in our database
    await User.findOneAndUpdate(
      { uid: decoded.uid },
      { uid: decoded.uid, email: decoded.email ?? '' },
      { upsert: true, new: true }
    );

    req.user = { uid: decoded.uid, email: decoded.email ?? '' };
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
}
