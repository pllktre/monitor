const request = require( "request" )
const fs = require( "fs" )
const FormData = require( "form-data" )

const CONFIG = require( "../../upp.config.js" )

const form = new FormData()
form.append( "filedata", fs.createReadStream( "build.zip" ) )
form.submit( `http://${CONFIG.UPLOAD_ADRESS ? CONFIG.UPLOAD_ADRESS : `${CONFIG.IP}:${CONFIG.PORT}`}/api/upload`, ( err, res ) => {
	console.log( !!err, !!res )
	if ( res ) {
		res.resume()
	} else if ( err ) {
		console.log( "Error:", err )
	} else {
		console.log( "Unknown" )
	}
} )