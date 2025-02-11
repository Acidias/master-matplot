const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  transpilePackages: ['react-syntax-highlighter'],
})

module.exports = withNextra()
