import type { Manager } from "./manager"
import fs from "fs"
import { Socket } from "socket.io"
import { parsers_updated, parsers_scheme_updated } from "./ui"
import { get_suitable_manager } from "./manager"
import {
	nothing,
	delete_from_array,
	tries,
	kv_map,
	datetime_format,
	unshift_delete_last,
	sleep
} from "./utils"
import {
	insert_db_temp_items,
	insert_db_parser,
	db_items_from_temp,
	insert_db_cache,
	update_db_parser_state,
	update_db_parser_storage,
	send_db_email,
	get_db_parsers_scheme,
	get_db_parsers
} from "./db"

const MAX_LOG_STRINGS = 300
const MAX_ITEMS_HISTORY = 100

let parsersScheme: ParsersSchemeDBRow[] = []
const parsers: Parser[] = []

const is_enabled_parser = ( parser: string ) => {
	for ( const scheme of parsersScheme ) {
		if ( scheme.parserName === parser && scheme.enabled ) {
			return true
		}
	}

	return false
}

export const get_parser_scheme = ( parser: string ) => {
	for ( const scheme of parsersScheme ) {
		if ( scheme.parserName === parser ) {
			return scheme
		}
	}
}
export const get_parsers_scheme = () => parsersScheme

export const get_parsers_data = () => parsers.map( x => x.GetData() )

export const get_all_parsers = () => parsers.map( x => x )

export const get_parser_by_id = <T>( id: string | undefined ) => {
	for ( let parser of parsers ) {
		if ( parser.id === id ) {
			return parser
		}
	}
}

export const create_parser = async ( ...[params, storage, priority, creationDate, state]: CreateParserArguments ) => {
	console.log( "create_parser", is_enabled_parser( params.parser ) )

	if ( !is_enabled_parser( params.parser ) ) {
		return
	}

	const id = await insert_db_parser( params )

	params.id = id

	const parser = new Parser( id, params, storage, priority, undefined, undefined )
	parser.Resume()

	return parser
}

export const parser_socket = async ( socket: Socket ) => {
	const p = get_parser_by_id( socket.handshake.auth.params.id )

	if ( p ) {
		p.Reconnect( socket )
	}
}

export const add_parsers_cache = ( pn: string, c: CacheComplex ) => {
	const [n, k, v] = c

	insert_db_cache( pn, n, k, v )

	parsers.forEach( x => x.UpdateCache( pn, c ) )
}

export const update_parsers_scheme = async () => {
	parsersScheme = await get_db_parsers_scheme()

	console.log( "Scheme", parsersScheme )

	parsers_scheme_updated()
}

export class Parser {
	private log: string[] = []
	private items: ItemRow[] =[]
	private storage: ParserStorage = {}
	private nextDBSyncTime: number = 0
	private lastItemCountUpdate: number = Date.now()
	private itemCount: number = 0
	private stopped: boolean = false
	private removed: boolean = false
	private success: boolean = false
	private launching: boolean = false
	private sequence: boolean = true
	private socket: Socket<TParserToServerEvents, TParserFromServerEvents> | undefined
	private creationDate: string
	private tries: number = 0
	private errorMessageSended: boolean = false
	public priority: number
	public params: ParserParams
	public manager: Manager | undefined
	public id: string

	//constructor( id: string, params: ParserParams, creationDate: string, priority?: number, storage?: ParserStorage, state?: ParserState ) {
	constructor( id: string, ...[params, storage, priority, creationDate, state]: CreateParserArguments ) {
		params.id = id.toString()

		this.id = id
		this.params = params
		this.creationDate = creationDate || datetime_format( new Date( Date.now() ) )
		this.storage = Object.assign( {}, storage )
		this.priority = priority || 20000

		if ( state ) {
			this.launching = false
		}

		if ( state === "success" ) {
			this.success = true
		} else if ( state === "stopped" || state === "active" ) {
			this.stopped = true
		}

		parsers.push( this )

		this.UpdateState()
	}

	InitSocket( socket: Socket ) {
		//console.log( "Parser : InitSocket :", this.id )

		if ( this.launching ) {
			this.launching = false
		}

		if ( this.sequence ) {
			this.sequence = false
		}

		this.socket = socket

		this.socket.on( "cache", data => add_parsers_cache( this.params.parser, data ) )
		this.socket.on( "item", data => this.AddItem( data ) )
		this.socket.on( "storage", data => this.storage = data )
		this.socket.on( "log", data => this.Log( data ) )
		this.socket.on( "success", () => this.Success() )
		this.socket.on( "disconnect", () => this.Disconnect() )

		this.socket.emit( "storage", this.storage )
		this.socket.emit( "authed", this.id )

		this.UpdateState()
	}

	Reconnect( socket: Socket ) {
		console.log( "Parser : Reconnect :", this.id )

		if ( this.socket ) {
			this.socket.emit( "exit" )
			this.socket.disconnect()
		}

		this.stopped = false

		this.InitSocket( socket )

		parsers_updated()
	}

	Remove() {
		if ( this.socket ) {
			this.removed = true 
			this.socket.emit( "exit" )
		} else {
			this.removed = true
			delete_from_array( parsers, this )
		}

		this.UpdateState()
	}

	Stop() {
		if ( !this.socket ) return

		this.stopped = true
		this.socket.emit( "exit" )

		this.UpdateState()
	}

	AddItem( item: ItemRow ) {
		unshift_delete_last( this.items, item, MAX_ITEMS_HISTORY )
		insert_db_temp_items( this.id, this.params.city, [item] )

		const parserScheme = get_parser_scheme( this.params.parser )

		if ( parserScheme && parserScheme.autoItemCounter ) {
			this.itemCount++
		}
	}

	SetItemCount( count: number ) {
		if ( count !== this.itemCount ) {
			this.lastItemCountUpdate = Date.now()
			this.itemCount = count
		}
	}

	UpdateCache( pn: string, c: CacheComplex ) {
		if ( !this.socket || pn !== this.params.parser ) return

		this.socket.emit( "cache", c )
	}

	Log( log: string ) {
		unshift_delete_last( this.log, log, MAX_LOG_STRINGS )
	}

	GetState(): ParserState {
		if ( this.success ) {
			return "success"
		} else if ( this.launching ) {
			return "launching"
		} else if ( this.sequence ) {
			return "sequence"
		} else if ( this.removed ) {
			return "removing"
		} else if ( this.stopped ) {
			return "stopped"
		} else if ( this.socket ) {
			return "active"
		} else {
			return "error"
		}
	}

	GetData(): ParserData {
		return {
			id: this.id,
			device: this.manager ? this.manager.device.deviceName : "",
			state: this.GetState(),
			creationDate: this.creationDate,
			params: this.params
		}
	}

	GetDetailedData(): ParserDetailedData {
		return {
			id: this.id,
			device: this.manager ? this.manager.device.deviceName : "",
			state: this.GetState(),
			creationDate: this.creationDate,
			params: this.params,
			storage: this.storage,
			lastItems: [],
			categoryNames: [], 
			log: this.log,
			itemCount: this.itemCount
		}
	}

	UpdateState() {
		update_db_parser_state( this.id, this.GetState() )
		parsers_updated()
	}

	SetManager( m: Manager | undefined ) {
		this.manager = m

		parsers_updated()
	}

	SetStorage( s: ParserStorage ) {
		this.storage = s
	}

	Resume() {
		if ( this.success ) return

		this.sequence = true
		this.launching = false
		this.stopped = false
	}

	Disconnect() {
		console.log( "Parser : Disconnect :", this.id )

		this.socket = undefined
		this.manager = undefined

		if ( this.removed ) {
			delete_from_array( parsers, this )

			return
		}

		this.UpdateState()
		this.TryRestart()
	}

	TryRestart() {
		const state = this.GetState()

		if ( state === "error" || state === "launching" || state === "active" ) {
			if ( this.tries < 10 ) {
				this.tries++

				this.Resume()
			} else {
				this.MessageError()
			}
		}
	}

	MessageError() {
		if ( this.errorMessageSended ) return

		this.errorMessageSended = true

		let msg = "сломался по неизвестной причине"

		switch ( this.GetState() ) {
			case "error": msg = "завершился ошибкой"
			case "launching": msg = "не смог запуститься"
			case "active": msg = "перестал находить позиции"
		}

		send_db_email( "plktre@mail.ru", "Ошибка парсера", `Парсер ${this.id} ${this.params.parser} ${this.params.city} ${msg}` )
	}

	UploadItems( clear: boolean ) {
		const parserScheme = get_parser_scheme( this.params.parser )

		if ( !parserScheme ) {
			return
		}

		const type = parserScheme.typeID

		if ( type === -1 ) return

		console.log( "Parser : UploadItems : db_items_from_temp", this.id, type )

		tries( 30, () => db_items_from_temp( this.id, type, true ) )
	}

	Update( now: number ) {
		if ( now > this.lastItemCountUpdate + 5 * 60 * 1000 ) {
			this.TryRestart()
		}
		console.log("aaa", this.lastItemCountUpdate);
		if ( this.GetState() !== "active" ) return

		if ( now >= this.nextDBSyncTime ) {
			update_db_parser_storage( this.id, this.storage )

			//this.nextDBSyncTime = now + 1000
			this.nextDBSyncTime = now + 10000
		}
	}

	Launch( manager: Manager ) {
		console.log( "Parser : Launch :", this.id, manager.device.deviceName, manager.name )
		this.launching = true
		this.sequence = false
		this.manager = manager

		manager.LaunchParser( this.params )

		this.UpdateState()
	}

	Success() {
		if ( this.success ) return

		console.log( "Parser : Success :", this.id )

		this.success = true

		this.UpdateState()
		this.UploadItems( true )
	}
}

export const init_parsers = async () => {
	await update_parsers_scheme()
	const dbParsers = await get_db_parsers()

	for ( const parser of dbParsers ) {
		if ( parser.state === "removing" ) {
			continue
		}

		new Parser(
			parser.id.toString(),
			parser.params,
			parser.storage,
			undefined,
			datetime_format( new Date( parser.creationDate ) ),
			parser.state
		)
	}

	;( async () => {
		await sleep( 60 )

		while ( true ) {
			for ( const parser of parsers ) {
				if ( parser.GetState() === "sequence" ) {
					const manager = get_suitable_manager( parser )

					if ( manager ) {
						console.log( "init_parsers : Launch seq parser", parser.params.parser, manager.extension, manager.GetParsersCount() )

						parser.Launch( manager )

						await sleep( 60 )
					}
				}
			}

			await sleep( 30 )
		}
	} )()
}