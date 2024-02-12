import type { HTMLElement } from "node-html-parser"
import type { Socket } from "socket.io-client"

import { parse } from "node-html-parser"
import { io } from "socket.io-client"
import { http_get } from "./http"
import {
	nothing,
	delete_from_array,
	stopped_page,
	insert_string,
	sleep,
	fix_price,
	is_valid_price,
	get_domain,
	PseudoEvent
} from "./utils"

const CONFIG = require( "../../../upp.config.js" )
const HOST = CONFIG.IP + ":" + CONFIG.PORT

const allParsers: Parser[] = []

export type InitParserConfig<T extends ParserConfig=ParserConfig> = ( p: Parser ) => T

export class Parser<T extends ParserConfig=ParserConfig> {
	protected cache: KV<KV<string>> = {}
	protected storage: ParserStorage = {}
	public exit: PseudoEvent<void> = new PseudoEvent()
	public params: KV<string>
	public cfg: T

	constructor( cfg: InitParserConfig<T>, params: KV<string> ) {
		this.params = params
		this.cfg = cfg( this )

		allParsers.push( this )
	}

	async Init() {
		( this.cfg.params || [] ).forEach( x => {
			if ( nothing( this.params[x] ) ) throw( "Hast must have param: " + x )
		} )

		if ( this.cfg.init ) {
			await this.cfg.init()
		}
	}

	Log( ...args: any[] ) {
		console.log( ...args )
	}

	SetCache( c: string, kv: KV<string> ) {
		this.cache[c] = kv
	}

	UpdateCache( n: string, k: string, v: string ) {
		if ( nothing( this.cache[n] ) ) return

		this.cache[n][k] = v
	}

	AddCache( n: string, k: string, v: string ) {
		this.UpdateCache( n, k, v )
	}

	GetCache( n: string, k: string ) {
		if ( nothing( this.cache[n] ) ) return

		return this.cache[n][k]
	}

	SetStorage( s: ParserStorage ) {
		this.storage = s
	}

	AddStorage( k: string, v: string | undefined ) {
		this.storage[k] = v
	}

	GetStorage( k: string ) {
		return this.storage[k]
	}

	AddItem( item: InvalidItemRow ) {}

	IsValidItem( item: InvalidItemRow, itemValidate?: Array<keyof InvalidItemRow> ): item is ItemRow {
		itemValidate = itemValidate || this.cfg.itemValidate

		if ( !nothing( item.price ) ) {
			const validPrice = fix_price( item.price )

			if ( !is_valid_price( validPrice ) ) return false

			item.price = validPrice
		}

		if ( !nothing( itemValidate ) ) {
			for ( let p of itemValidate ) {
				if ( nothing( item[p] ) ) {
					return false
				}
			}

			return true
		} else {
			return !nothing( item.name ) && !nothing( item.price )
		}
	}

	async ItemFunction( item: InvalidItemRow, ie: HTMLElement, i: number ) {
		if ( this.cfg.itemFunc ) {
			try {
				await this.cfg.itemFunc( item, ie, i )
			} catch( e ) {
				console.log( "Break item function", e )
			}
		} else {
			this.AddItem( item )
		}
	}

	async ParseItems( html: string ) {
		if ( !this.cfg.itemSelector || !this.cfg.itemParams ) return

		const body = parse( html )
		const elements = body.querySelectorAll( this.cfg.itemSelector )
		const startItem = Number( this.GetStorage( "item" ) )

		console.log( "Parser : ParseItems :", html.length, elements.length )

		for ( let i = nothing( startItem ) ? 0 : startItem; i < elements.length; i++ ) {
			const ie = elements[i]
			const item: InvalidItemRow = {}

			this.AddStorage( "item", i.toString() )

			for ( const k in this.cfg.itemParams ) {
				const [selector, key, sample] = this.cfg.itemParams[k]
				const e = selector ? ie.querySelector( selector ) : ie

				if ( nothing( e ) ) { continue }

				let v = e.textContent || undefined

				if ( key ) {
					v = e.getAttribute( key ) || v
				}

				if ( v && sample ) {
					const [reg, i] = sample
					const exec = reg.exec( v )
					reg.lastIndex = 0

					if ( exec ) {
						v = exec[i] || v
						//console.log( "Parser : ParseItems : exec param", exec, exec[i], i )
					}
				}

				if ( typeof( v ) !== "string" ) continue

				item[k as keyof InvalidItemRow] = v.replace( /^\s+|\s+$|\t|\n/g, "" ).replace( " ", " " )
			}

			console.log( "Iterate item", item )

			await this.ItemFunction( item, ie, i )
		}

		this.AddStorage( "item", undefined )
	}

	async ParseItemsProduct( html: string ) {
		if ( !this.cfg.itemSelector || !this.cfg.itemParams ) return

		const body = parse( html )
		const elements = body.querySelectorAll( this.cfg.itemSelector )
		const startItem = Number( this.GetStorage( "item" ) )

		console.log( "Parser : ParseItems :", html.length, elements.length )

		for ( let i = nothing( startItem ) ? 0 : startItem; i < elements.length; i++ ) {
			const ie = elements[i]
			const item: InvalidItemRow = {}

			this.AddStorage( "item", i.toString() )

			for ( const k in this.cfg.itemParams ) {
				const [selector, key, sample] = this.cfg.itemParams[k]
				const e = selector ? ie.querySelector( selector ) : ie

				if ( nothing( e ) ) { continue }

				let v = e.textContent || undefined

				if ( key ) {
					v = e.getAttribute( key ) || v
				}

				if ( v && sample ) {
					const [reg, i] = sample
					const exec = reg.exec( v )
					reg.lastIndex = 0

					if ( exec ) {
						v = exec[i] || v
						//console.log( "Parser : ParseItems : exec param", exec, exec[i], i )
					}
				}

				if ( typeof( v ) !== "string" ) continue

				item[k as keyof InvalidItemRow] = v.replace( /^\s+|\s+$|\t|\n/g, "" ).replace( " ", " " )
			}

			console.log( "Iterate item", item )

			await this.ItemFunction( item, ie, i )
			var amount_per_page = this.GetStorage('item'); //!!!!!
		}

		this.AddStorage( "item", undefined )
		return Number(amount_per_page); //!!!!!
	}
	

	Exit() {
		this.exit.Trigger()

		delete_from_array( allParsers, this )
	}

	Success() {}

	ConfigIsNightmare(): this is Parser<NightmareParserConfig> {
		return this.cfg.type === "nightmare"
	}

	ConfigIsUnique(): this is Parser<UniqueParserConfig> {
		return this.cfg.type === "unique"
	}

	ConfigIsExtension(): this is Parser<ExtesionParserConfig> {
		return this.cfg.type === "extension"
	}

	ConfigIsRequests(): this is Parser<RequestsParserConfig> {
		return this.cfg.type === "requests"
	}

	ConfigIsDefault(): this is Parser<NightmareParserConfig> | Parser<ExtesionParserConfig> | Parser<RequestsParserConfig> {
		return this.ConfigIsRequests() || this.ConfigIsExtension() || this.ConfigIsNightmare()
	}

	Failed() {}
}

export class SocketParser<T extends ParserConfig=ParserConfig> extends Parser<T> {
	private socket: Socket<TParserFromServerEvents, TParserToServerEvents>

	constructor( cfg: InitParserConfig<T>, params: KV<string> ) {
		super( cfg, params )

		this.socket = io( `ws://${HOST}`, {
			reconnectionDelayMax: 10000,
			path: "/api/socket/parser",
			auth: {
				key: CONFIG.KEY,
				id: params.id,
				params: params
			}
		} )

		this.socket.on( "exit", () => this.Exit() )
		this.socket.on( "cache", data => this.UpdateCache( ...data ) )
		this.socket.on( "storage", data => {
			console.log( "Storag setted", data )
			super.SetStorage( data )
		} )
		
		this.Auth()
	}

	async Auth() {
		await new Promise<void>( ( res, rej ) => {
			this.socket.on( "authed", id => {
				( this.socket.auth as KV ).id = id
				console.log( "Authed", id )
				res()
			} )
		} )

		console.log( "Authed promise solved" )

		for ( const c of this.cfg.cache || [] ) {
			const data = await http_get( `http://${HOST}/api/cache?parser=${this.params.parser}&cache=${c}` )
			const cache = JSON.parse( data )

			super.SetCache( c, cache )
		}

		console.log( "Cache setted" )
	}

	Log( ...args: any[] ) {
		console.log( ...args )
	
		this.socket.emit( "log", args.map( x => x.toString() ).join( ", " ) )
	}

	AddCache( n: string, k: string, v: string ) {
		super.AddCache( n, k, v )
		this.socket.emit( "cache", [n, k, v] )
	}

	SetStorage( s: ParserStorage ) {
		super.SetStorage( s )
		this.socket.emit( "storage", s )
	}

	AddStorage( k: string, v: string | undefined ) {
		super.AddStorage( k, v )
		this.socket.emit( "storage", this.storage )
	}

	AddItem( item: InvalidItemRow ) {
		if ( this.IsValidItem( item, this.cfg.itemValidate ) ) {
			this.socket.emit( "item", item )
		}
	}

	Success() {
		this.socket.emit( "success" )
	}

	Failed() {
		this.socket.disconnect()
	}
}

export class Parsing<C extends ParserConfigDefaults=ParserConfigDefaults, P extends Parser<C>=Parser<C>> {
	protected exited: boolean = false
	protected parser: P

	constructor( parser: P ) {
		this.parser = parser
	}

	async Evaluate<T extends any, R>( func: ( arg: T ) => R, arg?: T ): Promise<R> {
		return func( arg as T )
	}

	async Click( selector: string ) {}
	
	async Hover( selector: string ) {}

	async WaitSelector( selector: string ) {}

	async GoTo( url: string ) {}

	async GetHTML() {
		return ""
	}

	async GetSelectorCount( selector: string ) {
		return -1
	}

	async GetUrl() {
		return ""
	}

	async LoadMore( items: string | undefined, button: string ) {
		let lastLoadMore = 0

		for ( let i = 0; i < 40; i++ ) {
			console.log( "Check need load more", lastLoadMore )

			try {
				await this.WaitSelector( button )
			} catch( e ) {}

			await sleep( this.Delay( "loadMoreB", 3 ) )

			console.log( "Waited load more" )

			const [need, html] = await this.Evaluate( ( a: [string | undefined, string] ) => {
					const [items, button] = a
					const load = document.querySelector<HTMLDivElement>( button )
					const list = document.querySelector<HTMLDivElement>( items || "body" ) || document.body
					const html = list.innerHTML

					if ( load ) {
						load.scrollIntoView( { block: "center" } )
					}

					if ( !load || load.style.display == "none" ) {
						return [false, html.length]
					}

					return [true, html.length]
			}, [items, button] )

			console.log( "Evaluated" )

			if ( !need || html === lastLoadMore ) {
				console.log( "Not need load more", !need, html === lastLoadMore, html )
				break
			}

			lastLoadMore = html

			try {
				await this.Click( button )
				await sleep( 10 )
			} catch( e ) {}

			console.log( "Clicked load more" )
		}

		await sleep( this.Delay( "loadMoreB", 10 ) )
	}

	async PageFunction() {}

	async Init() {
		await sleep( 4 )

		await this.ParseCategories( 0, [] )
	}

	async SelectCategory( index: number, i: number, msg?: string ) {
		if ( !this.parser ) return

		await sleep( this.Delay( "categoryB", 2 ) )

		const cs = this.parser.cfg.categorySelectors[index]

		console.log( "Parsing : SelectCategory :", index, i, cs ? cs.s : undefined, msg )

		if ( cs ) {
			await sleep( 1.6 )

			const s = insert_string( cs.s, `:nth-child(${i})` )

			console.log( "Parsing : SelectCategory :", s, cs )

			if ( cs.h ) {
				await this.Hover( s )
			} else {
				await this.Click( s )

				//const url = await this.Evaluate( s => {
				//const e = document.querySelector<HTMLAnchorElement>( s )

				//	if ( e ) {
				//		console.log( e.href )
				//		e.click()

				//		return e.href
				//	}
				//}, s )

				//console.log( "CATEGORY URL", url )
			}
			return true
		} else {
			return false
		}

		await sleep( this.Delay( "categoryA", 10 ) )
	}

	async BackCategory( prev: number[] ) {
		console.log( "Parsing : BackCategory :", prev )
	
		for ( const i in prev ) {
			await this.SelectCategory( Number( i ), prev[i], "Back" )
		}
	}

	async ParseCategories( index: number, prev: number[] ) {
		if ( !this.parser ) return

		console.log( "Parsing : ParseCategories :", index, prev, this.parser.cfg.categorySelectors[index] )

		const cs = this.parser.cfg.categorySelectors[index]
	
		if ( nothing( cs ) ) {
			await this.ParsePages()

			return
		}

		const parser = this.parser

		await sleep( this.Delay( "parseCategory", 4 ) )

		const html = await this.GetHTML()
		const body = parse( html )
		const categories = body.querySelectorAll( insert_string( cs.s, "" ) )
		const count = await this.GetSelectorCount( insert_string( cs.s, "" ) )
		//const count = categories.length
		const first = Number( parser.GetStorage( "category_" + index ) )
		const start = !nothing( first ) && first <= count ? first : count

		console.log( "Parsing : WithSelector : count", count, start, cs.s )
	
		for ( let i = start; i > 0; i-- ) {
			const cat = categories[i - 1]

			console.log( "Iterate selector", cat ? cat.textContent : "Not cat >~<", i, cs.i )

			const s = insert_string( cs.s, `:nth-child(${i})` )

			if ( cs.i && !cs.i.includes( i ) ) continue
	
			prev.push( i )
			parser.AddStorage( "category_" + index, i.toString() )

			await this.SelectCategory( index, i )
			console.log( "Parsing : ParseCategories : Start", index, i, prev )
			await this.ParseCategories( index + 1, prev )
			console.log( "Parsing : ParseCategories : Stop", index, i, prev )

			prev.pop()
			parser.AddStorage( "category_" + index, undefined )

			await this.BackCategory( prev )
		}

		if ( cs.o && count < 1 ) {
			await this.ParsePages()
		}
	}

	async ParsePages() {
		if ( !this.parser ) return

		if ( this.parser.cfg.itemSelector ) {
			try {
				await this.WaitSelector( this.parser.cfg.itemSelector )
			} catch( e ) {
				console.log( "No waited item selector!" )

				return
			}
		}

		console.log( "Parsing : ParsePages : item selector waited" )

		await sleep( this.Delay( "page", 7 ) )

		let pageNum = stopped_page( this.parser.GetStorage( "page" ), 1 )
		let html = 0

		while ( true ) {
			const p = await this.ShiftPageWithMethod( pageNum, this.parser.cfg.shiftPageMethod )

			await sleep( 3 )

			const newHTML = await this.GetHTML()

			console.log( "Parsing : ParsePages : HTMLs", html, newHTML.length, await this.GetUrl() )

			if ( html === newHTML.length ) {
				break
			}

			html = newHTML.length

			await this.ParseItems()

			if ( p ) {
				pageNum = p
				this.parser.AddStorage( "page", pageNum.toString() )
			} else {
				console.log( "No shift page" )
				break
			}
		}

		this.parser.AddStorage( "page", undefined )
	}

	async ShiftPageWithMethod( page: number, m: ShiftPageMethod | undefined ) {
		if ( !m ) return

		const [t] = m

		if ( t === "url" ) {
			console.log( "Parsing : ShiftPageWithMethod : url", m )

			return ( await this.ShiftPageUrl( page, m as ShiftPageUrl ) )
		} else if ( t === "turl" ) {
			console.log( "Parsing : ShiftPageWithMethod : turl", m )

			return ( await this.ShiftPageTransformUrl( page, m as ShiftPageTransformUrl ) )
		}

		return page
	}

	async ShiftPageUrl( page: number, m: ShiftPageUrl ) {
		const [_, query, mh] = m
		const url = await this.GetUrl()

		console.log( "Parsing : ShiftPageUrl : url: ", url, " replaced: ", url.replace( /\?.*$/g, "" ) + "?" + insert_string( query, page ) )

		await this.GoTo( url.replace( /\?.*$/g, "" ) + "?" + insert_string( query, page ) )

		const mustHave = mh || this.parser.cfg.itemSelector

		if ( mustHave && ( await this.GetSelectorCount( mustHave ) ) > 0 ) {
			return page + 1
		}
	}

	async ShiftPageTransformUrl( page: number, m: ShiftPageTransformUrl ) {
		const [_, transform, mh] = m
		const url = await this.GetUrl()

		await this.GoTo( transform( page, url ) )

		const mustHave = mh || this.parser.cfg.itemSelector

		if ( mustHave && ( await this.GetSelectorCount( mustHave ) ) > 0 ) {
			return page + 1
		}
	}

	async ParseItems() {
		console.log( "Parsing : ParseItems" )

		if ( !this.parser ) return

		await this.PageFunction()

		const html = await this.GetHTML()

		await this.parser.ParseItems( html )

		if ( this.exited ) {
			throw( "Exited" )
		}
	}

	Delay( name: TOverrideDelayName, alt: number ) {
		return this.parser.cfg.ovrrdls ? this.parser.cfg.ovrrdls[name] || alt : alt
	}

	Exit() {
		this.exited = true
	}
}

export class RequestsParsing extends Parsing<RequestsParserConfig> {
	private currentUrl: string = ""
	private currentHTML: string = ""
	private currentBody: HTMLElement = parse( "" )

	GetDomain() {
		const domain = get_domain( this.currentUrl )

		if ( !nothing( domain ) ) {
			return domain
		}

		console.log( "RequestsParsing : GetDomain :", this.currentUrl, domain )
		throw( "Invalid Get domain" )
	}

	async GetHTML() {
		return this.currentHTML
	}

	async GoTo( url: string ) {
		console.log( "RequestsParsing : GoTo : 1", url )

		if ( !get_domain( url ) ) {
			url = "https://" + this.GetDomain() + url
		}

		this.currentUrl = url
		this.currentHTML = await http_get( this.currentUrl )
		this.currentBody = parse( this.currentHTML )

		console.log( "RequestsParsing : GoTo : 2", this.currentHTML.length )
	}

	async Click( selector: string ) {
		const element = this.currentBody.querySelector( selector )

		if ( element ) {
			const href = element.getAttribute( "href" )

			console.log( "RequestsParsing : Click :", href, selector )

			if ( href ) {
				await this.GoTo( href )
			}
			console.log( "RequestsParsing : Click : Clicked" )
		}
	}

	async GetSelectorCount( selector: string ) {
		return this.currentBody.querySelectorAll( selector ).length
	}

	async GetUrl() {
		return this.currentUrl
	}

	async Init() {
		await this.GoTo( this.parser.cfg.siteUrl )
		await super.Init()
	}
}