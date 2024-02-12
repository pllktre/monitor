import needle from "needle"

export const http_get = async ( url: string ) => {
	const response = await needle( "get", url )

	return response.body
}

export const http_post = ( url: string, body: any ) =>
	new Promise( ( resolve, reject ) => {
		needle.post( url, body, ( err, res ) => {
			if ( err ) {
				reject( err )
			} else {
				resolve( res.body )
			}
		} )

	} )