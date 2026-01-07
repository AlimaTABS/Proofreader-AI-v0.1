
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { SegmentList } from './components/SegmentList';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Segment, SegmentStatus, SegmentCategory } from './types';
import { DEFAULT_SEGMENTS } from './constants';
import { analyzeTranslation, translateText, analyzeWordByWord } from './services/geminiService';

const generateId = () => Math.random().toString(36).substring(2, 9);
const STORAGE_KEY = 'bilingual_proofreader_data_v1';
const LANGUAGE_KEY = 'bilingual_proofreader_lang_v1';
const API_KEY_STORAGE = 'bilingual_proofreader_api_key';

const App: React.FC = () => {
  // 1. Core State
  const [apiKey, setApiKey] = useState<string>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem(API_KEY_STORAGE) || '';
    return '';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<string>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem(LANGUAGE_KEY) || 'French';
    return 'French';
  });

  const [segments, setSegments] = useState<Segment[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to load project state", e);
        }
      }
    }
    return DEFAULT_SEGMENTS;
  });

  // 2. Persistence Side Effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(segments));
  }, [segments]);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, targetLanguage);
  }, [targetLanguage]);

  // 3. Handlers & AI Logic
  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem(API_KEY_STORAGE, key);
  };

  const updateSegment = useCallback((id: string, updates: Partial<Segment>) => {
    setSegments(prev => prev.map(seg => 
      seg.id === id ? { ...seg, ...updates } as Segment : seg
    ));
  }, []);

  const handleTranslate = useCallback(async (id: string) => {
    const segment = segments.find(s => s.id === id);
    if (!segment || !apiKey) {
      if (!apiKey) setIsSettingsOpen(true);
      return;
    }

    updateSegment(id, { isTranslating: true });
    try {
      const translation = await translateText(segment.sourceText, targetLanguage, apiKey);
      updateSegment(id, { targetText: translation, isTranslating: false });
    } catch (e) {
      updateSegment(id, { isTranslating: false });
    }
  }, [segments, apiKey, targetLanguage, updateSegment]);

  const handleRunWordAnalysis = useCallback(async (id: string) => {
    const segment = segments.find(s => s.id === id);
    if (!segment || !apiKey) {
      if (!apiKey) setIsSettingsOpen(true);
      return;
    }

    updateSegment(id, { isAnalyzingWords: true });
    try {
      const analysis = await analyzeWordByWord(segment.sourceText, segment.targetText, targetLanguage, apiKey);
      updateSegment(id, { wordByWord: analysis, isAnalyzingWords: false });
    } catch (e) {
      updateSegment(id, { isAnalyzingWords: false });
    }
  }, [segments, apiKey, targetLanguage, updateSegment]);

  const runAnalysis = useCallback(async (id: string) => {
    const segment = segments.find(s => s.id === id);
    if (!segment || !apiKey) {
      if (!apiKey) setIsSettingsOpen(true);
      return;
    }

    updateSegment(id, { isAnalyzing: true, aiFeedback: null });
    try {
      const feedback = await analyzeTranslation(segment.sourceText, segment.targetText, targetLanguage, apiKey);
      updateSegment(id, { isAnalyzing: false, aiFeedback: feedback, status: SegmentStatus.Reviewed });
    } catch (e) {
      updateSegment(id, { isAnalyzing: false });
    }
  }, [segments, targetLanguage, apiKey, updateSegment]);

  const addSegment = () => {
    setSegments(prev => [...prev, {
      id: generateId(),
      sourceText: '',
      targetText: '',
      status: SegmentStatus.Pending,
      category: SegmentCategory.None,
      aiFeedback: null,
      wordByWord: null,
      isAnalyzing: false,
      isTranslating: false,
      isAnalyzingWords: false
    }]);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-50 selection:bg-indigo-100">
      <Header 
        selectedLanguage={targetLanguage} 
        onLanguageChange={(lang) => setTargetLanguage(lang)} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasApiKey={!!apiKey}
      />
      
      <main className="flex-grow">
        <SegmentList
          segments={segments}
          targetLanguage={targetLanguage}
          onUpdate={updateSegment}
          onDelete={(id) => setSegments(prev => prev.filter(s => s.id !== id))}
          onRunAnalysis={runAnalysis}
          onTranslate={handleTranslate}
          onRunWordAnalysis={handleRunWordAnalysis}
          onAddSegment={addSegment}
        />
      </main>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
             © {new Date().getFullYear()} Shepherds Global Classroom
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
