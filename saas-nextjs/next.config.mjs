/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      { source: '/', destination: '/index.html' },
      { source: '/login', destination: '/login.html' },
      { source: '/cadastro', destination: '/cadastro.html' },
    ];
  },
};

export default nextConfig;
