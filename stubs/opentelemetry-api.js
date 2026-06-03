// Stub — opentelemetry is an optional dependency used only for tracing in
// server environments. Metro cannot dynamic-import it, so we provide an empty
// module so the supabase-js bundle resolves cleanly.
module.exports = {};
