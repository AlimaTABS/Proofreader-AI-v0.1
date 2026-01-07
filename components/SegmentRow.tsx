
import React from 'react';
import { Trash2, Sparkles, CheckCircle, AlertCircle, Clock, BookOpen, Wand2, LucideIcon } from 'lucide-react';
import { Segment, SegmentStatus, SegmentCategory } from '../types';

interface SegmentRowProps {
  segment: Segment;
  targetLanguage: string;
  onUpdate: (id: string, updates: Partial<Segment>) => void;
  onDelete: (id: string) => void;
  onRunAnalysis: (id: string) => void;
  onTranslate: (id: string) => void;
  onRunWordAnalysis: (id: string) => void;
}

export const SegmentRow: React.FC<SegmentRowProps> = ({
  segment,
  targetLanguage,
  onUpdate,
  onDelete,
  onRunAnalysis,
  onTranslate,
  onRunWordAnalysis
}) => {
  
  const getStatusColor = (status: SegmentStatus) => {
    switch (status) {
      case SegmentStatus.Approved: return 'bg-green-100 text-green-700 border-green-200';
      case SegmentStatus.NeedsWork: return 'bg-red-100 text-red-700 border-red-200';
      case SegmentStatus.Reviewed: return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const statusIcons: Record<SegmentStatus, LucideIcon> = {
    [SegmentStatus.Approved]: CheckCircle,
    [SegmentStatus.NeedsWork]: AlertCircle,
    [SegmentStatus.Reviewed]: CheckCircle,
    [SegmentStatus.Pending]: Clock,
  };

  const StatusIcon = statusIcons[segment.status] || Clock;
  const isRtl = ['Arabic', 'Urdu', 'Persian', 'Hebrew'].includes(targetLanguage);

  const renderWordTable = (markdown: string) => {
    if (!markdown.includes('|')) {
        return <div className="text-[11px] text-red-500 font-medium p-2 bg-red-50 rounded border border-red-100">{markdown}</div>;
    }

    const rows = markdown.trim().split('\n').filter(row => row.includes('|') && !row.includes('---'));
    if (rows.length < 1) return <div className="text-xs text-gray-500 italic">Processing...</div>;

    const tableData = rows.map(row => 
      row.split('|').map(cell => cell.trim()).filter(cell => cell !== '')
    );

    const headers = tableData[0];
    const bodyRows = tableData.slice(1);

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              {headers.map((header, i) => (
                <th key={i} className="py-2 px-2 font-bold text-gray-400 uppercase tracking-tighter">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bodyRows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className={`py-2 px-2 text-gray-700 ${j === 1 && isRtl ? 'text-right font-medium' : ''}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
        <div className="p-4 flex flex-col gap-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">1. English Source</span>
          </div>
          <textarea
            className="w-full min-h-[160px] p-3 text-sm text-gray-800 bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            value={segment.sourceText}
            onChange={(e) => onUpdate(segment.id, { sourceText: e.target.value })}
          />
        </div>

        <div className="p-4 flex flex-col gap-2 bg-slate-50/20">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">2. {targetLanguage} Translation</span>
            <button 
              onClick={() => onTranslate(segment.id)}
              disabled={segment.isTranslating || !segment.sourceText}
              className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-30 uppercase tracking-tighter"
            >
              {segment.isTranslating ? 'Translating...' : <><Wand2 className="w-3 h-3"/> AI Translate</>}
            </button>
          </div>
          <textarea
            className="w-full min-h-[160px] p-3 text-sm text-gray-800 bg-white border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            value={segment.targetText}
            onChange={(e) => onUpdate(segment.id, { targetText: e.target.value })}
            dir={isRtl ? 'rtl' : 'ltr'}
          />
        </div>

        <div className="p-4 flex flex-col gap-2 bg-emerald-50/10">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">3. WORD BY WORD Translation</span>
            <button 
              onClick={() => onRunWordAnalysis(segment.id)}
              disabled={segment.isAnalyzingWords || !segment.targetText}
              className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-800 disabled:opacity-30 uppercase tracking-tighter"
            >
              {segment.isAnalyzingWords ? 'Processing...' : <><BookOpen className="w-3 h-3"/> View Table</>}
            </button>
          </div>
          <div className="w-full min-h-[160px] p-3 bg-white border border-gray-100 rounded-lg overflow-y-auto max-h-[160px]">
             {segment.wordByWord ? (
               renderWordTable(segment.wordByWord)
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2 opacity-60">
                 <BookOpen className="w-6 h-6" />
                 <p className="text-[10px] text-center">Click "View Table" to see<br/>WORD BY WORD Translation</p>
               </div>
             )}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border-t border-gray-200 p-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              value={segment.status}
              onChange={(e) => onUpdate(segment.id, { status: e.target.value as SegmentStatus })}
              className={`appearance-none pl-9 pr-8 py-1.5 rounded-md text-xs font-bold border ${getStatusColor(segment.status)}`}
            >
              {Object.values(SegmentStatus).map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <StatusIcon className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${segment.status === SegmentStatus.NeedsWork ? 'text-red-600' : ''}`} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Category:</span>
            <select
              value={segment.category}
              onChange={(e) => onUpdate(segment.id, { category: e.target.value as SegmentCategory })}
              className="bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-md py-1 px-2"
            >
              {Object.values(SegmentCategory).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
            <button
                onClick={() => onRunAnalysis(segment.id)}
                disabled={segment.isAnalyzing || !segment.sourceText || !segment.targetText}
                className="flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 uppercase"
            >
                {segment.isAnalyzing ? 'Auditing...' : <><Sparkles className="w-4 h-4" /> Final Audit</>}
            </button>
            <button onClick={() => onDelete(segment.id)} className="p-1.5 text-gray-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
      </div>

      {segment.aiFeedback && (
        <div className="bg-indigo-50/30 border-t border-indigo-100 p-4">
            <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-indigo-400 mt-1" />
                <div className="flex-1">
                    <h4 className="text-[10px] font-black text-indigo-900 mb-1 uppercase tracking-widest">Quality Audit Results</h4>
                    <div className="text-sm text-gray-700 whitespace-pre-line">{segment.aiFeedback}</div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
