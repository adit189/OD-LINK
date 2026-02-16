import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export const generateSmartBio = async (name: string, keywords: string): Promise<string> => {
  if (!API_KEY) return "AI unavailable. Please add API key.";

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const prompt = `
      Write a short, engaging social media bio for "${name}".
      Keywords/Vibe: ${keywords}.
      Keep it under 150 characters. Emoji friendly. 
      Return ONLY the bio text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate bio");
  }
};

export const suggestLinkTitle = async (url: string): Promise<string> => {
  if (!API_KEY) return "";

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest a short, clean button title (max 3 words) for this URL: ${url}. Return ONLY the title.`,
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.warn("Gemini Title Error", error);
    return "";
  }
};
