import type { InitParserConfig } from "./parsing"
import fs from "fs"
import { exec } from "child_process"
import { Parser } from "./parsing"
import { nothing } from "./utils"

const CONFIG = require( "../../../upp.config.js" )

const cache_file_name = ( params: KV<string> ) => {
	let s = ""
	let space = ""

	for ( let k in params ) {
		s += space + k + "=" + params[k]
		space = ";"
	}

	return s + ".data"
}

const csv_file_name = ( params: KV<string> ) => {
	const nameMap: KV<string> = {
		april: "Апрель"
	}

	let s = ( nameMap[params.parser] || params.parser ) + ( params.city ? " " + params.city : "" )

	const excludes: KV<boolean> = {
		parser: true,
		city: true,
		local: true
	}

	for ( let k in params ) {
		if ( excludes[k] ) continue
		s += " " + params[k]
	}

	return s + ".csv"
}

const to_string = ( x: any ) => nothing( x ) ? "" : x.replace( /\n|\t/g, " " ).replace( /^\s+|\s+$/g, "" )

const item_string = ( item: ItemRow, id: number, city?: string ) =>
	id + "\t" +
	to_string( item.name ) + "\t" +
	to_string( item.contextID ) + "\t" +
	to_string( item.brand ) + "\t" +
	to_string( item.city || city ) + "\t" +
	to_string( item.seller ) + "\t" +
	to_string( item.price ) + "\t" +
	to_string( item.price1 ) + "\t" +
	to_string( item.price2 )

const kv_string = ( kv: KV<string | undefined> ) => {
	let s = ""
	let n = ""

	for ( let k in kv ) {
		if ( !nothing( kv[k] ) ) {
			s += n + k + "=" + kv[k]
			n = "\n"
		}
	}

	return s
}

const init_dir = ( path: string ) => {
	if ( !fs.existsSync( path ) ) {
		fs.mkdirSync( path )
	}
}

const fill_kv = ( filePath: string, kv: KV<string | undefined> ) => {
	const pairs = fs.readFileSync( filePath, "utf8" ).split( "\n" )

	for ( let pair of pairs ) {
		const [k, v] = pair.split( "=" )

		if ( k && v ) {
			kv[k] = v
		}
	}
}

export const exec_async = ( cmd: string ) => {
	const child = exec( cmd )

	if ( !child ) throw( "Process is not created: " + cmd )

	if ( child.stdout ) {
		child.stdout.pipe( process.stdout )
	}

	return new Promise<void>( res => {
		child.on( "close", code => {
			res()
		} )
	} )
}

export class LocalParser<T extends ParserConfig=ParserConfig> extends Parser<T> {
	private resultPath: string
	private storageDirPath: string
	private storagePath: string
	private cachePath: string

	constructor( cfg: InitParserConfig<T>, params: KV<string> ) {
		super( cfg, params )

		this.resultPath = `${CONFIG.LOCAL_RESULTS_PATH}/${csv_file_name( params )}`
		this.storageDirPath = `local/storage/${params.parser}`
		this.storagePath = `local/storage/${params.parser}/${cache_file_name( params )}`
		this.cachePath = `local/cache/${params.parser}`
	}

	private CachePath ( n: string ) {
		return this.cachePath + "/" + n + ".data"
	}

	async Init() {
		try {
			init_dir( "local" )
			init_dir( "local/cache" )
			init_dir( "local/storage" )
			init_dir( this.storageDirPath )
			init_dir( this.cachePath )


			if ( fs.existsSync( this.resultPath ) ) {
				if ( fs.existsSync( this.storagePath ) ) {
					fill_kv( this.storagePath, this.storage )
				}
			} else {
				this.WriteStorage()
				fs.writeFileSync( this.resultPath, "id_tip\tname_good\tnom\tname_pro\tname_gorod\tname_apt\tcena\tcena1\tcena2" )
			}

			if ( this.cfg.cache ) {
				for ( const x of this.cfg.cache ) {
					this.cache[x] = {}

					const path = this.CachePath( x )

					if ( !fs.existsSync( path ) ) {
						fs.writeFileSync( path, "" )
					} else {
						fill_kv( path, this.cache[x] )
					}
				}
			}

			console.log( "Inited local" )
		} catch( e ) {
			console.log( e )
			process.exit()
		}	
	}

	AddCache( n: string, k: string, v: string ) {
		super.AddCache( n, k, v )

		fs.appendFileSync( this.CachePath( n ), k + "=" + v + "\n" )
	}

	AddItem( item: InvalidItemRow ) {
		//console.log( "Add item local" )
		if ( this.IsValidItem( item ) ) {
			fs.appendFileSync( this.resultPath, "\n" + item_string( item, this.cfg.id, this.params.city ) )
		}
	}

	SetStorage( s: ParserStorage ) {
		super.SetStorage( s )

		this.WriteStorage()
	}

	AddStorage( k: string, v: string | undefined ) {
		super.AddStorage( k, v )

		this.WriteStorage()
	}

	WriteStorage() {
		fs.writeFileSync( this.storagePath, kv_string( this.storage ) )
	}

	async Success() {
		if ( this.params.noupload === "1" ) {
			return
		}

		await new Promise<void>( ( res, rej ) => {
			const child = exec( `py -m wdd.parsing.norm_prices "${this.resultPath}" -u --copy` )

			if ( !child ) throw( "Upload process is not created" )

			if ( child.stdout ) {
				child.stdout.pipe( process.stdout )
			}

			child.on( "exit", ( e ) => {
				if ( e ) {
					rej( e )
				} else {
					res()
				}
			} )
		} )

		fs.renameSync( this.resultPath, `../${Date.now()} ${csv_file_name( this.params )}` )
		console.log( "Uploaded" )
	}
}