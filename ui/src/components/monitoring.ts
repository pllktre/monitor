import type { Socket } from "socket.io-client"
import { io } from "socket.io-client"
import { dispatch } from "./events"

const socket: Socket<TUserInterfaceFromServerEvents, TUserInterfaceToServerEvents> = io( "ws://" + window.location.host, {
	reconnectionDelayMax: 10000,
	path: "/api/socket/ui"
} )

export const emit = socket.emit.bind( socket )

export function init_monitoring() {
	function init_socket_event( name: keyof IUserInterfaceFromServerEvents ) {
		console.log( "init_socket_event", name )
		socket.on( name, ( data: any ) => {
			console.log( "Socket on", name, data )
			dispatch( name, data )
		} )
	}
	
	init_socket_event( "devices" )
	init_socket_event( "parsers" )
	init_socket_event( "parser" )
	init_socket_event( "parsers_scheme" )
	init_socket_event( "timetable" )
	init_socket_event( "timetable_week_days" )

	setInterval( () => dispatch( "interval_s", Date.now() ), 1000 )
}