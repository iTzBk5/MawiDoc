import { Request } from 'express';
import { AuthPayload } from '@mawi-doc/shared';

export interface AuthRequest extends Request {
  user?: AuthPayload;
}
