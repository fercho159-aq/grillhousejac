/** @type {import('next').NextConfig} */
const nextConfig = {
  // Type errors must fail the build (in BarJac, ignoring them let a missing import reach production).
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Short link printed on the QR card: opens the contact section of the home page.
  async redirects() {
    return [{ source: "/contacto", destination: "/#contacto", permanent: false }];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "api.qrserver.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
