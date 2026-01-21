
import { GoogleGenAI } from "@google/genai";

// Initialize the GoogleGenAI client using the API key from environment variables as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSalesInsights = async (ordersData: any[]) => {
  try {
    const prompt = `Analyze the following sales data for IslandLink Distribution and provide a short executive summary (3-4 sentences) on performance and a recommendation for stock balancing: ${JSON.stringify(ordersData)}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a senior supply chain analyst for ISDN. Provide concise, data-driven insights."
      }
    });

    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Insights unavailable. Please check connectivity.";
  }
};
