import { GoogleGenAI } from "@google/genai";

export const analyzeTranslation = async (
  sourceText: string,
  targetText: string,
  targetLanguage: string,
  apiKey: string
): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please click the 'Set API Key' button in the header.";
  }

  if (!sourceText.trim() || !targetText.trim()) {
    return "Please provide both source and target text for analysis.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are a professional linguistic quality assurance (LQA) expert.
      
      Target Language: ${targetLanguage}
      English Source: "${sourceText}"
      Target Translation: "${targetText}"
      
      Task: Perform a deep semantic audit. Compare the English source text to the ${targetLanguage} translation.
      
      Evaluate based on:
      1. Accuracy: Does it convey the exact same meaning?
      2. Omissions: Are any words or concepts missing?
      3. Terminology: Is the vocabulary appropriate and accurate?
      4. Tone & Style: Is the register maintained?
      
      Provide a concise summary of issues in bullet points. If the translation is excellent, say: "No issues found. The translation accurately reflects the source."
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    return response.text || "The model returned an empty response. Please try again.";
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    const errorMsg = error.toString();
    if (errorMsg.includes("403") || errorMsg.includes("API_KEY_INVALID")) {
        return "Invalid API Key. Please update your key in the settings.";
    }
    if (errorMsg.includes("quota")) {
        return "API Quota exceeded. Please wait a moment before trying again.";
    }
    return "An error occurred during AI analysis. Please ensure your API key is correct and try again.";
  }
};