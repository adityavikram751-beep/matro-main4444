/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // ✅ Ignore ESLint errors during production build
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ Ignore TypeScript errors during production build
  },
  images: {
    domains: ["images.pexels.com", "res.cloudinary.com", "localhost"],
  },
};

module.exports = nextConfig;
