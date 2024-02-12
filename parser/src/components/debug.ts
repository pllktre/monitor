type DebugMode = boolean | RegExp[]
type DebugAction = ( ...args: any[] ) => void

const debugActions: Array<{ reg: RegExp, cb: DebugAction }> = []
let debugMode: DebugMode = true

export const use_debug_action = ( reg: RegExp, cb: DebugAction ) => debugActions.push( { reg: reg, cb: cb } )

export const set_debug_mode = ( mode: DebugMode ) => {
	debugMode = mode
}

export const debug = ( tags: string, ...args: any ) => {
	if ( debugMode === true ) {
		console.log( ...args )
	} else if ( debugMode !== false ) {
		for ( const reg of debugMode ) {
			if( reg.test( tags ) ) {
				console.log( ...args )
				break
			}
		}
	}

	debugActions.forEach( a => {
		if( a.reg.test( tags ) ) {
			a.cb( ...args )
		}
	} )
}