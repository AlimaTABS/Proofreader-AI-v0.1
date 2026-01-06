import React from 'react';
import { Languages, ShieldCheck, Key } from 'lucide-react';
import { TARGET_LANGUAGES } from '../constants';

interface HeaderProps {
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  onOpenSettings: () => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({ selectedLanguage, onLanguageChange, onOpenSettings, hasApiKey }) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Proofreader</h1>
            <p className="text-xs text-gray-500 font-medium hidden sm:block">AI Quality Control</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${
              hasApiKey 
                ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50' 
                : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 animate-pulse'
            }`}
            title="Configure API Key"
          >
            <Key className="w-4 h-4" />
            <span className="hidden sm:inline">{hasApiKey ? 'API Key' : 'Set API Key'}</span>
          </button>

          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
            <Languages className="w-4 h-4 text-gray-500" />
            <label htmlFor="language-select" className="text-sm font-medium text-gray-700 whitespace-nowrap hidden sm:block">
              Target Language:
            </label>
            <select
              id="language-select"
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent border-none text-sm font-semibold text-gray-900 focus:ring-0 cursor-pointer outline-none"
            >
              {TARGET_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
