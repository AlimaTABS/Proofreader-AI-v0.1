import React from 'react';
import { Languages, ShieldCheck } from 'lucide-react';
import { TARGET_LANGUAGES } from '../constants';

interface HeaderProps {
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ selectedLanguage, onLanguageChange }) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-md">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">SGC Proofreader</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:block">Check translation errors</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <Languages className="w-4 h-4 text-slate-400" />
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent border-none text-sm font-black text-slate-700 focus:ring-0 cursor-pointer outline-none uppercase tracking-tight"
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