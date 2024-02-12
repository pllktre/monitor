const io = require( "socket.io-client" )
const unzipper = require( "unzipper" )
const exec = require( "child_process" ).exec
const http = require( "http" )
const fs = require( "fs" )

const DEBUG = true
const CONFIG = require( "../upp.config.js" )
const HOST = CONFIG.IP + ":" + CONFIG.PORT

let isAvailable = false

const socket = io( `ws://${HOST}`, {
	reconnectionDelayMax: 10000,
	path: "/api/socket/manager",
	auth: { device: CONFIG.DEVICE, key: CONFIG.KEY, extension: false }
} )

const debug = ( ...args ) => DEBUG && console.log( ...args )

function SetAvailable( b ) {
	isAvailable = b

	socket.emit( "available", b )
}

async function LaunchParser( params ) {
	console.log( "LaunchParser", params )

	if ( !isAvailable ) {
		debug( "Manager is not Available" )
		return
	}
	
	const c = exec( `cd ../${CONFIG.PARSER_DIR} && npm run start-once -- ${Object.keys( params ).map( k => `"${k}=${params[k]}"` ).join( " " )}` )

	if ( DEBUG ) {
		debug( "WTF" )
		c.stdout.pipe( process.stdout )
	}

	c.on( "exit", e => debug( "Exit", e ) )
	c.on( "close", e => debug( "Close", e ) )
}

function ExecAsync( cmd ) {
	const child = exec( cmd )

	if ( DEBUG ) {
		child.stdout.pipe( process.stdout )
	}

	return new Promise( res => {
		child.on( "close", code => {
			res()
		} )
	} )
}

async function UpdateParser() {
	console.log( "UpdateParser" )

	if ( !isAvailable ) {
		debug( "Manager is Available" )
		return
	}

	SetAvailable( false )

	const file = fs.createWriteStream( "parser.zip" )
	const req = http.get( `http://${HOST}/upload/parser.zip`, ( res ) => {
		res.pipe( file )

		file.on( "finish", () => {
			file.close( () => {
				fs
					.createReadStream( "parser.zip" )
					.pipe( unzipper.Extract( { path: "../" + CONFIG.PARSER_DIR } ) )
					.on( "close", async () => {
						await ExecAsync( `cd ../${CONFIG.PARSER_DIR} && npm install --only=production` )
						await ExecAsync( `cd ../${CONFIG.PARSER_DIR} && npm run build-extension` )

						SetAvailable( true )
						debug( "Updated" )
						socket.emit( "updated" )
					} )
					.on( "error", ( err ) => {
						socket.emit( "error", { error: err } )
						SetAvailable( true )
					} )
			} )
		} )
	} )
}

socket.on( "launch_parser", LaunchParser )
socket.on( "update_parser", UpdateParser )
socket.on( "connect", () => SetAvailable( true ) )