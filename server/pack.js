const AdmZip = require( "adm-zip" )

const file = new AdmZip();

file.addLocalFolder( "dist", "dist" )
file.addLocalFolder( "../ui/build", "static" )
file.addLocalFile( "package.json" )
file.writeZip( "../server.zip", ( err ) => {
	if ( err ) {
		console.log( err )
	}
} )