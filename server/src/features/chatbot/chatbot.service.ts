import prisma from '../../shared/database';
import logger from '../../shared/utils/logger';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

export class ChatbotService {
  async askQuestion(message: string, conversationHistory: { role: string; content: string }[] = []) {
    try {
      if (!GROQ_API_KEY) {
        logger.warn('GROQ_API_KEY is missing');
        return {
          message: "Sorry, the AI chatbot is currently offline because the GROQ_API_KEY is missing.",
          specialties: [],
        };
      }

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
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      const messages = [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: message }
      ];

      let responseText = '';
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${GROQ_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: messages,
              temperature: 0.7,
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Groq API Error: ${response.status} ${errorText}`);
          }

          const data = (await response.json()) as any;
          responseText = data.choices[0].message.content;
          break; // Success
        } catch (error: any) {
          attempts++;
          logger.warn({ err: error.message, attempt: attempts }, 'Groq API attempt failed');
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
