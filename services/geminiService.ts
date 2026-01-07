import { GoogleGenAI, Type } from "@google/genai";

export interface AnalysisResult {
  feedback: string;
  wordBreakdown: Array<{
    targetWord: string;
    sourceEquivalent: string;
    context: string;
  }>;
}

export const analyzeTranslation = async (
  sourceText: string,
  targetText: string,
  targetLanguage: string
): Promise<AnalysisResult | string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return "System Error: API Configuration missing.";
  }

  if (!sourceText.trim() || !targetText.trim()) {
    return "Please provide both source and target text for analysis.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are an expert linguistic auditor performing a high-precision Translation Quality Audit (TQA).
      
      Target Language: ${targetLanguage}
      Source (English): "${sourceText}"
      Target Translation: "${targetText}"
      
      Tasks:
      1. CRITICAL AUDIT: Identify any of the following issues that contradict the English source text:
         - Missing Content: Skip words, phrases, or punctuation that alter intent.
         - Terminology Errors: Use of incorrect or inappropriate terms for the target language context.
         - Shifts in Meaning: Nuance changes, incorrect tone, or semantic drifting that misrepresents the source.
         - Summarize these findings in concise bullet points. If perfect, confirm accuracy.

      2. GRANULAR BREAKDOWN: Provide a word-by-word mapping of the target text to English equivalents.
         - For each word, explain the grammatical context (e.g., "Noun, plural", "1st person singular verb", "Direct object marker").

      Return results strictly as a JSON object.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: { 
              type: Type.STRING,
              description: "The audit summary focusing on missing content, terminology, and meaning shifts."
            },
            wordBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  targetWord: { type: Type.STRING },
                  sourceEquivalent: { type: Type.STRING },
                  context: { type: Type.STRING },
                },
                required: ["targetWord", "sourceEquivalent", "context"],
              },
            },
          },
          required: ["feedback", "wordBreakdown"],
        },
      },
    });

    const result = response.text;
    if (!result) throw new Error("No response from AI");
    
    return JSON.parse(result) as AnalysisResult;
  } catch (error: any) {
    console.error("Analysis Error:", error);
    return "An error occurred during linguistic analysis. Please verify your connection and try again.";
  }
};