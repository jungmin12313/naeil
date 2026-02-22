/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            crypto: 'node:crypto',
        };
        return config;
    },
};

module.exports = nextConfig;
