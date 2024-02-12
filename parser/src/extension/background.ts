import type { Socket } from "socket.io-client"
import type { InitParserConfig } from "../components/parsing"

import april from "../parsers/april"
import aptekaOtSklada from "../parsers/apteka-ot-sklada"
import aptekiplus from "../parsers/aptekiplus"
import farmlend from "../parsers/farmlend"
import gorzdrav from "../parsers/gorzdrav"
import medYar from "../parsers/med_yar"
import stolichki from "../parsers/stolichki"
import vitaexpress from "../parsers/vitaexpress"
import zhivika from "../parsers/zhivika"
import eapteka from "../parsers/eapteka"
import zdravcity from "../parsers/zdravcity"
import ozerki from "../parsers/ozerki"
import bapteka from "../parsers/b-apteka"
import maksavit from "../parsers/maksavit"
import aptekanabaumana from "../parsers/aptekanabaumana"
import aptekanateatralnom from "../parsers/aptekanateatralnom"
import aptekanadekabristov from "../parsers/aptekanadekabristov"
import aptekanamira from "../parsers/aptekanamira"
import aptekanagryaznova from "../parsers/aptekanagryaznova"
import aptekanagogolya from "../parsers/aptekanagogolya"
import aptekanagagarina from "../parsers/aptekanagagarina"
import aptekalenina8 from "../parsers/apteka-lenina8"
import melzdrav from "../parsers/melzdrav"
import zdorov from "../parsers/zdorov"
import aptekan1 from "../parsers/apteka_n1"
import gosApteka from "../parsers/gosApteka"
import onlinetrade from "../parsers/onlinetrade"
import goldapple from "../parsers/goldapple"
import ozon from "../parsers/ozon"
import yamarket from "../parsers/ya-market"
import aprilBasics from "../parsers/april_basics"
import aprilOnOrder from "../parsers/april-on-order"
import farmacia from "../parsers/24farmacia"
import wildberries from "../parsers/wildberries"
import minicen from "../parsers/minicen"
import rigla from "../parsers/rigla"
import moizver from "../parsers/moizver"
import aptekaOtSkladaMin from "../parsers/apteka-ot-sklada-min"
import minicenOnOrder from "../parsers/minicen-on-order"
import budzdorov from "../parsers/budzdorov"
import uteka from "../parsers/uteka"
import eaptekaSop from "../parsers/eapteka_sop"
import mirhvost from "../parsers/mirhvost"
import zdravcity2 from "../parsers/zdravcity2"

import { io } from "socket.io-client"
import { SocketParser, Parsing, Parser } from "../components/parsing"
import { nothing, sleep, get_domain, delete_from_array } from "../components/utils"

const PROXY_HOST = "217.29.62.222"
const PROXY_PORT = "10195"
const PROXY_USER = "d6btAN"
const PROXY_PASS = "otJpMU"
const MAX_EVALUATE_TRIES = 5
const PARSERS_MAP: KV<InitParserConfig<UniqueParserConfig | ExtesionParserConfig | RequestsParserConfig>> = {
	april,
	"apteka-ot-sklada": aptekaOtSklada,
	aptekiplus,
	farmlend,
	gorzdrav,
	"med.yar": medYar,
	stolichki,
	vitaexpress,
	zhivika,
	eapteka,
	zdravcity,
	ozerki,
	"b-apteka":bapteka,
	maksavit,
	aptekanabaumana,
	aptekanateatralnom,
	aptekanadekabristov,
	aptekanamira,
	aptekanagryaznova,
	aptekanagogolya,
	aptekanagagarina,
	"apteka-lenina8":aptekalenina8,
	melzdrav,
	zdorov,
	"apteka_n1":aptekan1,
	gosApteka,
	onlinetrade,
	goldapple,
	ozon,
	"ya-market":yamarket,
	"april_basics":aprilBasics,
	"april-on-order":aprilOnOrder,
	"24farmacia":farmacia,
	wildberries,
	minicen,
	rigla,
	moizver,
	"apteka-ot-sklada-min":aptekaOtSkladaMin,
	"minicen-on-order":minicenOnOrder,
	budzdorov,
	uteka,
	"eapteka_sop":eaptekaSop,
	mirhvost,
	zdravcity2
}

interface Evaluate {
	id: number
	sf: string
	arg: any
	tries: number
	time: number
	res: ( data: any ) => void
	rej: ( data: any ) => void
}

const tabs: BrowserTab[] = []

let socket: Socket | undefined = undefined

const update_socket = ( login: any ) => {
	if ( socket ) {
		socket.disconnect()
	}

	console.log( "LOGIN", login )

	const CONFIG = require( "../../../upp.config.js" )
	const HOST = CONFIG.IP + ":" + CONFIG.PORT

	socket = io( `ws://${HOST}`, {
		reconnectionDelayMax: 10000,
		path: "/api/socket/manager",
		auth: {
			extension: true,
			device: login.deviceName,
			name: login.envName,
			key: CONFIG.KEY
		}
	} )
	
	socket.on( "reload", () => chrome.runtime.reload() )
	socket.on( "launch_parser", launch_parser )
	socket.on( "connect", () => {
		if ( socket ) {
			socket.emit( "available", { available: true } )
		}
	} )
}

const socket_login = ( login: any ) => {
	update_socket( login )
}

const listen_tab = ( req: any, sender: chrome.runtime.MessageSender ) => {
	console.log( "LISTEN TAB???", req, sender )
	if ( sender.tab ) {
		for ( const tab of tabs ) {
			if ( tab.id === sender.tab.id ) {
				tab.Listened( req.name, req.data )
			}
		}
	} else if ( req.type === "socket_login" ) {
		socket_login( req.data )

		chrome.storage.local.set( { login: JSON.stringify( req.data ) }, () => console.log( "Login saved" ) )
	}
}

const tab_updated = ( id: number, info: chrome.tabs.TabChangeInfo, updatedTab: chrome.tabs.Tab ) => {
	for ( const tab of tabs ) {
		if ( tab.id === id ) {
			//console.log( "Updated iterate", info.status  )

			if ( info.status === "loading" ) {
				tab.Updated( false )
			} else if ( info.status === "complete" ) {
				tab.Updated( true )
			}
		}
	}
}

const tab_removed = ( id: number, info: any ) => {
	for ( const tab of tabs ) {
		if ( tab.id === id ) {
			tab.Closed()
		}
	}
}

const get_tabs = ( p: chrome.tabs.QueryInfo ) =>
	new Promise<chrome.tabs.Tab[]>( res => chrome.tabs.query( p, tabs => res( tabs ) ) )

export const create_tab = async ( prop: string | chrome.tabs.CreateProperties, reloadWhenError?: boolean, parser?: Parser ) => {
	const toNumber = ( x: unknown ) => typeof( x ) === "number" && !isNaN( x ) ? x : -1
	const ids: number[] = []
	let tabs = await get_tabs( {} )

	tabs.forEach( tab => ids.push( toNumber( tab.id ) ) )

	if ( typeof( prop ) === "string" ) {
		chrome.tabs.create( { url: prop } )
	} else {
		chrome.tabs.create( prop as chrome.tabs.CreateProperties )
	}

	tabs = await get_tabs( {} )

	let createdTab: BrowserTab | undefined = undefined

	for ( const tab of tabs ) {
		if ( !ids.includes( toNumber( tab.id ) ) ) {
			console.log( "userID", tab.id )
			createdTab = tab.id === -1 || nothing( tab.id ) ? undefined : new BrowserTab( tab.id, undefined, reloadWhenError )

			break
		}
	}

	if ( !createdTab ) throw( "Tab is not created: " + prop.toString() )

	if ( parser ) {
		parser.exit.Add( () => {
			if ( createdTab ) {
				createdTab.Close()
			}
		} )
	}

	return createdTab
}

export class BrowserTab {
	private evaluates: Evaluate[] = []
	private evaluateID: number = 0
	private complete: boolean = false
	private timeout: number
	private reloadWhenError: boolean
	private closed: boolean = false
	public id: number

	constructor( id: number, timeout?: number, reloadWhenError?: boolean ) {
		this.id = id
		this.timeout = nothing( timeout ) ? 60 : timeout
		this.reloadWhenError = reloadWhenError || false

		tabs.push( this )
	}

	Interval() {
		this.Check()

		const now = Date.now()

		for ( const id in this.evaluates ) {
			if ( nothing( id ) || !this.evaluates[id] ) continue

			const ev = this.evaluates[id]

			if ( ev.time + this.timeout * 1000 < now ) {
				if ( ev.tries < MAX_EVALUATE_TRIES && this.reloadWhenError ) {
					ev.tries++

					this.Reload()

					return
				} else {
					this.EvaluateFinish( id, "Evaluate timeout: " + ev.sf, true )
				}
			}
		}	
	}

	Reload() {
		this.Check()

		chrome.tabs.reload( this.id )
	}

	Updated( complete: boolean ) {
		this.Check()

		//console.log( "Updated", complete )

		this.complete = complete

		if ( complete ) {
			for ( const ev of this.evaluates ) {
				if ( !ev ) continue

				this.Send( "evaluate", {
					id: ev.id,
					func: ev.sf,
					arg: ev.arg
				} )
			}
		}
	}

	Send( name: string, data: any ) {
		this.Check()

		chrome.tabs.sendMessage( this.id, { name: name, data: data } )
	}

	Listened( name: string, data: any ) {
		this.Check()

		//console.log( name, data )

		if ( name === "evaluated" ) {
			this.Evaluated( data )
		}
	}

	Evaluated( data: any ) {
		this.Check()
		this.EvaluateFinish( data.id, data.error || data.result, !!data.error )
	}

	EvaluateFinish( id: any, data: any, error?: boolean ) {
		this.Check()

		if ( nothing( id ) || nothing( this.evaluates[id] ) ) return

		//console.log( "Eval finish", this.evaluates[id] )

		if ( error ) {
			console.log( "Evaluate error:", data )
			this.evaluates[id].rej( data )
		} else {
			this.evaluates[id].res( data )
		}

		delete this.evaluates[id]
	}

	async Evaluate<T extends any, R>( func: ( arg: T ) => R, arg?: T ): Promise<R> {
		this.Check()

		const id = this.evaluateID
		const sf = func.toString()

		//console.log( "Evaluate", {
		//	id: id,
		//	sf: sf,
		//	arg: arg,
		//	tries: 0,
		//	time: Date.now()
		//}, this.complete )

		if ( this.complete ) {
			this.Send( "evaluate", {
				id: id,
				func: sf,
				arg: arg
			} )
		}

		this.evaluateID++

		const result = await new Promise<R>( ( res, rej ) => {
			//console.log( "Evaluate set" )
			this.evaluates[id] = {
				id: id,
				sf: sf,
				arg: arg,
				tries: 0,
				time: Date.now(),
				res: res,
				rej: rej
			}
		} )

		return result
	}

	async Hover( selector: string ) {
		this.Check()

		await this.WaitSelector( selector )
		await this.Evaluate( s => {
			const e = document.querySelector( s )

			if ( e ) {
				e.dispatchEvent( new MouseEvent( "mouseover", {
					bubbles: true,
					cancelable: true
				} ) )
			}
		}, selector )
	}

	async Click( selector: string ) {
		this.Check()

		await this.WaitSelector( selector )
		console.log( "Waited", selector )
		await this.Evaluate( s => {
			const e = document.querySelector( s )

			if ( e ) {
				console.log( "Check click", e.textContent )
				console.log( "Check 2", s, e.getAttribute( "href" ) )
				
				e.dispatchEvent( new MouseEvent( "click", {
					bubbles: true,
					cancelable: true
				} ) )
			}
		}, selector )
	}

	async Insert( selector: string, value: string ) {
		this.Check()

		await this.Evaluate( ( [selector, value] ) => {
			const e = <HTMLInputElement>document.querySelector( selector )

			console.log( "Insert", !!e, value )

			if ( !e ) return

			e.value = value

			const changeEvent = document.createEvent( "Events" )
			changeEvent.initEvent( "change", true, true )
			e.dispatchEvent( changeEvent )

			const inputEvent = document.createEvent( "Events" )
			inputEvent.initEvent( "input", true, true )
			e.dispatchEvent( inputEvent )
		}, [selector, value] )
	}

	async ScrollTo( selector: string ) {
		this.Check()

		await this.Evaluate( ( selector: string ) => {
			const e = document.querySelector( selector )

			if ( e ) {
				e.scrollIntoView( { block: "center" } )
			}
		}, selector )
		await sleep( 0.6 )
	}

	async WaitCondition( cb: () => boolean, time?: number ) {
		this.Check()

		await this.Evaluate( ( [cb, time]: [string, number]) => {
			const func = eval( cb )

			if ( !func ) {
				return false
			}

			for ( let i = 0; i <= time; i++ ) {
				const result = func()

				if ( result ) {
					return true
				}
			}

			return false
		}, [cb.toString(), time || this.timeout] )
	}

	async WaitSelector( selector: string, time?: number ) {
		this.Check()

		return ( await this.Evaluate( async ( [s, n]: [string, number] ) => {
			let i = 0
		
			while ( true ) {
				const e = document.querySelector( s )

				console.log( "E", !!e, i, s )

				if ( e ) {
					return true
				}
		
				if ( i >= n ) {
					return false
				}

				i++

				await new Promise( res => setTimeout( res, 1000 ) )
			}
		}, [selector, time || this.timeout] ) )
	}

	async GoTo( url: string ) {
		this.Check()

		console.log( "BrowserTab : GoTo :", url )
		const currentUrl = await this.GetUrl()

		if ( !get_domain( url ) ) {
			url = "https://" + get_domain( currentUrl ) + url
		}

		chrome.tabs.update( this.id, { url: url } )
	}

	async GetHTML( selector?: string ) {
		this.Check()

		const html = await this.Evaluate( selector => {
			if ( !selector ) {
				return document.body.innerHTML
			}

			const e = document.querySelector( selector )

			if ( e ) {
				return e.innerHTML
			}

			return ""
		}, selector )

		return html
	}

	async GetSelectorCount( selector: string ) {
		this.Check()

		return ( await this.Evaluate( s => document.querySelectorAll( s ).length, selector ) )
	}

	async GetUrl() {
		this.Check()

		return ( await this.Evaluate( () => window.location.href ) )
	}

	async InjectScript( func: () => any ) {
		this.Check()

		this.Evaluate( sfunc => {
			const script = document.createElement( "script" )
			script.textContent = `(${sfunc})()`
			script.onload = function() {
				( this as HTMLScriptElement ).remove()
			}
			;( document.head || document.documentElement ).appendChild( script )
		}, func.toString() )
	}

	async Fetch( ...args: [RequestInfo, RequestInit] | [RequestInfo] ) {
		const data = await this.Evaluate( async ( [url, data] ) => {
			const res = await fetch( url, data )
			const body = await res.text()

			return body
		}, args )

		return data
	}

	async HasSelector( s: string ) {
		return ( await this.Evaluate( s => !!document.querySelector( s ), s ) )
	}

	SetTimeout( t: number ) {
		this.timeout = t
	}

	Check() {
		if ( this.closed ) {
			throw( "Tab is closed" )
		}
	}

	Closed() {
		this.Check()

		for ( const id in this.evaluates ) {
			this.EvaluateFinish( id, "Tab closed", true )
		}

		this.closed = true

		delete_from_array( tabs, this )
	}

	Close() {
		this.Check()

		return new Promise<void>( ( res, rej ) => {
			chrome.tabs.remove( this.id, () => {
				res()
			} )
		} )
	}
}

class ExtensionParsing extends Parsing<ExtesionParserConfig, SocketParser<ExtesionParserConfig>> {
	public tab: BrowserTab | undefined

	async Evaluate<T extends any, R>( func: ( arg: T ) => R, arg?: T ): Promise<R> {
		if ( !this.tab ) return super.Evaluate( func, arg )

		return ( await this.tab.Evaluate( func, arg ) )
	}

	async Click( selector: string ) {
		if ( !this.tab ) return

		console.log( "ExtensionParsing : Click : ", selector )

		await this.tab.Click( selector )
	}

	async Hover( selector: string ) {
		if ( !this.tab ) return

		await this.tab.Hover( selector )
	}

	async WaitSelector( selector: string ) {
		if ( !this.tab ) return

		await this.tab.WaitSelector( selector )
	}

	async GoTo( url: string ) {
		if ( !this.tab ) return

		await this.tab.GoTo( url )
	}

	async GetHTML() {
		if ( !this.tab ) return super.GetHTML()

		return ( await this.tab.GetHTML() )
	}

	async GetSelectorCount( selector: string ) {
		if ( !this.tab ) return super.GetSelectorCount( selector )

		return ( await this.tab.GetSelectorCount( selector ) )
	}

	async GetUrl() {
		if ( !this.tab ) return super.GetUrl()

		return ( await this.tab.GetUrl() )
	}

	async PageFunction() {
		if ( this.parser.cfg.pageFunc ) {
			console.log( "Parsing : ParseItems :" )

			await this.parser.cfg.pageFunc( this )
		}
	}

	async Init() {
		this.tab = await create_tab( this.parser.cfg.siteUrl )

		if ( !this.tab ) return

		await sleep( 30 )

		if ( this.parser.cfg.selectCity ) {
			await this.parser.cfg.selectCity( this.tab )
		}
		
		await super.Init()

		this.tab.Close()
	}

	Exit() {
		if ( this.tab ) {
			this.tab.Close()
		}
	}
}

const launch_parser = async ( params: KV<string> ) => {
	console.log( "launch_parser : ", params )
	
	const cfg = PARSERS_MAP[params.parser]

	console.log( "cfg:", !!cfg )
	console.log( PARSERS_MAP )

	if ( !cfg ) return

	console.log( "try" )
	
	const parser = new SocketParser<ExtesionParserConfig | UniqueParserConfig | RequestsParserConfig>( cfg, params )

	try {

		console.log( "parser" )

		if ( parser.ConfigIsUnique() ) {
			console.log( "unique" )
			await parser.cfg.func()
		} else if ( parser.ConfigIsExtension() ) {
			const parsing = new ExtensionParsing( parser )

			parser.exit.Add( () => parsing.Exit() )

			await parsing.Init()
		}

		await parser.Success()
	} catch( e ) {
		console.error( `Parser '${params.id}' thread error with: ${e}` )
		await parser.Failed()
	}

	parser.Exit()
}

chrome.storage.onChanged.addListener( ( a, b ) => {
	console.log( "Storage update", a, b )
} )

;( () => {
	chrome.runtime.onMessage.addListener( listen_tab )
	chrome.tabs.onUpdated.addListener( tab_updated )
	chrome.tabs.onRemoved.addListener( tab_removed )

	chrome.storage.local.get( ["login"], data => {
		if ( !data.login ) return

		update_socket( JSON.parse( data.login ) )
	} )
	
	setInterval( () => tabs.forEach( tab => tab.Interval() ), 0 )

	console.log( "Background", Date.now() / 1000 )

	//launch_parser( { parser: "test", city: "Москва"} )
} )()