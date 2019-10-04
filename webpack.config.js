const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const globule = require('globule');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const ImageminMozjpeg = require('imagemin-mozjpeg');
const PurgecssPlugin = require('purgecss-webpack-plugin');
const glob = require('glob');

const pugPaths = globule.find('./src/pug/**/*.pug', {
  ignore: ['./src/pug/**/_*/*.pug']
});
const pugTemplates = [];
pugPaths.forEach(template => {
  const filename = template.replace('./src/pug/', '').replace('.pug', '.html');
  pugTemplates.push(
    new HtmlWebpackPlugin({
      template,
      filename
    })
  );
});
const PATHS = {
  dist: path.resolve(__dirname, 'dist'),
  src: path.resolve(__dirname, 'src')
};

const skipPlugin = () => {
  return {
    apply: () => {}
  };
};

module.exports = (env, argv) => {
  const isDev = argv.mode === 'development';

  return {
    entry: './src/ts/main.ts',
    output: {
      filename: 'js/main.[hash].js',
      path: PATHS.dist
    },
    plugins: [
      new ImageminPlugin({
        disable: isDev,
        pngquant: {
          quality: '65-80'
        },
        plugins: [
          ImageminMozjpeg({
            quality: 80
          })
        ]
      }),
      isDev
        ? skipPlugin()
        : new PurgecssPlugin({
            paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true })
          }),
      new MiniCSSExtractPlugin({
        filename: 'css/style.[hash].css',
        publicPath: '../'
      }),
      new CleanWebpackPlugin(),
      ...pugTemplates
    ],
    devtool: isDev ? 'source-map' : '',
    resolve: {
      extensions: ['.ts', '.js']
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            ecma: '6',
            compress: {
              drop_console: true
            }
          }
        }),
        new OptimizeCSSAssetsPlugin()
      ]
    },
    module: {
      rules: [
        {
          test: /\.pug$/,
          use: [
            {
              loader: 'pug-loader',
              options: {
                pretty: isDev,
                root: path.resolve(__dirname, 'src/pug')
              }
            }
          ]
        },
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.(sc|c|sa)ss$/,
          use: [
            MiniCSSExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                url: true
              }
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: [require('autoprefixer')({ grid: true })]
              }
            },
            {
              loader: 'sass-loader'
            }
          ]
        },
        {
          test: /\.(gif|png|jpg|eot|wof|woff|woff2|ttf|svg)$/,
          loader: 'url-loader',
          options: {
            limit: 1000,
            name: 'assets/images/[name].[ext]'
          }
        }
      ]
    },
    devServer: {
      open: true,
      contentBase: 'dist'
    }
  };
};
