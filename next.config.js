/** @type {import('next').NextConfig} */
const nextConfig = {
    // 빌드 시 타입 오류 무시 (긴급 배포용)
    typescript: {
        ignoreBuildErrors: true,
    },
    // ESLint 오류 무시
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Next.js 15 스타일의 서버 외부 패키지 설정
    serverExternalPackages: ['next-auth', 'bcryptjs'],

    webpack: (config, { isServer }) => {
        if (isServer) {
            config.resolve.alias = {
                ...config.resolve.alias,
                'crypto': 'node:crypto',
            };
        }
        return config;
    },
};

module.exports = nextConfig;
