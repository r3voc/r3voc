import { create } from 'zustand';

import {apiGetInfo, type ApiUploadedFile, type ApiUser} from '@/api';
import {
    apiFetchFiles,
    apiFetchSchedule,
    apiFetchUser,
    apiLogin,
    apiLogout,
    apiRefreshSchedule,
    apiRenderTalk,
} from '@/api';
import type { C3VocSchedule } from '@/schedule';

export interface ApiStoreState {
    user: ApiUser | null;
    hasFetchedUser: boolean;
    schedule: C3VocSchedule['schedule'] | null;
    files: ApiUploadedFile[] | null;
    info: { commitSha: string; ciRunId: string } | null;
}

export interface ApiStoreActions {
    login: (username: string, password: string) => ReturnType<typeof apiLogin>;
    logout: () => ReturnType<typeof apiLogout>;
    fetchUser: () => ReturnType<typeof apiFetchUser>;
    fetchSchedule: () => ReturnType<typeof apiFetchSchedule>;
    refreshSchedule: () => ReturnType<typeof apiRefreshSchedule>;
    fetchFiles: () => ReturnType<typeof apiFetchFiles>;
    renderTalk: (importId: number) => ReturnType<typeof apiRenderTalk>;
    fetchInfo: () => ReturnType<typeof apiGetInfo>;
}

export type ApiStore = ApiStoreState & ApiStoreActions;

export const useApiStore = create<ApiStore>(set => ({
    user: null,
    hasFetchedUser: false,
    schedule: null,
    files: null,
    info: null,
    login: async (username: string, password: string) => {
        const response = await apiLogin(username, password);

        set({ hasFetchedUser: true });

        if (response.success) {
            set({ user: response.data });
        }

        return response;
    },
    logout: async () => {
        const response = await apiLogout();

        if (response) {
            set({ user: null });
        }

        return response;
    },
    fetchUser: async () => {
        try {
            const response = await apiFetchUser();

            if (response.success) {
                set({ user: response.data });
            }

            return response;
        } finally {
            set({ hasFetchedUser: true });
        }
    },
    fetchSchedule: async () => {
        const response = await apiFetchSchedule();

        if (response.success) {
            set({ schedule: response.data.schedule });
        }

        return response;
    },
    refreshSchedule: async () => {
        const response = await apiRefreshSchedule();

        if (response.success) {
            set({ schedule: response.data.schedule });
        }

        return response;
    },
    fetchFiles: async () => {
        const response = await apiFetchFiles();

        if (response.success) {
            set({ files: response.data });
        }

        return response;
    },
    renderTalk: async (importId: number) => apiRenderTalk(importId),
    fetchInfo: async () => {
        const response = await apiGetInfo();

        if (response.success) {
            set({ info: response.data });
        }

        return response;
    },
}));
