const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add any custom Metro config here if needed
config.transformer.minifierPath = require.resolve('metro-minify-terser');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

module.exports = config;
