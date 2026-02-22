/** @type {import('next').NextConfig} */
const nextConfig = {
    // Next.js 15 스타일의 서버 외부 패키지 설정
    serverExternalPackages: ['next-auth', 'bcryptjs'],

    webpack: (config, { isServer }) => {
        if (isServer) {
            // Cloudflare nodejs_compat 환경을 위한 명시적 별칭 설정
            config.resolve.alias = {
                ...config.resolve.alias,
                'crypto': 'node:crypto',
            };
        }
        return config;
    },
};

module.exports = nextConfig;
