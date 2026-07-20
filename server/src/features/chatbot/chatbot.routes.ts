import { Router } from 'express';
import { chatbotController } from './chatbot.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/ask', chatbotController.ask);

export default router;
