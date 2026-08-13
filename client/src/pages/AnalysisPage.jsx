import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import FileUpload from '../components/analysis/FileUpload';
import JobDescriptionInput from '../components/analysis/JobDescriptionInput';
import { useAnalysisStore } from '../store/analysisStore';
import { runAnalysis } from '../services/api';
import AnalysisLoader from '../components/analysis/AnalysisLoader';

// Error state type
// null | 'LLM_UNAVAILABLE_GEMINI' | 'LLM_UNAVAILABLE_OLLAMA' | 'MODEL_ERROR' | 'GENERAL'
function InPageError({ type, onRetry, onSwitchProvider }) {
  if (!type) return null;

  const configs = {
    LLM_UNAVAILABLE_GEMINI: {
      icon: '☁️',
      title: 'Gemini Unavailable',
      body: 'Gemini API key is missing, invalid, or the service is temporarily down.',
      primary: { label: 'Retry', action: onRetry },
      secondary: { label: 'Switch to Ollama', action: onSwitchProvider },
    },
    LLM_UNAVAILABLE_OLLAMA: {
      icon: '💻',
      title: 'Ollama Not Running',
      body: 'Ollama must be running locally. Start it with: ollama serve',
      primary: { label: 'Retry', action: onRetry },
      secondary: { label: 'Switch to Gemini', action: onSwitchProvider },
    },
    MODEL_ERROR: {
      icon: '🤖',
      title: 'Model Unavailable',
      body: 'The selected AI model is not available. Please select another model and try again.',
      primary: { label: 'Try Again', action: onRetry },
    },
    GENERAL: {
      icon: '⚠️',
      title: "Analysis Failed",
      body: "We couldn't complete the analysis. Please check your inputs and try again.",
      primary: { label: 'Try Again', action: onRetry },
    },
  };

  const cfg = configs[type] || configs.GENERAL;

  return (
    <div className="rounded-xl p-6 border border-[#F43F5E]/30 bg-[#F43F5E]/5 flex flex-col sm:flex-row gap-4 items-start mb-8">
      <span className="text-3xl mt-0.5" aria-hidden="true">{cfg.icon}</span>
      <div className="flex-1">
        <h3 className="font-['Syne'] font-bold text-[#F1F5F9] text-lg mb-1">{cfg.title}</h3>
        <p className="text-sm text-[#94A3B8] mb-4">{cfg.body}</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={cfg.primary.action}
            className="px-5 py-2.5 rounded-lg bg-[#6366F1] text-white font-semibold text-sm hover:bg-[#4F46E5] transition-colors"
          >
            {cfg.primary.label}
          </button>
          {cfg.secondary && (
            <button
              onClick={cfg.secondary.action}
              className="px-5 py-2.5 rounded-lg border border-[#2D2D3F] text-[#94A3B8] font-semibold text-sm hover:border-[#6366F1] hover:text-[#F1F5F9] transition-colors"
            >
              {cfg.secondary.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  const navigate = useNavigate();
  const { resumeText, jobDescription, setResumeText, setJobDescription } = useAnalysisStore();
  const [filename, setFilename] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisSuccess, setAnalysisSuccess] = useState(false);
  const [analysisResultId, setAnalysisResultId] = useState(null);
  const [errorType, setErrorType] = useState(null);

  const [provider, setProvider] = useState('ollama');
  const [model, setModel] = useState('mistral');

  const handleUploadSuccess = (text, name) => {
    setResumeText(text);
    setFilename(name);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysisSuccess(false);
    setAnalysisResultId(null);
    setErrorType(null);
    try {
      const { data } = await runAnalysis(resumeText, jobDescription, provider, model, filename, jobTitle);
      setAnalysisResultId(data.data.analysisId);
      setAnalysisSuccess(true);
    } catch (error) {
      setLoading(false);
      const errData = error.response?.data?.error;
      const code = errData?.code || error.code;

      if (code === 'LLM_UNAVAILABLE') {
        setErrorType(provider === 'gemini' ? 'LLM_UNAVAILABLE_GEMINI' : 'LLM_UNAVAILABLE_OLLAMA');
      } else if (code === 'LLM_ERROR' && errData?.message?.includes('model')) {
        setErrorType('MODEL_ERROR');
      } else {
        setErrorType('GENERAL');
        const msg = errData?.message || error.message || 'Analysis failed.';
        toast.error(msg);
      }
    }
  };

  const handleSwitchProvider = () => {
    setErrorType(null);
    if (provider === 'gemini') {
      setProvider('ollama');
      setModel('mistral');
    } else {
      setProvider('gemini');
      setModel('gemini-flash-latest');
    }
  };

  const isAnalyzeDisabled = resumeText === '' || jobDescription === '';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-20 text-left">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-['Syne'] text-[#F1F5F9] mb-4">
            New Analysis
          </h1>
          <p className="text-lg text-[#94A3B8] max-w-2xl">
            Upload your latest resume and the target job description to get AI-powered insights on your match.
          </p>
        </div>

        {/* In-page error */}
        <InPageError
          type={errorType}
          onRetry={() => { setErrorType(null); handleAnalyze(); }}
          onSwitchProvider={handleSwitchProvider}
        />

        {/* 01 + 02: Resume + Job Description */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="rounded-xl p-6 lg:p-8 flex flex-col h-full" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
            <h2 className="text-2xl font-bold font-['Syne'] text-[#F1F5F9] mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded bg-[#1E1E2E] border border-[#2D2D3F] text-[#22D3EE] font-['JetBrains_Mono'] text-sm">01</span>
              Resume PDF
            </h2>
            <div className="flex-1 flex flex-col">
              <FileUpload onUploadSuccess={handleUploadSuccess} />
            </div>
          </div>

          <div className="rounded-xl p-6 lg:p-8 flex flex-col h-full" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
            <h2 className="text-2xl font-bold font-['Syne'] text-[#F1F5F9] mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded bg-[#1E1E2E] border border-[#2D2D3F] text-[#22D3EE] font-['JetBrains_Mono'] text-sm">02</span>
              Job Description
            </h2>
            <div className="flex-1 flex flex-col">
              <JobDescriptionInput value={jobDescription} onChange={setJobDescription} />
            </div>
          </div>
        </div>

        {/* 03: Target Role */}
        <div className="rounded-xl p-6 lg:p-8 mb-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
          <h2 className="text-xl font-bold font-['Syne'] text-[#F1F5F9] mb-4 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded bg-[#1E1E2E] border border-[#2D2D3F] text-[#22D3EE] font-['JetBrains_Mono'] text-sm">03</span>
            Target Role
            <span className="text-xs font-normal text-[#64748B] font-['DM_Sans']">Optional — helps label your report</span>
          </h2>
          <input
            id="job-title-input"
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Senior Frontend Developer"
            maxLength={120}
            className="w-full bg-[#0A0A0F] border border-[#2D2D3F] rounded-lg px-4 py-3 text-[#F1F5F9] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] transition-colors"
          />
        </div>

        {/* 04: Provider / Model Selection */}
        <div className="rounded-xl p-6 lg:p-8 flex flex-col sm:flex-row gap-6 mb-10" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
          <div className="flex-1">
            <label htmlFor="provider-select" className="block text-sm font-medium text-[#94A3B8] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm" aria-hidden="true">memory</span>
              AI Provider
            </label>
            <select
              id="provider-select"
              value={provider}
              onChange={(e) => {
                const newProv = e.target.value;
                setProvider(newProv);
                setModel(newProv === 'ollama' ? 'mistral' : 'gemini-flash-latest');
                setErrorType(null);
              }}
              className="w-full bg-[#0A0A0F] border border-[#2D2D3F] rounded-lg px-4 py-3 text-[#F1F5F9] focus:outline-none focus:border-[#6366F1] appearance-none transition-colors"
            >
              <option value="ollama">Local AI (Ollama)</option>
              <option value="gemini">Cloud AI (Google Gemini)</option>
            </select>
            <p className="text-xs text-[#64748B] mt-2">
              {provider === 'ollama'
                ? '100% private. Runs entirely on your hardware.'
                : 'Faster processing. Requires internet connection and API key.'}
            </p>
          </div>

          <div className="flex-1">
            <label htmlFor="model-select" className="block text-sm font-medium text-[#94A3B8] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm" aria-hidden="true">psychology</span>
              AI Model
            </label>
            <select
              id="model-select"
              value={model}
              onChange={(e) => { setModel(e.target.value); setErrorType(null); }}
              className="w-full bg-[#0A0A0F] border border-[#2D2D3F] rounded-lg px-4 py-3 text-[#F1F5F9] focus:outline-none focus:border-[#6366F1] appearance-none transition-colors"
            >
              {provider === 'ollama' ? (
                <>
                  <option value="mistral">Mistral (Default, Fast)</option>
                  <option value="llama3">Llama 3 (Better reasoning)</option>
                  <option value="llama3.2">Llama 3.2</option>
                  <option value="deepseek-r1">DeepSeek R1</option>
                </>
              ) : (
                <>
                  <option value="gemini-flash-latest">Gemini Flash (Fastest)</option>
                  <option value="gemini-pro-latest">Gemini Pro (Most accurate)</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Analyze Action */}
        <div className="flex justify-start">
          <button
            id="analyze-btn"
            onClick={handleAnalyze}
            disabled={isAnalyzeDisabled || loading}
            aria-busy={loading}
            className={`
              relative overflow-hidden w-full sm:w-auto
              px-10 py-5 rounded-lg font-bold font-['Syne'] text-lg
              transition-all duration-300 transform
              flex items-center justify-center gap-3 shadow-lg
              ${(isAnalyzeDisabled || loading)
                ? 'bg-[#1E1E2E] text-[#94A3B8] border border-[#2D2D3F] cursor-not-allowed opacity-70'
                : 'bg-gradient-to-br from-[#6366F1] to-[#4F46E5] text-[#F1F5F9] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:-translate-y-1 border border-transparent'
              }
            `}
          >
            {loading && (
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? 'Analyzing...' : 'Analyze Match'}
          </button>
        </div>
      </main>

      <AnalysisLoader
        isAnalyzing={loading}
        isSuccess={analysisSuccess}
        provider={provider}
        onComplete={() => {
          setLoading(false);
          navigate('/results/' + analysisResultId);
        }}
      />
    </div>
  );
}
