/**
 * Custom test environment that pre-defines globals as non-configurable
 * BEFORE any setupFiles run. This prevents the Expo SDK 54 winter runtime
 * (expo/src/winter/runtime.native.ts) from overwriting them with lazy getters
 * that fail in Jest's module scope.
 *
 * Extends react-native's test environment to preserve RN-specific settings.
 */
const ReactNativeEnv = require('react-native/jest/react-native-env');

class ExpoTestEnvironment extends ReactNativeEnv {
  constructor(config, context) {
    super(config, context);

    // Lock all globals that expo/src/winter/runtime.native.ts tries to
    // override via installGlobal(). Making them non-configurable causes
    // installGlobal to skip them (it returns early with a console.error).
    const globalsToLock = [
      'TextDecoder',
      'TextDecoderStream',
      'TextEncoderStream',
      'URL',
      'URLSearchParams',
      'structuredClone',
    ];

    for (const name of globalsToLock) {
      const existing = this.global[name];
      if (existing !== undefined) {
        Object.defineProperty(this.global, name, {
          value: existing,
          configurable: false,
          enumerable: true,
          writable: false,
        });
      }
    }

    // __ExpoImportMetaRegistry doesn't exist in Node, provide a stub
    Object.defineProperty(this.global, '__ExpoImportMetaRegistry', {
      value: {
        get url() {
          return null;
        },
      },
      configurable: false,
      enumerable: true,
      writable: false,
    });
  }
}

module.exports = ExpoTestEnvironment;
