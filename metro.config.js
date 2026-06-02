const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// @supabase/supabase-js v2 contains a dynamic import of @opentelemetry/api
// for optional server-side tracing. Metro resolves all imports statically, so
// we stub the package out to prevent the "Unable to resolve module" build error.
config.resolver.extraNodeModules = {
  '@opentelemetry/api': require.resolve('./stubs/opentelemetry-api.js'),
};

module.exports = config;
