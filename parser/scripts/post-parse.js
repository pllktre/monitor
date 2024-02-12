const fs = require( "fs" )
const { exec } = require( "child_process" )

const readyPath = `local/ready`

const sleep = ( t ) => new Promise( ( res, rej ) => setTimeout( res, t ) )

const load = ( path ) => {
	return new Promise( ( res, rej ) => {
		const child = exec( `py -m wdd.parsing.norm_prices "${path}" -u --copy` )
		child.stdout.pipe( process.stdout )
		child.on( "exit", () => res() )
	} )
}

;( async () => {
	for ( let i = 0; i < 30; i++ ) {
		try {
			const files = fs.readFileSync( readyPath, "utf8" ).split( "\n" )
			fs.writeFileSync( readyPath, "" )

			for ( const file of files ) {
				if ( !file || file == "" ) continue

				const path = "../" + file

				console.log( path )

				if ( fs.existsSync( path ) ) {
					await load( path )
					await sleep( 200 )
					fs.rename( path, `../${Date.now()} ${file}`, err => console.log( err ) )
				}
			}

			break
		} catch( e ) {
			console.log( "Try :", i, "Error: ", e )
			await sleep( 1000 )
		}
	}
} )()