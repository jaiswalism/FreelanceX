import '@walletconnect/react-native-compat';
import 'react-native-get-random-values';

// Polyfill crypto.getRandomValues for viem in React Native environment
if (typeof global.crypto !== 'object') {
  global.crypto = {};
}
if (typeof global.crypto.getRandomValues !== 'function') {
  global.crypto.getRandomValues = function getRandomValues(array) {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  };
}

import { AppRegistry } from 'react-native';
import App from './App';

AppRegistry.registerComponent('FreelancerX', () => App);
