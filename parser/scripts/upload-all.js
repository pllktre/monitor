const fs = require( "fs" )
const { exec } = require( "child_process" )

const sleep = ( t ) => new Promise( ( res, rej ) => setTimeout( res, t ) )

const upload = ( path ) => {
	return new Promise( ( res, rej ) => {
		const child = exec( `py -m wdd.parsing.norm_prices "${path}" -u --copy` )
		child.stdout.pipe( process.stdout )
		child.on( "exit", () => res() )
	} )
}

;( async () => {
	const files = fs.readdirSync( ".." )

	for ( const file of files ) {
		const path = "../" + file

		if ( !fs.statSync( path ).isFile() ) continue
		if ( file.slice( -4 ) !== ".csv" ) continue
		if ( file.slice( 0, 3 ) === "162" ) continue

		console.log( file )

		if ( fs.existsSync( path ) ) {
			await upload( path )
		}
	}

	console.log( "Uploaded" )
} )()