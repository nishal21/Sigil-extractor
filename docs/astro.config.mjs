import { defineConfig } from 'astro/config';
import expressiveCode from 'astro-expressive-code';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://nishal21.github.io',
  base: '/Sigil-extractor',
  integrations: [
    sitemap(),
    expressiveCode({
      themes: ['github-dark'],
      styleOverrides: {
        codeFontFamily: "'Space Grotesk', system-ui, monospace",
        codeFontSize: '0.9rem',
        uiFontFamily: "'Space Grotesk', system-ui, sans-serif",
        frames: {
          shadowColor: 'transparent',
          frameBoxShadowCssValue: 'none',
          terminalTitlebarBackground: 'var(--bg-surface)',
          terminalTitlebarDotsForeground: 'var(--border)',
          terminalBackground: 'var(--bg-surface)',
          editorTabBarBackground: 'var(--bg-surface)',
          editorActiveTabBackground: 'var(--bg-main)',
          editorActiveTabBorderColor: 'var(--accent)',
          editorTabBorderRadius: '0',
          editorTabBarBorderBottomColor: 'var(--border)',
          editorBackground: 'var(--bg-main)'
        }
      }
    }),
  ],
});