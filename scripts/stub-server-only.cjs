// Lets standalone test scripts import modules marked `import "server-only"` (that package
// throws outside a React Server Component build) and stub static image/svg assets.
// Test-only - never loaded by the app.
// Usage: npx tsx --require ./scripts/stub-server-only.cjs ...
const Module = require("module");
const original = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  if (request === "server-only") return require.resolve("./stub-server-only-empty.cjs");
  return original.call(this, request, ...rest);
};

// Stub image/svg imports in node test environment
for (const ext of [".svg", ".png", ".jpg", ".jpeg", ".webp"]) {
  require.extensions[ext] = function (module) {
    module.exports = { src: `/mock${ext}`, height: 600, width: 1440 };
  };
}
