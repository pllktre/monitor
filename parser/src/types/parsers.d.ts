type ConfigItemParams = { [key: string]: [string | undefined, string?, [RegExp, number]?] }

interface ParsingCategory {
	s: string
	h?: boolean
	i?: number[]
	o?: boolean
}

type ShiftPageUrl = [
	"url",
	string,
	string | undefined
]

type ShiftPageTransformUrl = [
	"turl",
	( page: number, url: string ) => string,
	string | undefined
]

type ShiftPageMethod = ShiftPageUrl | ShiftPageTransformUrl

type TOverrideDelayName = 
	| "loadMoreA"
	| "loadMoreB"
	| "page"
	| "categoryA"
	| "categoryB"
	| "parseCategory"

interface ParserConfigBase {
	id: number
	init?: () => void
	onError?: () => void
	cache?: string[]
	params?: string[]
	ovrrdls?: { [K in TOverrideDelayName]?: number }
	itemValidate?: Array<keyof InvalidItemRow>
	itemFunc?: ( item: InvalidItemRow, itemElement: any, i: number ) => Promise<void>
	itemSelector?: string
	itemParams?: ConfigItemParams
}

interface DefaultParserConfig {
	siteUrl: string
	categorySelectors: ParsingCategory[]
	shiftPageMethod?: ShiftPageMethod
}

type ContinueParseKV = {
	lastCategories: number[]
	lastPage?: number
	lastItem: number
}