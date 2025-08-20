module.exports = function(api) {
  api.cache(true);
  
  // Use different configurations based on the caller
  const caller = api.caller((caller) => caller && caller.name);
  
  if (caller === 'metro') {
    // Configuration for React Native/Expo (frontend)
    return {
      presets: ['babel-preset-expo'],
      plugins: [
        require.resolve('nativewind/babel')
      ]
    };
  }
  
  // Default configuration for other parts of the workspace
  return {
    presets: [
      ['@babel/preset-env', { targets: { node: 'current' } }]
    ]
  };
};