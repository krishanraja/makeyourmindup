/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { remotePatterns: [{ protocol: 'https', hostname: 'upload.wikimedia.org' }], formats: ['image/avif', 'image/webp'] },
  // The members' files live outside public/ and ship only with the route that checks the code.
  outputFileTracingIncludes: { '/members/files/[piece]/[file]': ['./members-files/**/*'] },
  // content/legal-entities.md is read as plain text at build, so the kill list
  // can scan it in its own narrow scope. See lib/legal.ts.
  webpack(config) {
    config.module.rules.push({ test: /\.md$/, type: 'asset/source' })
    return config
  },
}

export default nextConfig
