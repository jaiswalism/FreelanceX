// Polyfills for React Native / Hermes before WalletConnect & viem load
if (typeof global.crypto !== 'object') {
  (global as any).crypto = {};
}

if (typeof global.crypto.getRandomValues !== 'function') {
  global.crypto.getRandomValues = function getRandomValues(array: any) {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  };
}

// Polyfill Buffer if needed
if (typeof (global as any).Buffer === 'undefined') {
  try {
    (global as any).Buffer = require('buffer').Buffer;
  } catch {
    // optional
  }
}

