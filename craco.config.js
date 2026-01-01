module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Find the file-loader rule for SVG
      const fileLoaderRule = webpackConfig.module.rules.find(
        (rule) => rule.test && rule.test.test && rule.test.test('.svg')
      );

      if (fileLoaderRule) {
        // Exclude SVG files from file-loader
        fileLoaderRule.exclude = /\.svg$/;
      }

      // Add a new rule for SVG files
      webpackConfig.module.rules.push({
        test: /\.svg$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              svgoConfig: {
                plugins: [
                  {
                    name: 'removeViewBox',
                    active: false,
                  },
                ],
              },
            },
          },
          'url-loader',
        ],
      });

      return webpackConfig;
    },
  },
};