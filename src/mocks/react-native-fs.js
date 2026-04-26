// Mock for react-native-fs — tfjs-react-native's bundle_resource_io imports
// this, but we don't use bundleResourceIO in our code. An empty module
// prevents the Metro bundler from failing in Expo Go.
module.exports = {};
