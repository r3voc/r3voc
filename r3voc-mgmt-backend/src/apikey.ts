import crypto from 'node:crypto';

import { getMeta } from '@/db';

export const setupApiKey = async (): Promise<void> => {
    const meta = await getMeta();

    if (!meta.apiKey) {
        console.log('No API Key found, generating a new one...');
        meta.apiKey = crypto.randomBytes(32).toString('hex');
        await meta.save();
        console.log('Generated new API Key');
    }

    console.log('API Key:', meta.apiKey);
};

export const getApiKey = async (): Promise<string> => {
    const meta = await getMeta();
    if (!meta.apiKey) {
        throw new Error('API Key not set up');
    }
    return meta.apiKey;
};
