import { Request, Response, NextFunction } from 'express';
import { chatbotService } from './chatbot.service';

interface AuthRequest extends Request {
  userId?: string;
}

export const chatbotController = {
  async ask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { message, history } = req.body;

      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_INPUT', message: 'Message is required' },
        });
      }

      const result = await chatbotService.askQuestion(message.trim(), history || []);

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
