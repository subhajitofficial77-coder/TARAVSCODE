/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
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
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.weatherapi.com https://api.openrouter.ai https://generativelanguage.googleapis.com wss: ws:; media-src 'self' data: https:; object-src 'none'; frame-src 'none'; base-uri 'self'; form-action 'self';"
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
