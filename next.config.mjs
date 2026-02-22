/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
    serverExternalPackages: ['next-auth', 'bcryptjs'],
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.resolve.alias = { ...config.resolve.alias, 'crypto': 'node:crypto' };
        }
        return config;
    },
};
export default nextConfig;
