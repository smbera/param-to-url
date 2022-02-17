const config = {
	optimization: {
		minimize: false,
	},
	devtool: 'source-map',
	mode: 'production',
	entry: {
		app: './src/index.ts'
	},
	output: {
		filename: 'index.js',
		libraryTarget: 'umd'
	},
	resolve: {
		extensions: ['.ts', '.js', '.json']
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							[
								'@babel/preset-env', {
									targets: {
										browsers: ['>1%']
									}
								}
							]
						],
					}
				}
			},
			{
				test: /\.tsx?$/,
				use: 'ts-loader'
			}
		]
	},
}

module.exports = config;
