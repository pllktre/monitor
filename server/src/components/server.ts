import { Server } from "socket.io"
import type { Socket } from "socket.io"
import { parser_socket } from "../components/parser"
import { Manager } from "../components/manager"
import { UserInterface } from "../components/ui"
import fs from "fs"
import express, { Request, Response } from "express"
import bodyParser from "body-parser"
import { createServer } from "http"
import { get_db_cache } from "../components/db"
import multer from "multer"
import { update_parser_all } from "../components/manager"

const CONFIG = require( "../../../upp.config.js" )

const init_dir = ( path: string ) => {
	if ( !fs.existsSync( path ) ) {
		fs.mkdirSync( path )
	}
}

const init_files = () => {
	init_dir( "static" )
	init_dir( "upload" )
}

export const init_server = () => {
	console.log( "Service server" )

	const e = express()
	const server = createServer( e )

	e.use( bodyParser.urlencoded( { extended: true } ) )
	e.use( bodyParser.json() )

	e.get( "/api/cache", async ( req, res ) => {
		console.log( req.body, req.query )
		res.send( JSON.stringify( await get_db_cache( req.query.parser as string, req.query.cache as string ) ) )
	} )

	const storage = multer.diskStorage( {
		destination: ( _, __, cb ) => cb( null, "upload" ),
		filename: ( _, __, cb ) => cb( null, "parser.zip" )
	} )

	e.post( "/api/upload", multer( { storage: storage } ).single( "filedata" ), ( req: Request, res: Response ) => {
		console.log( "updates_upload /api/upload", req.file )

		if ( req.file ) {
			update_parser_all()
			res.send( "OK" )
		} else {
			res.send( "Bad" )
		} 
	} )

	e.get( "/api/*", ( req, res ) => res.send( "Unknown API" ) )

	e.use( "/upload", express.static( __dirname + "/../../upload" ) )
	e.use( "/monitoring", express.static( __dirname + "/../../static" ) )

	e.use( "*", ( _, res ) => res.redirect( "/monitoring" ) )

	const manage_socket = ( path: string, cb: ( s: Socket ) => void, validate: boolean ) => {
		const io = new Server()
		io.path( "/api/socket/" + path )
		io.listen( server )
		io.on( "connection", ( s ) => {
			if ( path === "parser" ) console.log( "Parser Connection", s.handshake.auth )

			if ( validate && s.handshake.auth.key !== CONFIG.KEY ) {
				s.disconnect()
			} else {
				cb( s )
			}
		} )
	}

	manage_socket( "manager", s => new Manager( s ), true )
	manage_socket( "parser", s => parser_socket( s ), true )
	manage_socket( "ui", s => new UserInterface( s ), false )

	init_files()

	server.listen( CONFIG.PORT, () => console.log( "Server is listening" ) )
}