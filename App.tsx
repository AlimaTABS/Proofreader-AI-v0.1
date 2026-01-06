import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { SegmentList } from './components/SegmentList';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Segment, SegmentStatus, SegmentCategory } from './types';
import { DEFAULT_SEGMENTS } from './constants';
import { analyzeTranslation } from './services/geminiService';

const generateId = () => Math.random().toString(36).substring(2, 9);

const STORAGE_KEY = 'bilingual_proofreader_data_v1';
const LANGUAGE_KEY = 'bilingual_proofreader_lang_v1';
const API_KEY_STORAGE = 'bilingual_proofreader_api_key';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const is429 = (e: any) => {
  const msg = String(e?.message ?? e).toLowerCase();
  return (
    e?.status === 429 ||
    msg.includes('429') ||
    msg.includes('too many') ||
    msg.includes('quota') ||
    msg.includes('rate')
  );
};

async function with429Backoff<T>(fn: () => Promise<T>): Promise<T> {
  let delay = 1000;
  for (let i = 0; i < 4; i++) {
    try {
      return await fn();
    } catch (e: any) {
      if (!is429(e)) throw e;
      await sleep(delay);
      delay *= 2; // 1s, 2s, 4s, 8s
    }
  }
  throw new Error('Rate limited. Please wait 30–60 seconds and try again.');
}

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem(API_KEY_STORAGE) || '';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem(API_KEY_STORAGE, key);
  };

  const [targetLanguage, setTargetLanguage] = useState<string>(() => {
    return localStorage.getItem(LANGUAGE_KEY) || 'French';
  });

  const [segments, setSegments] = useState<Segment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved segments', e);
      }
    }
    return DEFAULT_SEGMENTS.map((s) => ({
      ...s,
      status: s.status as SegmentStatus,
      category: s.category as SegmentCategory,
    }));
  });

  // Persist segments/language
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(segments));
  }, [segments]);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, targetLanguage);
  }, [targetLanguage]);

  const handleLanguageChange = (lang: string) => {
    setTargetLanguage(lang);
  };

  const addSegment = () => {
    const newSegment: Segment = {
      id: generateId(),
      sourceText: '',
      targetText: '',
      status: SegmentStatus.Pending,
      category: SegmentCategory.None,
      aiFeedback: null,
      isAnalyzing: false,
    };
    setSegments((prev) => [...prev, newSegment]);
  };

  const clearAllSegments = () => {
    if (window.confirm('Clear all segments? This action cannot be undone.')) {
      setSegments([]);
    }
  };

  const updateSegment = useCallback((id: string, updates: Partial<Segment>) => {
    setSegments((prev) => prev.map((seg) => (seg.id === id ? { ...seg, ...updates } : seg)));
  }, []);

  const deleteSegment = useCallback((id: string) => {
    setSegments((prev) => prev.filter((seg) => seg.id !== id));
  }, []);

  // --- Anti-spam / rate-limit protection ---
  const segmentsRef = useRef<Segment[]>(segments);
  useEffect(() => {
    segmentsRef.current = segments;
  }, [segments]);

  // Serialize all API calls (prevents parallel requests)
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const lastCallRef = useRef<number>(0);

  // Prevent repeated clicks on same segment while queued/running
  const inFlightIdsRef = useRef<Set<string>>(new Set());

  const runAnalysis = useCallback(
    async (id: string) => {
      if (!apiKey) {
        setIsSettingsOpen(true);
        return;
      }

      if (inFlightIdsRef.current.has(id)) return;
      inFlightIdsRef.current.add(id);

      // Immediately show loading UI
      updateSegment(id, { isAnalyzing: true, aiFeedback: null });

      // Add this analysis to the global queue so calls run one-by-one
      queueRef.current = queueRef.current
        .then(async () => {
          // Throttle: ensure at least ~1.2s between calls
          const now = Date.now();
          const wait = Math.max(0, 1200 - (now - lastCallRef.current));
          if (wait > 0) await sleep(wait);
          lastCallRef.current = Date.now();

          // Re-read the latest segment data at execution time (avoid stale text)
          const seg = segmentsRef.current.find((s) => s.id === id);
          if (!seg) {
            updateSegment(id, {
              isAnalyzing: false,
              aiFeedback: 'Segment not found.',
              status: SegmentStatus.Pending,
            });
            return;
          }

          if (!seg.sourceText.trim() || !seg.targetText.trim()) {
            updateSegment(id, {
              isAnalyzing: false,
              aiFeedback: 'Please fill both Source and Target text first.',
              status: SegmentStatus.Pending,
            });
            return;
          }

          try {
            const feedback = await with429Backoff(() =>
              analyzeTranslation(seg.sourceText, seg.targetText, targetLanguage, apiKey)
            );

            updateSegment(id, {
              isAnalyzing: false,
              aiFeedback: feedback,
              status: SegmentStatus.Reviewed,
            });
          } catch (err: any) {
            updateSegment(id, {
              isAnalyzing: false,
              aiFeedback: String(err?.message ?? err),
              status: SegmentStatus.Pending,
            });
          }
        })
        .catch(() => {
          // Keep the queue alive even if something unexpected happens
        })
        .finally(() => {
          inFlightIdsRef.current.delete(id);
        });

      await queueRef.current;
    },
    [apiKey, targetLanguage, updateSegment]
  );

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Header
        selectedLanguage={targetLanguage}
        onLanguageChange={handleLanguageChange}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasApiKey={!!apiKey}
      />

      <main className="flex-grow">
        <SegmentList
          segments={segments}
          targetLanguage={targetLanguage}
          onUpdate={updateSegment}
          onDelete={deleteSegment}
          onRunAnalysis={runAnalysis}
          onAddSegment={addSegment}
          onClearAll={clearAllSegments}
        />
      </main>

      <footer className="bg-white border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} The Bilingual Proofreader • AI Powered Quality Control
          </p>
        </div>
      </footer>

      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveApiKey}
        currentKey={apiKey}
      />
    </div>
  );
};

export default App;
