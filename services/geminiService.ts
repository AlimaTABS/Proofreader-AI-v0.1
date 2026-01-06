import { GoogleGenAI } from "@google/genai";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

  // Create a new instance for each call to ensure the latest key is used
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

  let lastError: any = null;
  // Increase retries to 6 to handle standard 1-minute quota windows better
  const maxRetries = 6;
  // Start with a 3-second delay for more breathing room on free tiers
  const baseDelay = 3000;

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
      
      // Check for fatal errors that shouldn't be retried
      if (errorStr.includes("403") || errorStr.includes("API_KEY_INVALID")) {
        return "Invalid API Key. Please click the Key icon in the top right to verify your settings.";
      }

      // 429 = Too Many Requests (Quota), 503 = Service Unavailable
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

      // If it's another type of error or we are out of retries, stop
      break;
    }
  }

  console.error("Gemini Analysis Error after retries:", lastError);
  
  const errorStr = lastError?.toString() || "";
  
  if (errorStr.includes("429") || errorStr.toLowerCase().includes("quota")) {
      return "⚠️ API Quota exceeded. The free tier has strict limits (often 15 requests per minute).\n\nPlease wait 60 seconds before trying again, or consider using a paid API key from a billing-enabled project (https://ai.google.dev/gemini-api/docs/billing).";
  }
  
  if (errorStr.includes("503") || errorStr.includes("500")) {
      return "The AI service is currently overloaded or unavailable. Please try again in a few minutes.";
  }

  return `Analysis failed: ${lastError?.message || "An unknown error occurred"}. Check the browser console for details.`;
};
