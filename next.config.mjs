/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  trailingSlash: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "45mb",
    },
  },
};

export default nextConfig;
