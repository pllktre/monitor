const exec = require( "child_process" ).exec

const start = () => {
	return new Promise( ( res, rej ) => {
		const child = exec( "node dist/main.js -- " + process.argv.map( x => `"${x}"` ).join( " " ) )
		child.stdout.pipe( process.stdout )
		child.on( "exit", ( code ) => res( code ) )
	} )
}

;( async () => {
	for ( let i = 0; i < 30; i++ ) {
		const code = await start()

		if ( code === 1337 ) {
			return
		} else {
			console.log( "Failed, try", i )
		}
	}
} )()