import api from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const chatbotService = {
  async ask(message: string, history: ChatMessage[] = []) {
    const res = await api.post('/chatbot/ask', { message, history });
    return res.data.data;
  },
};
