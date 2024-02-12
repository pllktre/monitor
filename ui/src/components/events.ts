import React from "react"

interface ISubscribe {
	eventName: string
	callback: ( data: any ) => void
}

const values: KV<any> = {}
const subscribes: ISubscribe[] = []

export function dispatch<T extends keyof IReactEvents>( eventName: T, data: IReactEvents[T] | undefined ) {
	values[eventName] = data

	for ( const sub of subscribes ) {
		if ( sub.eventName === eventName ) {
			sub.callback( data )
		}
	}
}

export function subscribe<T extends keyof IReactEvents>( eventName: T, callback: ( data: IReactEvents[T] | undefined ) => void ): () => void {
	const sub: ISubscribe = { eventName, callback }
	subscribes.push( sub )

	callback( values[eventName] )

	return () => subscribes.splice( subscribes.indexOf( sub ), 1 )
}

export function R_subscribe<T extends keyof IReactEvents, O extends IReactEvents[T]>( eventName: T, other?: O ): IReactEvents[T] | O {
	const [data, setData] = React.useState<any>( other )
	React.useEffect( () => subscribe( eventName, data => setData( data || other ) ), [] )

	return data
}