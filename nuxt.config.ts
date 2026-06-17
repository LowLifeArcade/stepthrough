// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    css: ['~/assets/css/main.css'],
    runtimeConfig: {
        public: {
            oauthGoogleClientId: '',
        },
    },
    nitro: {
        preset: 'cloudflare_module',
        experimental: {
            database: true,
        },
        devDatabase: {
            default: {
                connector: 'cloudflare-d1',
                options: { bindingName: 'STEPTHROUGH' },
            },
        },
        database: {
            default: {
                connector: 'cloudflare-d1',
                options: { bindingName: 'STEPTHROUGH' },
            },
        },
        cloudflare: {
            deployConfig: false,
            nodeCompat: true,
        },
        typescript: {
            tsConfig: {
                compilerOptions: {
                    types: ['@cloudflare/workers-types'],
                },
            },
        },
    },
    modules: ['nitro-cloudflare-dev', 'nuxt-auth-utils'],
});
