const { exec } = require( "child_process" )
let nextClearTime = Date.now()

setInterval( () => {
	const now = Date.now()

	if ( now >= nextClearTime ) {
		nextClearTime = now + 12 * 60 * 60 * 1000

		exec( 'taskkill /IM "electron.exe" /F' )
		exec( 'taskkill /IM "EXCEL.exe" /F' )

		console.log( "clear", new Date( Date.now() ).toString() )
	}
}, 10 )