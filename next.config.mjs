/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.node = {
                __dirname: true,
            }
        }
        return config
    },
};

export default nextConfig;
