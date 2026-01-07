
import { GoogleGenAI } from "@google/genai";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const callGemini = async (prompt: string, apiKey: string): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please click the Key icon in the top right to add your Google Gemini API Key.";
  }

  const ai = new GoogleGenAI({ apiKey });
  const maxRetries = 6;
  const baseDelay = 3000;
  let lastError: any = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || "No response generated.";
    } catch (error: any) {
      lastError = error;
      const errorStr = error.toString();
      
      // Fatal errors
      if (errorStr.includes("403") || errorStr.includes("API_KEY_INVALID")) {
        return "Invalid API Key. Please click the Key icon in the top right to verify your settings.";
      }

      // Retryable errors (Quota or Server)
      const isQuotaError = errorStr.includes("429") || errorStr.toLowerCase().includes("quota");
      const isServerError = errorStr.includes("503") || errorStr.includes("500");

      if (isQuotaError || isServerError) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`Attempt ${attempt + 1} failed (${isQuotaError ? 'Quota' : 'Server'}). Retrying in ${delay}ms...`);
        
        if (attempt < maxRetries - 1) {
          await wait(delay);
          continue;
        }
      }
      break;
    }
  }

  const errorStr = lastError?.toString() || "";
  if (errorStr.includes("429") || errorStr.toLowerCase().includes("quota")) {
      return "⚠️ API Quota exceeded. The free tier has strict limits (often 15 requests per minute).\n\nPlease wait 60 seconds before trying again, or consider using a paid API key from a billing-enabled project (https://ai.google.dev/gemini-api/docs/billing).";
  }
  
  if (errorStr.includes("503") || errorStr.includes("500")) {
      return "The AI service is currently overloaded or unavailable. Please try again in a few minutes.";
  }

  return `Analysis failed: ${lastError?.message || "An unknown error occurred"}. Check the browser console for details.`;
};

export const translateText = async (sourceText: string, targetLanguage: string, apiKey: string): Promise<string> => {
  if (!sourceText.trim()) return "Error: Source text is empty.";
  const prompt = `Translate the following English text into ${targetLanguage}. Provide ONLY the translation without any explanation or quotes: "${sourceText}"`;
  return callGemini(prompt, apiKey);
};

export const analyzeWordByWord = async (sourceText: string, targetText: string, targetLanguage: string, apiKey: string): Promise<string> => {
  if (!sourceText.trim() || !targetText.trim()) return "Error: Source and target text required.";
  const prompt = `
    Provide a word-by-word or phrase-by-phrase breakdown of this translation from English to ${targetLanguage}.
    
    English: "${sourceText}"
    ${targetLanguage}: "${targetText}"
    
    IMPORTANT: Output ONLY a Markdown table with the following columns:
    | English | ${targetLanguage} | Role/Note |
    
    Do not include any introductory text, only the table.
  `;
  return callGemini(prompt, apiKey);
};

export const analyzeTranslation = async (
  sourceText: string,
  targetText: string,
  targetLanguage: string,
  apiKey: string
): Promise<string> => {
  if (!sourceText.trim() || !targetText.trim()) {
    return "Please provide both source and target text for analysis.";
  }

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
  return callGemini(prompt, apiKey);
};
