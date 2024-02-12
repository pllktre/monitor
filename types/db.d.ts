interface ParsersDBRow {
	id: string
	params: ParserParams
	state: ParserState
	storage: KV<string, string>
	creationDate: number
}

interface ParsersCacheDBRow {
	id: string
	parserName: string
	cacheName: string
	cacheKey: string
	cacheValue: string
}

interface ParsersSchemeDBRow {
	id: string
	parserName: string
	typeID: number
	extension: boolean
	params: EnterParserParam[]
	autoItemCounter: boolean
	enabled: boolean
	state: ParserSchemeState
	comments: string
}

interface ParsersTimetableDBRow {
	id: string
	params: ParserParams
	priority: number
	avgItems:string
	lastLaunchDate: number
	weekDaysMode: WeekDaysMode
}

interface ParsersUploadsDBRow {
	parserID: string
	uploadID: string
	itemCount: number
	date: number
}