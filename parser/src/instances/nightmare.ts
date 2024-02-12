import Nightmare from "nightmare"

Nightmare.prototype.scroll_to = function( selector: string ) {
	this
		.evaluate( ( selector: string ) => {
			const e = document.querySelector( selector )

			if ( e ) {
				e.scrollIntoView( { block: "center" } )
			}
		}, selector )

	return this.wait( 600 )
}

Nightmare.prototype.eval = async function<T extends any, R>( func: ( arg: T ) => R, arg?: T ): Promise<R> {
	const result: R = await this
		.evaluate( func, arg as T )
		.then( ( x: R ) => x )
		.catch()

	return result
}

Nightmare.prototype.wait_click = function( selector: string, time?: number ) {
	return ( time ? this.wait( time ) : this.wait( selector ) ).scroll_to( selector ).click( selector )
}

Nightmare.prototype.wait_insert = function( selector: string, text: string, time?: number ) {
	return this.wait_click( selector, time ).insert( selector, text )
}

Nightmare.prototype.get_html = async function( selector?: string ) {
	//console.log( "get_html", selector )

	const html: string = await this
		.evaluate( ( selector?: string ) => {
			const e = selector ? document.querySelector( selector ) : document.body

			if ( e ) {
				return e.innerHTML
			}
		}, selector )
		.then( ( x: string ) => x )
		.catch()

	return html
}

Nightmare.prototype.get_selector_count = async function( selector: string ) {
	const count: number = await this
		.wait( 1800 )
		.evaluate(
			( s: string ) => document.querySelectorAll( s ).length,
			selector
		)
		.then( ( x: number )=> x )
		.catch()

	return count
}