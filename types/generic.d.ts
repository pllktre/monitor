interface InvalidItemRow {
	name?: string
	contextID?: string
	brand?: string
	city?: string
	seller?: string
	price?: string
	price1?: string
	price2?: string
}

interface ItemRow {
	name: string
	contextID?: string
	brand: string
	city?: string
	seller?: string
	price: string
	price1?: string
	price2?: string
}

type KV<Value=any, Key=string> = { [k in Key]: Value }
type Nothing = undefined | null

type ParserState =
	| "active"
	| "error"
	| "stopped"
	| "removing"
	| "success"
	| "launching"
	| "sequence"

interface ParserData {
	id: string
	device: string | "undefined"
	state: ParserState
	creationDate: string
	params: KV<string>
}

interface ParserDetailedData extends ParserData {
	storage: ParserStorage
	itemCount: number
	lastItems: InvalidItemRow[]
	log: string[]
	categoryNames: string[]
}

type DeviceAvailable = "available" | "not_available" | "undefined"

interface DeviceData {
	deviceName: string
	activeCount: number
	parsers: string[]
	managers: Array<{
		name: string
		extension: boolean
		available: DeviceAvailable
	}>
}

interface GlobalEvents {
	parsers: ParserData[]
	devices: DeviceData[]
	parser: ParserDetailedData
	parsers_scheme: KV<ParserScheme>
	timetable: PlannedParserData[]
}

type GlobalEventsKV<T=any> = { [k in keyof GlobalEvents]: T }

type CacheComplex = [string, string, string]
type ParserStorage = KV<string | undefined>

type ParserParams = KV<string, string>

interface BaseParserParam {
	param: string,
	name: string
}

interface ParserParamInput extends BaseParserParam {
	type: "input"
}

interface ParserParamVariables extends BaseParserParam {
	type: "variables"
	variables: KV<string>
	default: string
}

interface ParserParamSwitchable extends BaseParserParam {
	type: "switchable"
}

type EnterParserParamPattern = "city"

type EnterParserParam = ParserParamInput | ParserParamVariables | ParserParamSwitchable

type ParserSchemeState = "workable" | "not_workable" | "incorrect"

type WeekDay = "mo" | "tu" | "we" | "th" | "fr" | "sa" | "su"

type WeekDayMode = "on" | "off" | "night" | "day"

type WeekDaysMode = KV<WeekDayMode, WeekDay>