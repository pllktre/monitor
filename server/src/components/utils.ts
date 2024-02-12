export const nothing = ( x: any ): x is Nothing => x === undefined || x === null || isNaN( x )

export const debug = ( ...args: any[] ) => console.log( ...args )

export const delete_from_array = ( a: any[], x: any ) => a.splice( a.indexOf( x ), 1 )

export const copy_condition_array = <T>( a: T[], cb: ( o: T ) => boolean ) => {
	const na: T[] = []

	for ( const o of a ) {
		if ( cb( o ) ) {
			na.push( o )
		}
	}

	return na
}

export const tries = ( count: number, cb: () => void ) => {
	for ( let i = 0; i <= count; i++ ) {
		try {
			cb()
			return
		} catch( e ) {
			console.log( "Try number: " + i + "\n", e )
		}
	}
}

export function kv_map<A, B>( kv: A, cb: ( k: keyof A ) => B ): KV<B, keyof A> {
	const a: KV<B> = {}

	for ( const k in kv ) {
		a[k] = cb( k )
	}

	return a as KV<B, keyof A>
}

export const datetime_format = ( d: Date ) =>
	`${d.getHours()}:${d.getMinutes()} ${d.getDate()}.${d.getMonth()+1}`

export const unshift_delete_last = <T>( a: T[], add: T, max?: number ) => {
	const l = a.unshift( add )

	if ( !max || l > max ) {
		a.splice( l - 1, 1 )
	}
}

export const sleep = ( time: number ) => new Promise<void>( res => setTimeout( res, time * 1000 ) )