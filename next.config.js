/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
};

module.exports = nextConfig;