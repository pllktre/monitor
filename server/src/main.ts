import { init_server } from "./components/server"
import { init_timetable } from "./components/timetable"
import { init_ui } from "./components/ui"
import { init_parsers } from "./components/parser"

const CONFIG = require( "../../upp.config.js" )

;( async () => {
	await init_parsers()
	init_timetable()
	init_ui()
	init_server()
} )()