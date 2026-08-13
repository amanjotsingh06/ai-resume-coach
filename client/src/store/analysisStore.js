import { create } from 'zustand';

export const useAnalysisStore = create((set) => ({
  resumeText: '',
  jobDescription: '',
  setResumeText: (text) => set({ resumeText: text }),
  setJobDescription: (jd) => set({ jobDescription: jd }),
  clear: () => set({ resumeText: '', jobDescription: '' }),
}));
