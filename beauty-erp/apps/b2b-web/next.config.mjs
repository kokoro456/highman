/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@beauty-erp/types', '@beauty-erp/validators', '@beauty-erp/ui'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
};

export default nextConfig;
