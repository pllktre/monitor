const webpack = require( "webpack" )

module.exports = env => ( {
	entry: `./dist/extension/${ env.BG === "1" ? "background" : "content" }.js`,
	module: {
		rules: [
			{ test: /\.js$/, use: "babel-loader" }
		]
	},
	output: {
		path: __dirname + "/extension",
		filename: env.BG === "1" ? "background.js" : "content.js"
	},
	mode: "production"
} )