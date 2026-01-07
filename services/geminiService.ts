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
  targetLanguage: string,
  apiKey: string
): Promise<AnalysisResult | string> => {
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
      
      Tasks:
      1. FEEDBACK: Compare meaning, omissions, and terminology. Provide a concise bulleted audit.
      2. BREAKDOWN: Provide a detailed word-by-word or phrase-by-phrase breakdown. 
      
      CRITICAL: For the "context" field in the breakdown, provide specific grammatical details:
      - Part of speech (Noun, Verb, Adjective, etc.)
      - Number (Singular/Plural)
      - Person (First, Second, Third)
      - Tense/Aspect (Present, Past, Continuous, etc.)
      - Case/Gender where applicable.
      
      Example for Turkish "seviyorum": "First-person singular present continuous form of the verb 'sevmek' (to love)."
      Example for French "le": "Masculine singular definite article."
      
      Format the response as a JSON object.
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
              description: "Audit feedback.",
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

    const result = JSON.parse(response.text || "{}");
    return result as AnalysisResult;
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    return "An error occurred during AI analysis. Please check your API key and try again.";
  }
};