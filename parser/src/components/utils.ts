export const nothing = ( x: any ): x is Nothing => x === undefined || x === null || typeof( x ) === "number" && isNaN( x )

export const try_async = async <T>( cb: () => Promise<T>, output?: boolean ): Promise<T | undefined> => {
	try {
		return ( await cb() )
	} catch( e ) {
		if ( output ) {
			console.error( e )
		}
	}
}

export const replace_all = ( a: string, b: string, c: string ) => {
	while ( true ) {
		const d = a
		a = a.replace( b, c )

		if ( d === a ) break 
	}

	return a
}

export const insert_string = ( s: string, ...args: Array<string | number> ) => {
	for ( let i in args ) {
		if ( !nothing( args[i] ) ) {
			s = replace_all( s, "{" + i + "}", args[i].toString() )
		}
	}

	return s
}

export const insert_string_kv = ( s: string, o: KV<string | number> ) => {
	for ( let k in o ) {
		if ( !nothing( o[k] ) ) {
			s = replace_all( s, "{" + k + "}", o[k].toString() )
		}
	}

	return s
}

export const delete_from_array = ( a: any[], v: any ) => {
	const i = a.indexOf( v )

	if ( i !== -1 ) {
		a.splice( i, 1 )
	}
}

export const any_to_string = ( any: any ): string => {
	const t = typeof( any )

	if ( t === undefined ) {
		return "undefined"
	} else if ( t === "number" || t === "string" ) {
		return any
	} else if ( t === "object" ) {
		return JSON.stringify( any )
	}

	return "Unknown"
}

export const string_array_to_kv = ( a: string[] ) => {
	const kv: KV<string> = {}
	
	for ( let s of a ) {
		const [k, v] = s.split( "=" )
	
		if ( k === undefined || v === undefined ) { continue }
	
		kv[k] = v
	}

	return kv
}

export const sleep = ( time: number ) => new Promise<void>( res => setTimeout( res, time * 1000 ) )

export const stopped_page = ( stoppedPage: string | Nothing, page: number ) => {
	const sp = Number( stoppedPage )

	if ( !nothing( sp ) && sp > page ) {
		return sp
	}

	return page
}

export const fix_price = ( price: string ) => price.replace( /[^\d.,]/g, "" ).replace( ",", "." ).replace( /^([^\.]*\.)|\./g, "$1" )

export const is_valid_price = ( price: string | undefined ) => {
	if ( nothing( price ) ) return false

	const num = Number( price )

	return !( nothing( num ) || num <= 0 || price === "" )
}

export const get_domain = ( url: string ) => {
	const reg = /:\/\/([^\/]+)/g.exec( url )

	if ( reg && reg[1] ) {
		return reg[1]
	}
}

export const random_int = ( min: number, max: number ) => min + Math.floor( Math.random() * ( max - min + 1 ) )

export class PseudoEvent<T> {
	private callbacks: Array<( data: T ) => void> = []

	Add( cb: ( data: T ) => void ) {
		this.callbacks.push( cb )
	}

	Trigger( data: T ) {
		this.callbacks.forEach( cb => {
			try {
				cb( data )
			} catch ( e ) {
				console.error( e )
			}
		} )
	}
}