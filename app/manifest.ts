// PWA manifest. We don't use Next's MetadataRoute.Manifest type because it
// doesn't include share_target (a Web Share Target API field that browsers
// read directly). The plain JSON shape below is what gets served at /manifest.webmanifest.

export default function manifest() {
  return {
    name: 'makeyourmindup.ai',
    short_name: 'Mindmaker',
    description: 'What if you were already the version of you you keep delaying?',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0908',
    theme_color: '#0a0908',
    icons: [
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
    share_target: {
      action: '/share',
      method: 'GET',
      params: { url: 'shared', text: 'shared', title: 'shared' },
    },
  };
}
