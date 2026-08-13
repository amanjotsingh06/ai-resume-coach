import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import SkeletonCard from '../components/common/SkeletonCard';
import MatchScoreRing from '../components/dashboard/MatchScoreRing';
import StatCard from '../components/dashboard/StatCard';
import TabNav from '../components/dashboard/TabNav';
import OverviewTab from '../components/dashboard/OverviewTab';
import SkillGapsTab from '../components/dashboard/SkillGapsTab';
import BulletImproverTab from '../components/dashboard/BulletImproverTab';
import InterviewPrepTab from '../components/dashboard/InterviewPrepTab';
import RoadmapTab from '../components/dashboard/RoadmapTab';
import ReportHeader from '../components/report/ReportHeader';
import ScoreBreakdown from '../components/report/ScoreBreakdown';
import KeywordAnalysisSection from '../components/report/KeywordAnalysisSection';
import PrintableReport from '../components/report/PrintableReport';
import { downloadReportPdf } from '../utils/pdf/exportPdf';
import { generateReportFilename } from '../utils/pdf/sanitizeFilename';
import { getAnalysis } from '../services/api';

export default function DashboardPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [analysisResult, setAnalysisResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [pdfLoading, setPdfLoading] = useState(false);

    // Ref attached to the printable report element
    const printRef = useRef(null);

    const getPdfFilename = useCallback(() =>
        generateReportFilename({
            resume_name: analysisResult?.resume_name,
            job_title:   analysisResult?.job_title,
        }),
    [analysisResult]);

    // react-to-print hook for desktop vector rendering
    const triggerPrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: getPdfFilename,
        onBeforePrint: () => {
            setPdfLoading(true);
            return Promise.resolve();
        },
        onAfterPrint: () => {
            setPdfLoading(false);
        },
        onPrintError: (errorLocation, err) => {
            console.error(`[PDF Print Error at ${errorLocation}]:`, err);
            toast.error('Unable to export PDF. Please try again.');
            setPdfLoading(false);
        },
    });

    /**
     * Hybrid PDF exporter:
     * - Mobile devices (iOS / Android): Direct file download via html2pdf.js straight to Files/Downloads.
     * - Desktop devices: Native vector print / Save as PDF modal via react-to-print.
     */
    const handleDownloadPdf = useCallback(async () => {
        if (!analysisResult) {
            toast.error('Unable to generate PDF because the report is unavailable.');
            return;
        }
        if (pdfLoading) return; // prevent duplicate clicks

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            typeof navigator !== 'undefined' ? navigator.userAgent : ''
        );

        setPdfLoading(true);
        try {
            if (isMobile) {
                await downloadReportPdf(printRef.current, {
                    resume_name: analysisResult.resume_name,
                    job_title:   analysisResult.job_title,
                });
                toast.success('PDF download started!');
                setPdfLoading(false);
            } else {
                triggerPrint();
            }
        } catch (err) {
            console.error('[PDF] Export failed:', err);
            toast.error('Unable to export PDF. Please try again.');
            setPdfLoading(false);
        }
    }, [analysisResult, pdfLoading, triggerPrint]);

    useEffect(() => {
        async function fetchAnalysis() {
            try {
                setLoading(true);
                const { data } = await getAnalysis(id);
                setAnalysisResult(data.data);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Failed to load analysis');
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchAnalysis();
    }, [id]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewTab data={analysisResult} />;
            case 'skillGaps':
                return <SkillGapsTab data={analysisResult} />;
            case 'keywords':
                return <KeywordAnalysisSection data={analysisResult} />;
            case 'bulletImprover':
                return <BulletImproverTab data={analysisResult} />;
            case 'interviewPrep':
                return <InterviewPrepTab data={analysisResult} />;
            case 'roadmap':
                return <RoadmapTab data={analysisResult} />;
            default:
                return <OverviewTab data={analysisResult} />;
        }
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)', fontFamily: "'DM Sans', sans-serif" }}>
            <Navbar />

            <main className="w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16 text-left">
                {loading ? (
                    <div className="space-y-6">
                        <SkeletonCard height="120px" />
                        <SkeletonCard height="200px" />
                        <SkeletonCard height="250px" />
                        <SkeletonCard height="400px" />
                    </div>
                ) : error ? (
                    <div className="rounded-xl p-8 border border-[#F43F5E]/30 bg-[#F43F5E]/5 text-center">
                        <p className="text-[#F43F5E] font-[#JetBrains_Mono] mb-4">{error}</p>
                        <button
                            onClick={() => navigate('/history')}
                            className="px-5 py-2.5 rounded-lg bg-[#1E1E2E] border border-[#2D2D3F] text-[#94A3B8] text-sm hover:border-[#6366F1] hover:text-[#F1F5F9] transition-colors"
                        >
                            ← Back to History
                        </button>
                    </div>
                ) : !analysisResult ? (
                    <div className="text-center text-[#94A3B8] font-['JetBrains_Mono'] py-20">
                        Analysis not found.
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Report Header — metadata + prominent score */}
                        <ReportHeader data={analysisResult} />

                        {/* Download PDF button */}
                        <div className="flex justify-end">
                            <button
                                id="download-pdf-btn"
                                onClick={handleDownloadPdf}
                                disabled={pdfLoading || !analysisResult}
                                aria-busy={pdfLoading}
                                aria-label={pdfLoading ? 'Generating PDF…' : 'Download report as PDF'}
                                className={`
                                    inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                                    font-semibold font-['Syne'] text-sm
                                    transition-all duration-200
                                    ${
                                        pdfLoading
                                        ? 'bg-[#1E1E2E] text-[#64748B] border border-[#2D2D3F] cursor-not-allowed'
                                        : 'bg-gradient-to-br from-[#6366F1] to-[#4F46E5] text-white hover:shadow-[0_0_16px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 border border-transparent'
                                    }
                                `}
                            >
                                {pdfLoading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Preparing PDF…
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-base" aria-hidden="true">download</span>
                                        Download PDF
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Score hero + stat cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <div
                                className="lg:col-span-1 flex items-center justify-center rounded-xl p-8 shadow-sm"
                                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
                            >
                                <MatchScoreRing score={analysisResult.match_score || 0} size="lg" />
                            </div>
                            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <StatCard
                                    value={analysisResult.missing_skills?.length || 0}
                                    label="Missing Skills"
                                    color="rose"
                                />
                                <StatCard
                                    value={analysisResult.bullet_improvements?.length || 0}
                                    label="Bullets to Improve"
                                    color="amber"
                                />
                                <StatCard
                                    value={analysisResult.matched_skills?.length || 0}
                                    label="Matched Skills"
                                    color="indigo"
                                />
                            </div>
                        </div>

                        {/* ATS Score Breakdown */}
                        <ScoreBreakdown breakdown={analysisResult.ats_breakdown} />

                        {/* Content Tabs */}
                        <div
                            className="rounded-xl overflow-hidden shadow-md"
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
                        >
                            <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
                            <div className="p-4 sm:p-6 md:p-8">
                                {renderTabContent()}
                            </div>
                        </div>

                        {/* Offscreen printable report container */}
                        <div
                            style={{
                                position: 'fixed',
                                left: '-9999px',
                                top: '0px',
                                width: '800px',
                                background: '#ffffff',
                                color: '#1a1a2e',
                                zIndex: -9999,
                            }}
                            aria-hidden="true"
                        >
                            <PrintableReport ref={printRef} data={analysisResult} />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
