const cardAssets = ['./app/fonts/Fraunces*', './app/fonts/DMMono-Regular.ttf', './public/hub/**/*.jpg', './public/hub/wordmark.svg']

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { remotePatterns: [{ protocol: 'https', hostname: 'upload.wikimedia.org' }], formats: ['image/avif', 'image/webp'] },
  outputFileTracingIncludes: {
    '/members/files/[piece]/[file]': ['./members-files/**/*'],
    '/**/opengraph-image': cardAssets,
    '/opengraph-image': cardAssets,
    '/twitter-image': cardAssets,
  },
  webpack(config) {
    config.module.rules.push({ test: /\.md$/, type: 'asset/source' })
    return config
  },
}
export default nextConfig
