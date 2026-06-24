declare module 'cloudflare:workers' {
    interface ProvidedEnv {
        STEPTHROUGH: D1Database;
        TEST_MIGRATIONS: D1Migration[];
    }
}
