import type { C3VocSchedule } from '@/schedule';

export interface ApiSuccessResponse<TData = any> {
    success: true;
    data: TData;
}

export interface ApiErrorResponse {
    success: false;
    error: string;
}

export type ApiResponse<TData = any> =
    | ApiSuccessResponse<TData>
    | ApiErrorResponse;

export interface ApiUser {
    username: string;
}

export interface ApiUploadedFile {
    id: number;
    path: string;
    rendered: boolean;
    importGuid: string;
    importId: number;
}

export const apiLogin = async (
    username: string,
    password: string,
): Promise<ApiResponse<ApiUser>> => {
    const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    return response.json();
};

export const apiLogout = async (): Promise<ApiResponse> => {
    const response = await fetch('/api/user/logout', {
        method: 'POST',
    });

    return response.json();
};

export const apiFetchUser = async (): Promise<ApiResponse<ApiUser | null>> => {
    const response = await fetch('/api/user/info');

    return response.json();
};

export const apiFetchSchedule = async (): Promise<
    ApiResponse<C3VocSchedule>
> => {
    const response = await fetch('/api/schedule');

    return response.json();
};

export const apiRefreshSchedule = async (): Promise<
    ApiResponse<C3VocSchedule>
> => {
    const response = await fetch('/api/schedule/refresh');

    return response.json();
};

export const apiFetchFiles = async (): Promise<
    ApiResponse<ApiUploadedFile[]>
> => {
    const response = await fetch('/api/files/list');

    return response.json();
};

export const apiRenderTalk = async (importId: number): Promise<ApiResponse> => {
    const response = await fetch('/api/talks/render', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ importId }),
    });

    return response.json();
};
