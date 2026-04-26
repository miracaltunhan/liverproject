const {getDefaultConfig} = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('glb', 'gltf', 'vrx', 'obj', 'mtl', 'bin', 'tflite');

// tfjs-react-native internally imports react-native-fs (bundle_resource_io)
// which is a native module unavailable in Expo Go. We point it to an empty
// mock so Metro can bundle without errors. We don't use bundleResourceIO.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-native-fs': path.resolve(__dirname, 'src/mocks/react-native-fs.js'),
};

module.exports = config;
