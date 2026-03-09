import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ResumeServerData } from '@/lib/types';

interface ResumeCacheState {
    cachedResumes: ResumeServerData[];
    lastAccessed: number;
    setCachedResumes: (resumes: ResumeServerData[]) => void;
    checkExpiration: () => void;
}

const CACHE_EXPIRATION_DAYS = 7;
const CACHE_EXPIRATION_MS = CACHE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

export const useResumeCacheStore = create<ResumeCacheState>()(
    persist(
        (set, get) => ({
            cachedResumes: [],
            lastAccessed: Date.now(),
            setCachedResumes: (resumes) => set({ cachedResumes: resumes, lastAccessed: Date.now() }),
            checkExpiration: () => {
                const { lastAccessed } = get();
                if (Date.now() - lastAccessed > CACHE_EXPIRATION_MS) {
                    set({ cachedResumes: [] });
                }
            },
        }),
        {
            name: 'resume-cache-store',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
