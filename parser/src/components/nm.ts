import type { HTMLElement } from "node-html-parser"
import type { Parser } from "./parsing"

import { parse } from "node-html-parser"
import Nightmare from "nightmare"
import { Parsing } from "./parsing"
import { nothing, insert_string, sleep } from "./utils"

export class NightmareParsing extends Parsing<NightmareParserConfig> {
	public nm: Nightmare

	constructor( parser: Parser<NightmareParserConfig> ) {
		super( parser )

		this.nm = new Nightmare( { show: parser.cfg.show, waitTimeout: parser.cfg.timeout } )
	}

	async Evaluate<T extends any, R>( func: ( arg: T ) => R, arg?: T ): Promise<R> {
		return ( await this.nm.eval( func, arg ) )
	}

	async Click( selector: string ) {
		await this.nm.wait_click( selector )
	}

	async Hover( selector: string ) {
		await this.nm.mouseover( selector )
	}

	async WaitSelector( selector: string ) {
		await this.nm.wait( selector )
	}

	async GoTo( url: string ) {
		await this.nm.goto( url )
	}

	async GetHTML() {
		return ( await this.nm.get_html() )
	}

	async GetSelectorCount( selector: string ) {
		return ( await this.nm.get_selector_count( selector ) )
	}

	async GetUrl() {
		return this.nm.url()
	}

	async PageFunction() {
		if ( this.parser.cfg.pageFunc ) {
			console.log( "Parsing : ParseItems :" )

			await this.parser.cfg.pageFunc( this )
		}
	}

	async Init() {
		await this.nm
			.viewport( 1400, 900 )
			.goto( this.parser.cfg.siteUrl )
			.wait( 2000 )

		if ( this.parser.cfg.selectCity ) {
			await this.parser.cfg.selectCity( this.nm )
		}

		await super.Init()
	}
}