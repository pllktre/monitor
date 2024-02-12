const AdmZip = require( "adm-zip" )
const fs = require( "fs" )
const FormData = require( "form-data" )

const file = new AdmZip();

file.addLocalFolder( "dist", "dist" )
file.addLocalFolder( "extension", "extension" )
file.addLocalFolder( "scripts", "scripts" )
file.addLocalFile( "package.json" )
file.addLocalFile( "webpack.config.js" )
file.writeZip( "build.zip", ( err ) => {
	if ( err ) {
		console.log( err )
	}
} )