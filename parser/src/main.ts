import "./instances/nightmare"

import type { InitParserConfig } from "./components/parsing"

import { SocketParser, RequestsParsing } from "./components/parsing"
import { LocalParser } from "./components/local"
import { NightmareParsing } from "./components/nm"
import { nothing, string_array_to_kv } from "./components/utils"

const SUCCESS_EXIT_CODE = 1337
const VALID_PARSERS = [
	"b-apteka",
	"apteka-ot-sklada",
	"gorzdrav",
	"aptekamos",
	"lucky-pharma",
	"ozon",
	"wildberries",
	"vitaexpress",
	"vitamix",
	"farmlend",
	"eapteka",
	"zdravcity",
	"aptekaru",
	"stolichki",
	"uteka",
	"ozerki",
	"maksavit",
	"detmir",
	"ya-market",

	"_24farmacia",
	"_aptekaru",
	"_gorzdrav",
	"_medgorodok",
	"_apteka_n1",
	"_sovetapteka",
	"_lekmos",
]

;( async () => {
	console.log( "Parser main started" )
	const params = string_array_to_kv( process.argv )

	if ( !VALID_PARSERS.includes( params.parser ) ) throw( "Unknown parser name" )

	const initCfg: InitParserConfig = require( "./parsers/" + params.parser ).default
	
	console.log( params.parser, VALID_PARSERS.includes( params.parser ), initCfg )
	
	const parser =
		params.local === "1" ?
			new LocalParser( initCfg, params )
		:
			new SocketParser( initCfg, params )

	await parser.Init()

	console.log( params )

	parser.exit.Add( () => process.exit() )

	try {
		if ( parser.ConfigIsNightmare() ) {
			await new NightmareParsing( parser ).Init()
		} else if ( parser.ConfigIsUnique() ) {
			await parser.cfg.func()
		} else if ( parser.ConfigIsRequests() ) {
			await new RequestsParsing( parser ).Init()
		}

		console.log( "Pre success message" )

		await parser.Success()

		console.log( "Parsing done successfully" )
		process.exit( SUCCESS_EXIT_CODE )
	} catch( e ) {
		console.log( "Parsing done with error: ", e )
		process.exit()
	}
} )()