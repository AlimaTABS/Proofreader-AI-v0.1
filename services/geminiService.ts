import { GoogleGenAI, Type } from "@google/genai";

export interface AnalysisResult {
  feedback: string;
  wordBreakdown: Array<{
    targetWord: string;
    sourceEquivalent: string;
    context: string;
  }>;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function getStatusCode(err: any): number | undefined {
  return err?.code || err?.status || err?.error?.code || err?.response?.status;
}

function isQuotaError(err: any): boolean {
  const code = getStatusCode(err);
  const msg = String(err?.message || err?.error?.message || "");
  return code === 429 || msg.includes("RESOURCE_EXHAUSTED") || msg.toLowerCase().includes("quota");
}

export const analyzeTranslation = async (
  sourceText: string,
  targetText: string,
  targetLanguage: string,
  apiKey: string
): Promise<AnalysisResult | string> => {
  if (!apiKey?.trim()) {
    return "API Key is missing. Please click the Key icon to add your Google Gemini API Key.";
  }

  if (!sourceText.trim() || !targetText.trim()) {
    return "Please provide both source and target text for analysis.";
  }

  const ai = new GoogleGenAI({ apiKey });

  // Shorter prompt saves tokens/quota
  const prompt = `
You are an LQA expert.

Target language: ${targetLanguage}
Source (EN): ${JSON.stringify(sourceText.trim())}
Target: ${JSON.stringify(targetText.trim())}

Return JSON with:
- feedback (string): concise bullet audit (meaning, omissions, terminology).
- wordBreakdown (array): { targetWord, sourceEquivalent, context }
context must include grammar info (POS, number, person, tense/aspect, case/gender if applicable).
`.trim();

  const runOnce = async (): Promise<AnalysisResult> => {
    const response = await ai.models.generateContent({
      // Flash is cheaper and helps reduce 429 frequency
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: { type: Type.STRING },
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

    const text = response.text || "{}";
    return JSON.parse(text) as AnalysisResult;
  };

  const maxRetries = 3;
  let lastErr: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await runOnce();
    } catch (err: any) {
      lastErr = err;

      if (isQuotaError(err) && attempt < maxRetries) {
        // exponential backoff: 3s, 6s, 12s...
        const delay = 3000 * Math.pow(2, attempt);
        await wait(delay);
        continue;
      }

      break;
    }
  }

  const code = getStatusCode(lastErr);
  if (code === 429 || isQuotaError(lastErr)) {
    return "⚠️ API quota/rate limit hit (429). Please wait 30–60 seconds and try again, or use a billing-enabled key.";
  }

  return `Analysis failed: ${String(lastErr?.message || lastErr)}`;
};
