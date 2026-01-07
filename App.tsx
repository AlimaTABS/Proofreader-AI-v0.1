import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { SegmentList } from './components/SegmentList';
import { Segment, SegmentStatus, SegmentCategory } from './types';
import { DEFAULT_SEGMENTS } from './constants';
import { analyzeTranslation, analyzeWordByWord } from './services/geminiService';

const generateId = () => Math.random().toString(36).substring(2, 9);
const STORAGE_KEY = 'bilingual_proofreader_v9';
const LANGUAGE_KEY = 'bilingual_lang_v9';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const App: React.FC = () => {
  const [targetLanguage, setTargetLanguage] = useState<string>(() => {
    return localStorage.getItem(LANGUAGE_KEY) || 'French';
  });

  const [segments, setSegments] = useState<Segment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Load failed', e);
      }
    }
    return DEFAULT_SEGMENTS;
  });

  // Persist segments and language preferences
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(segments));
  }, [segments]);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, targetLanguage);
  }, [targetLanguage]);

  // Use refs for queuing to avoid stale closures in serialized calls
  const segmentsRef = useRef<Segment[]>(segments);
  useEffect(() => {
    segmentsRef.current = segments;
  }, [segments]);

  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const lastCallRef = useRef<number>(0);
  const inFlightIdsRef = useRef<Set<string>>(new Set());

  const updateSegment = useCallback((id: string, updates: Partial<Segment>) => {
    setSegments((prev) => prev.map((seg) => (seg.id === id ? { ...seg, ...updates } as Segment : seg)));
  }, []);

  const runAnalysis = useCallback(async (id: string) => {
    if (inFlightIdsRef.current.has(id)) return;
    inFlightIdsRef.current.add(id);

    // Immediate feedback
    updateSegment(id, { isAnalyzing: true, aiFeedback: null });

    // Serialize calls to prevent hitting rate limits simultaneously
    queueRef.current = queueRef.current
      .then(async () => {
        // Ensure ~1s spacing between calls
        const now = Date.now();
        const waitTime = Math.max(0, 1000 - (now - lastCallRef.current));
        if (waitTime > 0) await sleep(waitTime);
        lastCallRef.current = Date.now();

        const seg = segmentsRef.current.find((s) => s.id === id);
        if (!seg || !seg.sourceText.trim() || !seg.targetText.trim()) {
            updateSegment(id, { isAnalyzing: false });
            return;
        }

        try {
          const feedback = await analyzeTranslation(seg.sourceText, seg.targetText, targetLanguage);
          updateSegment(id, {
            isAnalyzing: false,
            aiFeedback: feedback,
            status: SegmentStatus.Reviewed,
          });
        } catch (err: any) {
          updateSegment(id, { isAnalyzing: false, aiFeedback: "Analysis failed. Please try again later." });
        }
      })
      .finally(() => {
        inFlightIdsRef.current.delete(id);
      });
  }, [targetLanguage, updateSegment]);

  const handleRunWordAnalysis = useCallback(async (id: string) => {
    const segment = segments.find(s => s.id === id);
    if (!segment || !segment.targetText) return;
    
    updateSegment(id, { isAnalyzingWords: true });
    try {
      const analysis = await analyzeWordByWord(segment.sourceText, segment.targetText, targetLanguage);
      updateSegment(id, { wordByWord: analysis, isAnalyzingWords: false });
    } catch (e) {
      updateSegment(id, { isAnalyzingWords: false });
    }
  }, [segments, targetLanguage, updateSegment]);

  const addSegment = () => {
    setSegments((prev) => [
      ...prev,
      {
        id: generateId(),
        sourceText: '',
        targetText: '',
        status: SegmentStatus.Pending,
        category: SegmentCategory.None,
        aiFeedback: null,
        wordByWord: null,
        isAnalyzing: false,
        isAnalyzingWords: false,
      },
    ]);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50 selection:bg-indigo-100">
      <Header 
        selectedLanguage={targetLanguage} 
        onLanguageChange={setTargetLanguage} 
      />
      
      <main className="flex-grow">
        <SegmentList
          segments={segments}
          targetLanguage={targetLanguage}
          onUpdate={updateSegment}
          onDelete={(id) => setSegments((prev) => prev.filter((s) => s.id !== id))}
          onRunAnalysis={runAnalysis}
          onRunWordAnalysis={handleRunWordAnalysis}
          onAddSegment={addSegment}
        />
      </main>

      <footer className="bg-white border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} Shepherds Global Classroom
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
