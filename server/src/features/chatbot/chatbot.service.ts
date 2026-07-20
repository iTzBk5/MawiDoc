import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../../shared/database';
import logger from '../../shared/utils/logger';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export class ChatbotService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }

  async askQuestion(message: string, conversationHistory: { role: string; content: string }[] = []) {
    try {
      // Fetch all specialties and doctors from the database
      const [specialties, doctors] = await Promise.all([
        prisma.specialty.findMany(),
        prisma.doctorProfile.findMany({
          include: { specialty: true },
          where: { isOpen: true },
        }),
      ]);

      const specialtyList = specialties
        .map((s) => `- ${s.name} (Arabic: ${s.nameAr || 'N/A'}, French: ${s.nameFr || 'N/A'})`)
        .join('\n');

      const doctorList = doctors
        .map((d) => `- Dr. ${d.fullName} | Specialty: ${d.specialty?.name || 'General'} | City: ${d.address || 'N/A'} | Fee: ${d.consultationPrice || 'N/A'} DA`)
        .join('\n');

      const systemPrompt = `You are MawiDOC Assistant, a helpful medical triage chatbot for a doctor appointment booking app in Algeria.

Your role is to:
1. Listen to the patient's symptoms and concerns
2. Recommend which medical specialty they should visit
3. Suggest specific doctors from our database that match their needs
4. Be empathetic, professional, and helpful
5. Always remind the patient that you are not a doctor and they should consult a professional

IMPORTANT RULES:
- NEVER diagnose diseases. Only suggest which specialty to visit.
- Always recommend seeing a doctor, never suggest self-treatment.
- Respond in the same language the user writes in (English, French, or Arabic).
- Keep responses concise but helpful (max 3-4 paragraphs).
- If the user's symptoms are unclear, ask clarifying questions.

AVAILABLE SPECIALTIES IN OUR APP:
${specialtyList}

AVAILABLE DOCTORS (currently open):
${doctorList}

When recommending doctors, format them clearly with their name, specialty, and city.`;

      const history = conversationHistory.map((msg) => ({
        role: msg.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: msg.content }],
      }));

      let responseText = '';
      let attempts = 0;
      const maxAttempts = 3;
      const modelsToTry = ['gemini-flash-lite-latest', 'gemini-3.1-flash-lite', 'gemini-2.5-flash-lite'];

      while (attempts < maxAttempts) {
        try {
          const modelName = modelsToTry[attempts % modelsToTry.length];
          const model = this.genAI.getGenerativeModel({ model: modelName });
          const chat = model.startChat({
            history,
            systemInstruction: {
              role: 'system',
              parts: [{ text: systemPrompt }],
            },
          });
          const result = await chat.sendMessage(message);
          responseText = result.response.text();
          break; // Success
        } catch (error: any) {
          attempts++;
          logger.warn({ err: error.message, attempt: attempts }, 'Gemini API attempt failed');
          if (attempts >= maxAttempts) {
            logger.error({ err: error.message }, 'Chatbot error after all retries');
            responseText = "Sorry, I couldn't process your request right now due to high demand. Please try again in a moment.";
            break;
          }
          // Wait 1.5 seconds before retrying
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      logger.info({ messageLength: message.length }, 'Chatbot response generated');

      return {
        message: responseText,
        specialties: specialties.map((s) => ({ id: s.id, name: s.name, nameAr: s.nameAr, nameFr: s.nameFr })),
      };
    } catch (error: any) {
      logger.error({ err: error.message }, 'Chatbot service critical error');
      throw new Error('Failed to generate chatbot response');
    }
  }
}

export const chatbotService = new ChatbotService();
