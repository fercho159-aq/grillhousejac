/** @type {import('next').NextConfig} */
const nextConfig = {
  // Type errors must fail the build (in BarJac, ignoring them let a missing import reach production).
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "api.qrserver.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
