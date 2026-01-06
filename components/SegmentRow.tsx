import React, { useState } from 'react';
import { Trash2, Sparkles, CheckCircle, AlertCircle, Clock, Copy, Check } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);
  
  const getStatusColor = (status: SegmentStatus) => {
    switch (status) {
      case SegmentStatus.Approved: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case SegmentStatus.NeedsWork: return 'bg-rose-50 text-rose-700 border-rose-200';
      case SegmentStatus.Reviewed: return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const handleCopyFeedback = () => {
    if (segment.aiFeedback) {
      navigator.clipboard.writeText(segment.aiFeedback);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const StatusIcon = {
    [SegmentStatus.Approved]: CheckCircle,
    [SegmentStatus.NeedsWork]: AlertCircle,
    [SegmentStatus.Reviewed]: CheckCircle,
    [SegmentStatus.Pending]: Clock,
  }[segment.status];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-200 hover:shadow-md animate-slideIn">
      
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        <div className="p-5">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">English Source</label>
          <textarea
            className="w-full min-h-[100px] p-0 text-base text-slate-800 bg-transparent border-none focus:ring-0 outline-none resize-none leading-relaxed"
            placeholder="Type or paste English source text..."
            value={segment.sourceText}
            onChange={(e) => onUpdate(segment.id, { sourceText: e.target.value })}
          />
        </div>

        <div className="p-5 bg-slate-50/40">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{targetLanguage} Translation</label>
          <textarea
            className="w-full min-h-[100px] p-0 text-base text-slate-800 bg-transparent border-none focus:ring-0 outline-none resize-none leading-relaxed"
            placeholder={`Enter ${targetLanguage} translation...`}
            value={segment.targetText}
            onChange={(e) => onUpdate(segment.id, { targetText: e.target.value })}
            dir={['Arabic', 'Urdu', 'Persian', 'Hebrew'].includes(targetLanguage) ? 'rtl' : 'ltr'}
          />
        </div>
      </div>

      <div className="bg-slate-50/80 border-t border-slate-100 p-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <select
              value={segment.status}
              onChange={(e) => onUpdate(segment.id, { status: e.target.value as SegmentStatus })}
              className={`appearance-none pl-9 pr-8 py-1.5 rounded-lg text-sm font-semibold border focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer transition-colors ${getStatusColor(segment.status)}`}
            >
              {Object.values(SegmentStatus).map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <StatusIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Category:</span>
            <select
              value={segment.category}
              onChange={(e) => onUpdate(segment.id, { category: e.target.value as SegmentCategory })}
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg py-1.5 px-3 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
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
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold text-white transition-all
                    ${segment.isAnalyzing 
                        ? 'bg-indigo-400 cursor-wait' 
                        : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-100'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {segment.isAnalyzing ? (
                    <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-4 h-4" />
                        AI Semantic Audit
                    </>
                )}
            </button>

            <button
                onClick={() => onDelete(segment.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete Segment"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
      </div>

      {segment.aiFeedback && (
        <div className="bg-indigo-50/40 border-t border-indigo-100 p-5 relative group/feedback animate-slideIn">
            <button 
              onClick={handleCopyFeedback}
              className="absolute right-4 top-4 p-2 bg-white border border-indigo-100 rounded-md shadow-sm text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all opacity-0 group-hover/feedback:opacity-100"
              title="Copy analysis to clipboard"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
            <div className="flex items-start gap-4">
                <div className="mt-0.5 bg-indigo-600 p-2 rounded-xl shadow-sm">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                    <h4 className="text-xs font-black text-indigo-900 mb-2 uppercase tracking-widest">Analysis Results</h4>
                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                        {segment.aiFeedback}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
