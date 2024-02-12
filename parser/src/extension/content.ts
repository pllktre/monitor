const listeners: KV<( data: any ) => void> = {
	evaluate: data => evaluate_page( data.id, data.func, data.arg )
}

chrome.runtime.onMessage.addListener( ( req, sender, res ) => {
	const n = req.name
	const data = req.data

	if ( listeners[n] ) {
		listeners[n]( data )
	}
} )

const add_listener = ( k: string, cb: ( data: any ) => void ) => {
	listeners[k] = cb
}

const page_send = ( name: string, data: any ) => chrome.runtime.sendMessage( { name: name, data: data } )

const evaluate_page = async ( id: number, sf: string, arg: unknown ) => {
	const func = eval( sf )
	let result = undefined

	try {
		result = func( arg )
	} catch( e ) {
		page_send( "evaluated", {
			id: id,
			error: e
		} )

		return
	}	

	if ( result instanceof Promise ) {
		console.log( "Is promise" )
		result =  await result
	}

	page_send( "evaluated", {
		id: id,
		result: result
	} )
}