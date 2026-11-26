/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { remotePatterns: [{ protocol: 'https', hostname: 'upload.wikimedia.org' }], formats: ['image/avif', 'image/webp'] },
  outputFileTracingIncludes: {
    '/members/files/[piece]/[file]': ['./members-files/**/*'],
    '/*/opengraph-image': ['./app/fonts/Fraunces-Upright-Variable.ttf', './app/fonts/DMMono-Regular.ttf'],
    '/edition/*/opengraph-image': ['./app/fonts/Fraunces-Upright-Variable.ttf', './app/fonts/DMMono-Regular.ttf'],
  },
  webpack(config) {
    config.module.rules.push({ test: /\.md$/, type: 'asset/source' })
    return config
  },
}
export default nextConfig
