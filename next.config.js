/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.externals.push({
                'node:crypto': 'commonjs node:crypto',
                'crypto': 'commonjs node:crypto',
            });
        }
        return config;
    },
};

module.exports = nextConfig;
