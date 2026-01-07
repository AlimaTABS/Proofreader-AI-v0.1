import { GoogleGenAI } from "@google/genai";

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const callGemini = async (prompt: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return "API Configuration Error: API Key missing.";
  }

  const ai = new GoogleGenAI({ apiKey });
  const maxRetries = 3;
  const baseDelay = 2000;
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
      const isQuotaError = errorStr.includes("429") || errorStr.toLowerCase().includes("quota");
      
      if (isQuotaError && attempt < maxRetries - 1) {
        await wait(baseDelay * Math.pow(2, attempt));
        continue;
      }
      break;
    }
  }

  return `Analysis failed: ${lastError?.message || "An unknown error occurred"}.`;
};

export const analyzeWordByWord = async (sourceText: string, targetText: string, targetLanguage: string): Promise<string> => {
  if (!sourceText.trim() || !targetText.trim()) return "Error: Source and target text required.";
  const prompt = `
    Analyze the following ${targetLanguage} sentence by breaking it down into individual words or phrases.
    
    ${targetLanguage} Sentence: "${targetText}"
    English Context: "${sourceText}"
    
    TASK: Create a literal breakdown table. 
    IMPORTANT: Output ONLY a Markdown table with columns: | ${targetLanguage} Word | English Equivalent | Context/Notes |
  `;
  return callGemini(prompt);
};

export const analyzeTranslation = async (
  sourceText: string,
  targetText: string,
  targetLanguage: string
): Promise<string> => {
  if (!sourceText.trim() || !targetText.trim()) return "Please provide both texts for analysis.";
  const prompt = `
      Target Language: ${targetLanguage}
      English Source: "${sourceText}"
      Target Translation: "${targetText}"
      
      Compare the English text to the Target text. Identify missing words, wrong terminology, or meaning contradictions. Provide bullet points.
    `;
  return callGemini(prompt);
};
