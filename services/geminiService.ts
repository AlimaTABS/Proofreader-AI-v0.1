
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
      
      if (errorStr.includes("403") || errorStr.includes("API_KEY_INVALID")) {
        return "Invalid API Key. Please click the Key icon in the top right to verify your settings.";
      }

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
      return "⚠️ API Quota exceeded. The free tier has strict limits (often 15 requests per minute).\n\nPlease wait 60 seconds before trying again, or use a paid API key.";
  }
  
  if (errorStr.includes("503") || errorStr.includes("500")) {
      return "The AI service is currently overloaded or unavailable. Please try again in a few minutes.";
  }

  return `Analysis failed: ${lastError?.message || "An unknown error occurred"}.`;
};

export const translateText = async (sourceText: string, targetLanguage: string, apiKey: string): Promise<string> => {
  if (!sourceText.trim()) return "Error: Source text is empty.";
  const prompt = `Translate the following English text into ${targetLanguage}. Provide ONLY the translation without any explanation or quotes: "${sourceText}"`;
  return callGemini(prompt, apiKey);
};

export const analyzeWordByWord = async (sourceText: string, targetText: string, targetLanguage: string, apiKey: string): Promise<string> => {
  if (!sourceText.trim() || !targetText.trim()) return "Error: Source and target text required.";
  const prompt = `
    Analyze the following ${targetLanguage} sentence by breaking it down into individual words or phrases.
    
    ${targetLanguage} Sentence: "${targetText}"
    English Context: "${sourceText}"
    
    TASK: Create a literal breakdown. For every word in the ${targetLanguage} sentence, provide its English equivalent.
    Example for Turkish "Ben seni çok seviyorum":
    | Turkish Word | English Equivalent | Role/Grammar |
    | Ben | I | Pronoun |
    | seni | you | Pronoun (Accusative) |
    | çok | very | Adverb |
    | seviyorum | love | Verb (Present Continuous) |

    IMPORTANT: Output ONLY a Markdown table with these columns:
    | ${targetLanguage} Word | English Equivalent | Context/Notes |
  `;
  return callGemini(prompt, apiKey);
};

export const analyzeTranslation = async (
  sourceText: string,
  targetText: string,
  targetLanguage: string,
  apiKey: string
): Promise<string> => {
  if (!sourceText.trim() || !targetText.trim()) return "Please provide both texts for analysis.";
  const prompt = `
      Target Language: ${targetLanguage}
      English Source: "${sourceText}"
      Target Translation: "${targetText}"
      
      Compare the English text to the Target text. Identify missing words, wrong terminology, or meaning contradictions. Provide bullet points.
    `;
  return callGemini(prompt, apiKey);
};

