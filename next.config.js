/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Server Actions are enabled by default in Next.js 14.2+
  // experimental.serverActions removed (deprecated)
  images: {
    domains: ['fgfxozvcibhuqgkjywtr.supabase.co']
  },
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  webpack: (config) => {
    // GLSL/raw loader for shader imports
    config.module.rules.push({
      test: /\.(glsl|vert|frag)$/,
      type: 'asset/source'
    });

    return config;
  },
  output: 'standalone'
};

module.exports = nextConfig;
