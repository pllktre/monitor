import type { Parser } from "./parser"
import { Socket } from "socket.io"
import { devices_updated } from "./ui"
import { delete_from_array, copy_condition_array } from "./utils"
import { get_parser_scheme, get_all_parsers } from "./parser"

let devicesData: DeviceData[] = []
const managers: Manager[] = []
const devices: Device[] = []

export const get_devices_data = () => devices.map( d => d.GetData() )

export const get_device = ( name: string ) => {
	for ( const d of devices ) {
		if ( d.deviceName === name ) {
			return d
		}
	}
}

export const get_suitable_manager = ( parser: Parser ) => {
	const scheme = get_parser_scheme( parser.params.parser )

	if ( !scheme ) {
		return
	}

	const extension = !!scheme.extension

	console.log( extension, parser.params.parser )

	let condManagers
	condManagers = copy_condition_array( managers, m => m.extension === extension )
	condManagers = copy_condition_array( condManagers, m => !m.IsLimited() )

	const sortDevices = devices.map( o => o ).sort( ( a, b ) => b.GetParsersCount() - a.GetParsersCount() )

	console.log( condManagers )

	for ( const device of sortDevices ) {
		for ( const manager of condManagers ) {
			if ( device === manager.device ) {
				return manager
			}
		}
	}
}

export const update_parser_all = () => managers.forEach( x => x.UpdateParserFiles() )

export const update_parser = ( deviceName: string ) => devices.forEach( d => {
	if ( d.deviceName === deviceName ) {
		d.UpdateParserFiles()
	}
} )

export const parser_updated = ( deviceName: string ) => devices.forEach( d => d.ParserFilesUpdated() )

export class Manager {
	private socket: Socket<TManagerToServerEvents, TManagerFromServerEvents>
	public device: Device
	public name: string
	public available: boolean = false
	public extension: boolean

	constructor( socket: Socket<TManagerToServerEvents, TManagerFromServerEvents> ) {
		console.log( "Manager", socket.handshake.auth )

		const deviceName = socket.handshake.auth.device

		if ( !deviceName ) {
			throw( "Socket hasnt device name" )
		}

		this.socket = socket
		this.name = socket.handshake.auth.name || ""
		this.extension = socket.handshake.auth.extension

		let device = get_device( deviceName )

		if ( !device ) {
			device = new Device( deviceName )
		}

		this.device = device

		socket.on( "available", data => this.SetAvailable( data ) )
		socket.on( "updated", () => this.device.ParserFilesUpdated() )
		socket.on( "disconnect", data => this.Disconnect() )

		managers.push( this )
	}

	SetAvailable( b: boolean ) {
		this.available = b
	}

	UpdateParserFiles() {
		this.socket.emit( "update_parser" )
	}

	GetParsersCount() {
		let count = 0

		get_all_parsers().forEach( parser => {
			if ( parser.manager === this ) {
				count++
			}
		} )

		return count
	}

	IsLimited() {
		const count = this.GetParsersCount()

		return this.extension ? count >= 1 : count >= 4
		//return this.extension ? count >= 1 : count >= 1
	}

	Reload() {
		this.socket.emit( "reload" )
	}

	LaunchParser( params: ParserParams ) {
		this.socket.emit( "launch_parser", params )
	}

	Disconnect() {
		delete_from_array( managers, this )
	}
}

class Device {
	public deviceName: string

	constructor( deviceName: string ) {
		this.deviceName = deviceName

		devices.push( this )
	}

	GetManagers() {
		const dms: Manager[] = []

		for ( const m of managers ) {
			if ( m.device === this ) {
				dms.push( m )
			}
		}

		return dms
	}

	GetDeviceManager() {
		for ( const m of this.GetManagers() ) {
			if ( !m.extension ) {
				return m
			}
		}
	}

	GetData(): DeviceData {
		const data = {
			deviceName: this.deviceName,
			activeCount: 0,
			parsers: [],
			managers: []
		} as DeviceData

		get_all_parsers().forEach( parser => {
			if ( parser.manager && this === parser.manager.device && parser.GetState() === "active" ) {
				data.parsers.push( parser.params.parser || "" )
			}
		} )

		data.activeCount = data.parsers.length

		for ( const manager of this.GetManagers() ) {
			data.managers.push( {
				name: manager.name,
				extension: manager.extension,
				available: manager.available ? "available" : "not_available"
			} )
		}

		return data
	}

	GetParsersCount() {
		let count = 0

		for ( const m of this.GetManagers() ) {
			count += m.GetParsersCount()
		}

		return count
	}

	UpdateParserFiles() {
		const manager = this.GetDeviceManager()

		if ( manager ) {
			manager.UpdateParserFiles()
		}
	}

	ParserFilesUpdated() {
		for ( const manager of this.GetManagers() ) {
			if ( manager.extension ) {
				manager.Reload()
			}
		}
	}
}