import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { SegmentList } from './components/SegmentList';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Segment, SegmentStatus, SegmentCategory } from './types';
import { DEFAULT_SEGMENTS } from './constants';
import { analyzeTranslation, AnalysisResult } from './services/geminiService';

const generateId = () => Math.random().toString(36).substring(2, 9);

const STORAGE_KEY = 'bilingual_proofreader_data_v1';
const LANGUAGE_KEY = 'bilingual_proofreader_lang_v1';
const API_KEY_STORAGE = 'bilingual_proofreader_api_key';

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
        console.error("Failed to parse saved segments", e);
      }
    }
    return DEFAULT_SEGMENTS.map(s => ({ 
      ...s, 
      status: s.status as SegmentStatus, 
      category: s.category as SegmentCategory 
    }));
  });

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
    setSegments(prev => [...prev, newSegment]);
  };

  const clearAllSegments = () => {
    if (window.confirm('Clear all segments? This action cannot be undone.')) {
      setSegments([]);
    }
  };

  const updateSegment = useCallback((id: string, updates: Partial<Segment>) => {
    setSegments(prev => prev.map(seg => 
      seg.id === id ? { ...seg, ...updates } : seg
    ));
  }, []);

  const deleteSegment = useCallback((id: string) => {
    setSegments(prev => prev.filter(seg => seg.id !== id));
  }, []);

  const runAnalysis = useCallback(async (id: string) => {
    const segment = segments.find(s => s.id === id);
    if (!segment) return;

    if (!apiKey) {
      setIsSettingsOpen(true);
      return;
    }

    updateSegment(id, { isAnalyzing: true, aiFeedback: null, wordBreakdown: [] });

    const result = await analyzeTranslation(
      segment.sourceText,
      segment.targetText,
      targetLanguage,
      apiKey
    );

    if (typeof result === 'string') {
        updateSegment(id, { 
            isAnalyzing: false, 
            aiFeedback: result,
            status: SegmentStatus.Reviewed
        });
    } else {
        const analysis = result as AnalysisResult;
        updateSegment(id, { 
            isAnalyzing: false, 
            aiFeedback: analysis.feedback,
            wordBreakdown: analysis.wordBreakdown,
            status: SegmentStatus.Reviewed
        });
    }
  }, [segments, targetLanguage, apiKey, updateSegment]);

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
