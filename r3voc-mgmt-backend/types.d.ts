declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: 'development' | 'production' | 'test';
        HOST?: string;
        PORT?: string;
        SECRET_KEY: string; // Must be defined
        R3VOC_REPO_LOCATION: string; // Must be defined
        COMMIT_SHA: string; // Must be defined
        CI_RUN_ID: string; // Must be defined
    }
}
