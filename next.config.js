/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 환경 변수 설정
  env: {
    CUSTOM_KEY: 'crediview-policy-system',
  },
  
  // 이미지 최적화 (필요시)
  images: {
    domains: ['localhost'],
  },
  
  // Pages Router만 사용 (App Router 완전 비활성화)
  experimental: {
    appDir: false,
  },
  
  // 웹팩 설정 (OpenAI 패키지 호환성)
  webpack: (config, { isServer }) => {
    if (!isServer && config.resolve) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  // 보안 헤더
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
