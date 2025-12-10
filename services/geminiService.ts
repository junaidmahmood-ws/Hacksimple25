import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const askFinancialAdvisor = async (query: string): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please configure process.env.API_KEY to use the smart search feature.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a helpful, concise financial assistant embedded in a wealth management dashboard. 
      The user is asking: "${query}". 
      Provide a brief, helpful answer (max 3 sentences) suitable for a dashboard tooltip or modal. 
      Do not give financial advice, just general information or navigation help.`,
    });
    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the financial brain right now.";
  }
};
