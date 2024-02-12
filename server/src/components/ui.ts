import type { Parser } from "./parser"
import { Socket } from "socket.io"
import { get_devices_data, update_parser } from "./manager"
import {
	get_parsers_data,
	get_parser_by_id,
	create_parser,
	get_parsers_scheme,
	update_parsers_scheme
} from "./parser"
import {
	get_timetable,
	set_week_days_mode,
	get_week_days_mode
} from "./timetable"
import {
	insert_db_timetable,
	delete_db_timetable
} from "./db"
import { nothing } from "./utils"

const uis: UserInterface[] = []

const with_parser = ( id: string | undefined, cb: ( p: Parser ) => void ) => {
	const p = get_parser_by_id( id )

	if ( p ) {
		cb( p )
	}
}

export const parsers_updated = () => uis.forEach( x => x.ParsersUpdated() )
export const devices_updated = () => uis.forEach( x => x.DevicesUpdated() )
export const parsers_scheme_updated = () => uis.forEach( x => x.ParsersSchemeUpdated() )
export const timetable_updated = () => uis.forEach( x => x.TimetableUpdated() )
export const update_uis = ( now: number ) => uis.forEach( x => x.Update( now ) )

export const init_ui = () => {
	setInterval( () => update_uis( Date.now() ), 0 )
}

export class UserInterface {
	private eventEnables: KV<boolean> = {}
	private nextDataTime: number = 0
	private subscribedParser: string | undefined
	public socket: Socket<TUserInterfaceToServerEvents, TUserInterfaceFromServerEvents>

	constructor( socket: Socket ) {
		console.log( "ui : Socket : constructor" )

		this.socket = socket

		this.socket.on( "disconnect", data => this.Disconnect() )
		this.socket.on( "update_parser_scheme", () => update_parsers_scheme() )
		this.socket.on( "resume_parser", data => with_parser( data, x => x.Resume() ) )
		this.socket.on( "upload_items", data => with_parser( data, x => x.UploadItems( false ) ) )
		this.socket.on( "launch_parser", ( [params, storage] ) => create_parser( params, storage, undefined, undefined, undefined ) )
		this.socket.on( "update_parser", deviceName => update_parser( deviceName ) )
		this.socket.on( "subscribe_parser", data => this.subscribedParser = data )
		this.socket.on( "stop", data => with_parser( data, p => p.Stop() ) )
		this.socket.on( "remove", data => with_parser( data, p => p.Remove() ) )
		this.socket.on( "timetable_add", ( [params, wdm, prio, avgItems] ) => insert_db_timetable( params, wdm, prio, avgItems ) )
		this.socket.on( "timetable_remove", data => delete_db_timetable( data ) )
		this.socket.on( "timetable_week_days", data => {
			set_week_days_mode( data )
			uis.forEach( x => x.TimetableWeekDaysModeUpdated() )
		} )

		this.ParsersUpdated()
		this.DevicesUpdated()
		this.ParsersSchemeUpdated()
		this.TimetableUpdated()
		this.TimetableWeekDaysModeUpdated()

		uis.push( this )
	}

	ParsersUpdated() {
		this.socket.emit( "parsers", get_parsers_data() )
	}

	DevicesUpdated() {
		this.socket.emit( "devices", get_devices_data() )
	}

	ParsersSchemeUpdated() {
		this.socket.emit( "parsers_scheme", get_parsers_scheme() )
	}

	TimetableUpdated() {
		this.socket.emit( "timetable", get_timetable() )
	}

	TimetableWeekDaysModeUpdated() {
		this.socket.emit( "timetable_week_days", get_week_days_mode() )
	}

	Update( now: number ) {
		if ( now < this.nextDataTime ) {
			return
		}

		this.nextDataTime = now + 1000
		
		this.socket.emit( "devices", get_devices_data() )

		if ( nothing( this.subscribedParser ) ) {
			return
		}

		with_parser( this.subscribedParser, p => this.socket.emit( "parser", p.GetDetailedData() ) )
	}

	Disconnect() {
		console.log( "UserInterface : Disconnect :" )
	}
}