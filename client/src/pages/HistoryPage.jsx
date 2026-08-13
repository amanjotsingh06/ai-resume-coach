import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import AnalysisCard from '../components/history/AnalysisCard';
import { getHistory } from '../services/api';

function SkeletonRow() {
  return (
    <div className="rounded-xl border border-[#1E1E2E] p-5 flex items-center gap-4 animate-pulse">
      <div className="w-16 h-16 rounded-xl bg-[#1E1E2E] flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-[#1E1E2E] rounded w-1/3" />
        <div className="h-3 bg-[#1E1E2E] rounded w-1/2" />
      </div>
      <div className="w-24 h-8 bg-[#1E1E2E] rounded-lg" />
    </div>
  );
}

export default function HistoryPage() {
  const [analyses, setAnalyses]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getHistory();
        setAnalyses(response.data.data ?? []);
      } catch (err) {
        console.error('Failed to fetch history', err);
        setError('Failed to load analysis history. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif" }}
    >
      <Navbar />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-20">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold font-['Syne'] text-[#F1F5F9] mb-2">
              Analysis History
            </h1>
            <p className="text-[#64748B] text-sm">
              Your past resume analyses — newest first.
            </p>
          </div>
          <button
            onClick={() => navigate('/analyze')}
            className="flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-lg font-bold font-['Syne'] text-sm bg-gradient-to-br from-[#6366F1] to-[#4F46E5] text-white hover:shadow-[0_0_16px_rgba(99,102,241,0.4)] transition-all"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">add</span>
            New Analysis
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="rounded-xl p-6 border border-[#F43F5E]/30 bg-[#F43F5E]/5 text-center mb-8">
            <p className="text-[#F43F5E] mb-3 text-sm">{error}</p>
            <button
              onClick={() => { setError(null); setLoading(true); getHistory().then(r => setAnalyses(r.data.data ?? [])).catch(() => setError('Failed again.')).finally(() => setLoading(false)); }}
              className="px-4 py-2 rounded-lg border border-[#2D2D3F] text-[#94A3B8] text-sm hover:border-[#6366F1] hover:text-[#F1F5F9] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="space-y-3">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && analyses.length === 0 && (
          <div className="rounded-xl border border-[#2D2D3F] p-12 text-center" style={{ background: 'var(--bg-card)' }}>
            <span className="material-symbols-outlined text-5xl text-[#2D2D3F] mb-4 block" aria-hidden="true">
              history
            </span>
            <h2 className="font-['Syne'] font-bold text-xl text-[#F1F5F9] mb-2">No analyses yet</h2>
            <p className="text-sm text-[#64748B] mb-6 max-w-sm mx-auto">
              Upload a resume and analyze it against a target job description to get started.
            </p>
            <button
              onClick={() => navigate('/analyze')}
              className="px-6 py-3 rounded-lg font-bold font-['Syne'] text-sm bg-gradient-to-br from-[#6366F1] to-[#4F46E5] text-white hover:shadow-[0_0_16px_rgba(99,102,241,0.4)] transition-all"
            >
              Analyze Resume
            </button>
          </div>
        )}

        {/* Analyses list */}
        {!loading && !error && analyses.length > 0 && (
          <div className="space-y-3">
            {analyses.map((analysis) => (
              <AnalysisCard
                key={analysis._id}
                analysis={analysis}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
