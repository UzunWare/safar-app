/**
 * Pre-setup: runs as globalSetup (separate Node context, runs once before all workers).
 * Must export an async function per Jest's globalSetup contract.
 */
module.exports = async function globalSetup() {
  // globalSetup runs in its own context so we can only set process.env here.
  // The actual __ExpoImportMetaRegistry polyfill is in jest.setup.ts (setupFiles).
};
