import { create } from 'zustand';

export interface UiStoreState {
    selectedTalkImportGuid: string | null;
}

export interface UiStoreActions {
    setSelectedTalkImportGuid: (importGuid: string | null) => void;
}

export type UiStore = UiStoreState & UiStoreActions;

export const useUiStore = create<UiStore>(set => ({
    selectedTalkImportGuid: null,
    setSelectedTalkImportGuid: (importGuid: string | null) =>
        set({ selectedTalkImportGuid: importGuid }),
}));
