type TSocketEvents<T> = { [Name in keyof T]: T[Name] extends undefined ? ( () => void ) | undefined : ( value: T[Name] ) => void }

interface IParserToServerEvents {
	cache: CacheComplex
	item: ItemRow
	storage: ParserStorage
	log: string
	success: undefined
}

interface IParserFromServerEvents {
	storage: ParserStorage
	cache: CacheComplex
	authed: string
	exit: undefined
}

interface IManagerToServerEvents {
	available: boolean
	updated: void
}
interface IManagerFromServerEvents {
	launch_parser: ParserParams
	update_parser: void
	reload: void
}

interface IUserInterfaceToServerEvents {
	subscribe: keyof GlobalEvents
	unsubscribe: keyof GlobalEvents
	subscribe_parser: string | undefined
	launch_parser: [ParserParams, KV<string>]
	resume_parser: string
	upload_items: string
	stop: string
	remove: string
	storage: KV<string>
	update_parser: string
	timetable_add: [ParserParams, WeekDaysMode, number,string]
	timetable_remove: string
	timetable_week_days: WeekDaysMode
	update_parser_scheme: void
}

interface IUserInterfaceFromServerEvents {
	connection: void
	parsers: ParserData[]
	devices: DeviceData[]
	parser: ParserDetailedData
	parsers_scheme: ParsersSchemeDBRow[]
	timetable: ParsersTimetableDBRow[]
	timetable_week_days: WeekDaysMode
}

type TParserToServerEvents = TSocketEvents<IParserToServerEvents>
type TParserFromServerEvents = TSocketEvents<IParserFromServerEvents>
type TManagerToServerEvents = TSocketEvents<IManagerToServerEvents>
type TManagerFromServerEvents = TSocketEvents<IManagerFromServerEvents>
type TUserInterfaceToServerEvents = TSocketEvents<IUserInterfaceToServerEvents>
type TUserInterfaceFromServerEvents = TSocketEvents<IUserInterfaceFromServerEvents>