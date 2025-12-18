import { GoogleGenAI } from "@google/genai";
import { GeminiResponse } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeImage = async (file: File): Promise<GeminiResponse> => {
  try {
    const base64Data = await fileToBase64(file);

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data,
            },
          },
          {
            text: `Analyze this image for Adobe Stock metadata.
            
            Return ONLY a valid JSON object with this exact structure:
            {
              "title": "A full sentence commercially viable title (max 200 chars)",
              "tags": ["tag1", "tag2", ... exactly 47 tags]
            }

            Requirements:
            1. Title: Descriptive, commercial, full sentence.
            2. Keywords: EXACTLY 47 unique tags. Lowercase.
            3. Do not include Markdown formatting like \`\`\`json. Just the raw JSON.`,
          },
        ],
      },
      // Removed strict responseSchema/responseMimeType to avoid "JSON mode not enabled" errors
      config: {
        temperature: 0.4,
      },
    });

    if (response.text) {
      let cleanText = response.text.trim();
      // Clean up markdown if the model adds it despite instructions
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\n?/, '').replace(/```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\n?/, '').replace(/```$/, '');
      }

      const data = JSON.parse(cleanText) as GeminiResponse;
      
      return {
        title: data.title || "Untitled Image",
        tags: Array.isArray(data.tags) ? data.tags.slice(0, 50) : [],
      };
    } else {
        throw new Error("No response text from Gemini");
    }

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};