import React from 'react';
import { Trash2, Sparkles, CheckCircle, AlertCircle, Clock, Map } from 'lucide-react';
import { Segment, SegmentStatus, SegmentCategory } from '../types';

interface SegmentRowProps {
  segment: Segment;
  targetLanguage: string;
  onUpdate: (id: string, updates: Partial<Segment>) => void;
  onDelete: (id: string) => void;
  onRunAnalysis: (id: string) => void;
}

export const SegmentRow: React.FC<SegmentRowProps> = ({
  segment,
  targetLanguage,
  onUpdate,
  onDelete,
  onRunAnalysis,
}) => {
  const getStatusStyle = (status: SegmentStatus) => {
    switch (status) {
      case SegmentStatus.Approved: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case SegmentStatus.NeedsWork: return 'bg-rose-100 text-rose-800 border-rose-200';
      case SegmentStatus.Reviewed: return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const StatusIcon = {
    [SegmentStatus.Approved]: CheckCircle,
    [SegmentStatus.NeedsWork]: AlertCircle,
    [SegmentStatus.Reviewed]: CheckCircle,
    [SegmentStatus.Pending]: Clock,
  }[segment.status];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-200 animate-slideIn mb-6">
      
      {/* 3-Column Header & Input Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 min-h-[220px]">
        
        {/* Panel 1: English Source */}
        <div className="p-5 flex flex-col">
          <label className="flex items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            1. English Source
          </label>
          <textarea
            className="flex-1 w-full text-sm text-slate-700 bg-slate-50/30 rounded-lg p-3 border border-slate-100 focus:ring-1 focus:ring-indigo-500 outline-none resize-none leading-relaxed"
            placeholder="Enter source text..."
            value={segment.sourceText}
            onChange={(e) => onUpdate(segment.id, { sourceText: e.target.value })}
          />
        </div>

        {/* Panel 2: Target Translation */}
        <div className="p-5 flex flex-col">
          <label className="flex items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            2. {targetLanguage} Translation
          </label>
          <textarea
            className="flex-1 w-full text-sm text-slate-700 bg-slate-50/30 rounded-lg p-3 border border-slate-100 focus:ring-1 focus:ring-indigo-500 outline-none resize-none leading-relaxed"
            placeholder={`Enter ${targetLanguage} text...`}
            value={segment.targetText}
            onChange={(e) => onUpdate(segment.id, { targetText: e.target.value })}
            dir={['Arabic', 'Urdu', 'Persian', 'Hebrew'].includes(targetLanguage) ? 'rtl' : 'ltr'}
          />
        </div>

        {/* Panel 3: Word by Word Breakdown */}
        <div className="p-5 flex flex-col bg-slate-50/20">
          <div className="flex items-center justify-between mb-3">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              3. Word by Word Breakdown
            </label>
            <button className="text-[10px] font-bold text-indigo-500 flex items-center gap-1 hover:text-indigo-700">
               <Map className="w-3 h-3" /> VIEW MAPPING
            </button>
          </div>
          
          <div className="flex-1 border border-slate-200 rounded-lg bg-white overflow-hidden flex flex-col">
            <div className="overflow-y-auto max-h-[160px] custom-scrollbar">
              {segment.wordBreakdown && segment.wordBreakdown.length > 0 ? (
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="sticky top-0 bg-white border-b border-slate-100">
                    <tr>
                      <th className="px-3 py-2 font-bold text-slate-400 uppercase tracking-tight">{targetLanguage.toUpperCase()} WORD</th>
                      <th className="px-3 py-2 font-bold text-slate-400 uppercase tracking-tight">ENGLISH EQUIVALENT</th>
                      <th className="px-3 py-2 font-bold text-slate-400 uppercase tracking-tight">CONTEXT/NOTES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {segment.wordBreakdown.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2.5 font-semibold text-slate-700">{item.targetWord}</td>
                        <td className="px-3 py-2.5 text-slate-600">{item.sourceEquivalent}</td>
                        <td className="px-3 py-2.5 text-slate-400 italic leading-tight">{item.context}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-6 text-slate-300">
                   <div className="text-[10px] font-bold uppercase tracking-widest text-center">No Data Available</div>
                   <p className="text-[9px] text-center mt-1">Run analysis to see linguistic breakdown</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Tool Bar */}
      <div className="bg-indigo-50/30 border-t border-slate-100 p-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors shadow-sm ${getStatusStyle(segment.status)}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {segment.status}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Category:</span>
            <select
              value={segment.category}
              onChange={(e) => onUpdate(segment.id, { category: e.target.value as SegmentCategory })}
              className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg py-1.5 px-3 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm cursor-pointer"
            >
              {Object.values(SegmentCategory).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <button
                onClick={() => onRunAnalysis(segment.id)}
                disabled={segment.isAnalyzing || !segment.sourceText || !segment.targetText}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-black text-white transition-all uppercase tracking-wider
                    ${segment.isAnalyzing 
                        ? 'bg-indigo-400 cursor-wait' 
                        : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-100'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {segment.isAnalyzing ? (
                    <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Final Audit
                    </>
                )}
            </button>

            <button
                onClick={() => onDelete(segment.id)}
                className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                title="Delete Segment"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Semantic Audit Feedback Panel */}
      {segment.aiFeedback && (
        <div className="bg-slate-50/50 p-5 border-t border-slate-100 animate-fadeIn">
            <div className="flex items-start gap-4">
                <div className="mt-0.5 bg-indigo-600 p-1.5 rounded-lg shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-1">
                    <h4 className="text-[10px] font-black text-indigo-900 mb-2 uppercase tracking-[0.15em]">Semantic Audit Results</h4>
                    <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                        {segment.aiFeedback}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};