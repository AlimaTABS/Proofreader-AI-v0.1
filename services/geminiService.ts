import { GoogleGenAI } from "@google/genai";

export const analyzeTranslation = async (
  sourceText: string,
  targetText: string,
  targetLanguage: string,
  apiKey: string
): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please click the Key icon in the top right to add your Google Gemini API Key.";
  }

  if (!sourceText.trim() || !targetText.trim()) {
    return "Please provide both source and target text for analysis.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Target Language: ${targetLanguage}
      
      English Source: "${sourceText}"
      
      Target Translation: "${targetText}"
      
      Task: Compare the English text to the Target text. 
      Identify: 
      1) Missing words/sentences
      2) Wrong terminology (e.g., if 'Church' was translated as 'Mosque')
      3) Meaning contradictions. 
      
      Provide the output in a clear bullet-point format. If there are no issues, state "No significant errors found."
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "No response generated.";
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    if (error.toString().includes("403") || error.toString().includes("API_KEY_INVALID")) {
        return "Invalid API Key. Please check your key in the settings.";
    }
    return "An error occurred during AI analysis. Please check console for details.";
  }
};