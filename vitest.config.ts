import path from 'node:path';
import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';

export default defineConfig(async () => {
    const migrations = await readD1Migrations(path.join(import.meta.dirname, 'db/migrations'));

    return {
        plugins: [
            cloudflareTest({
                miniflare: {
                    compatibilityDate: '2026-06-24',
                    compatibilityFlags: ['nodejs_compat'],
                    d1Databases: {
                        STEPTHROUGH: 'stepthrough-test',
                    },
                    bindings: {
                        TEST_MIGRATIONS: migrations,
                    },
                },
            }),
        ],
        test: {
            setupFiles: ['./test/apply-migrations.ts'],
        },
    };
});
