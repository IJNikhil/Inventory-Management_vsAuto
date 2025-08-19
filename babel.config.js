// module.exports = function (api) {
//   api.cache(true);
//   return {
//     presets: ['module:@react-native/babel-preset'],
//     plugins: [
//       [
//         'module-resolver',
//         {
//           root: ['./'],
//           alias: {
//             '@': './src',
//           },
//         },
//       ],
//       'nativewind/babel',
//       'react-native-reanimated/plugin',
//     ],
//   };
// };


// babel.config.js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
    plugins: [
    'react-native-reanimated/plugin', // ← MUST be the last plugin
  ],
};