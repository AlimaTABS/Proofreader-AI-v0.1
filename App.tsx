import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { SegmentList } from './components/SegmentList';
import { ApiKeyModal } from './components/ApiKeyModal';
import { Segment, SegmentStatus, SegmentCategory } from './types';
import { DEFAULT_SEGMENTS } from './constants';
import { analyzeTranslation } from './services/geminiService';

// Simple UUID generator fallback
const generateId = () => Math.random().toString(36).substring(2, 9);

const STORAGE_KEY = 'bilingual_proofreader_data_v1';
const LANGUAGE_KEY = 'bilingual_proofreader_lang_v1';
const API_KEY_STORAGE = 'bilingual_proofreader_api_key';

const App: React.FC = () => {
  // --- API Key Management ---
  const [apiKey, setApiKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(API_KEY_STORAGE) || '';
    }
    return '';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem(API_KEY_STORAGE, key);
  };

  // --- App State ---
  const [targetLanguage, setTargetLanguage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LANGUAGE_KEY);
      return saved || 'French';
    }
    return 'French';
  });

  const [segments, setSegments] = useState<Segment[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved segments", e);
        }
      }
    }
    return DEFAULT_SEGMENTS.map(s => ({ 
      ...s, 
      status: s.status as SegmentStatus, 
      category: s.category as SegmentCategory 
    }));
  });

  // Persist segments whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(segments));
  }, [segments]);

  // Persist language selection
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

  const updateSegment = useCallback((id: string, updates: Partial<Segment>) => {
    setSegments(prev => prev.map(seg => 
      seg.id === id ? { ...seg, ...updates } : seg
    ));
  }, []);

  const deleteSegment = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this segment?')) {
      setSegments(prev => prev.filter(seg => seg.id !== id));
    }
  }, []);

  const runAnalysis = useCallback(async (id: string) => {
    const segment = segments.find(s => s.id === id);
    if (!segment) return;

    if (!apiKey) {
      setIsSettingsOpen(true);
      return;
    }

    updateSegment(id, { isAnalyzing: true, aiFeedback: null });

    const feedback = await analyzeTranslation(
      segment.sourceText,
      segment.targetText,
      targetLanguage,
      apiKey
    );

    updateSegment(id, { 
      isAnalyzing: false, 
      aiFeedback: feedback,
      status: SegmentStatus.Reviewed
    });
  }, [segments, targetLanguage, apiKey, updateSegment]);

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900">
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
        />
      </main>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} The Bilingual Proofreader. Powered by Google Gemini.</p>
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