import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { SegmentList } from './components/SegmentList';
import { Segment, SegmentStatus, SegmentCategory } from './types';
import { DEFAULT_SEGMENTS } from './constants';
import { analyzeTranslation, analyzeWordByWord } from './services/geminiService';

const generateId = () => Math.random().toString(36).substring(2, 9);
const STORAGE_KEY = 'bilingual_proofreader_v5';
const LANGUAGE_KEY = 'bilingual_lang_v5';

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
        console.error("Load failed", e);
      }
    }
    return DEFAULT_SEGMENTS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(segments));
  }, [segments]);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, targetLanguage);
  }, [targetLanguage]);

  const updateSegment = useCallback((id: string, updates: Partial<Segment>) => {
    setSegments(prev => prev.map(seg => 
      seg.id === id ? { ...seg, ...updates } as Segment : seg
    ));
  }, []);

  const handleRunWordAnalysis = useCallback(async (id: string) => {
    const segment = segments.find(s => s.id === id);
    if (!segment) return;
    updateSegment(id, { isAnalyzingWords: true });
    try {
      const analysis = await analyzeWordByWord(segment.sourceText, segment.targetText, targetLanguage);
      updateSegment(id, { wordByWord: analysis, isAnalyzingWords: false });
    } catch (e) {
      updateSegment(id, { isAnalyzingWords: false });
    }
  }, [segments, targetLanguage, updateSegment]);

  const runAnalysis = useCallback(async (id: string) => {
    const segment = segments.find(s => s.id === id);
    if (!segment) return;
    updateSegment(id, { isAnalyzing: true, aiFeedback: null });
    try {
      const feedback = await analyzeTranslation(segment.sourceText, segment.targetText, targetLanguage);
      updateSegment(id, { isAnalyzing: false, aiFeedback: feedback, status: SegmentStatus.Reviewed });
    } catch (e) {
      updateSegment(id, { isAnalyzing: false });
    }
  }, [segments, targetLanguage, updateSegment]);

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
      isAnalyzingWords: false
    }]);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-50 selection:bg-indigo-100">
      <Header 
        selectedLanguage={targetLanguage} 
        onLanguageChange={setTargetLanguage} 
      />
      
      <main className="flex-grow">
        <SegmentList
          segments={segments}
          targetLanguage={targetLanguage}
          onUpdate={updateSegment}
          onDelete={(id) => setSegments(prev => prev.filter(s => s.id !== id))}
          onRunAnalysis={runAnalysis}
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
    </div>
  );
};

export default App;
