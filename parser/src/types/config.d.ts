/// <reference types="nightmare" />
/// <reference types="node-html-parser" />
/// <reference types="../extension/background" />
/// <reference types="../components/nm" />

interface ExtesionParserConfig extends ParserConfigBase, DefaultParserConfig {
	type: "extension"
	selectCity?: ( tab: import( "../extension/background" ).BrowserTab ) => Promise<void>
	pageFunc?: ( tab: import( "../extension/background" ).ExtensionParsing ) => Promise<void>
}

interface NightmareParserConfig extends ParserConfigBase, DefaultParserConfig {
	type: "nightmare"
	show: boolean
	timeout?: number
	selectCity?: ( nm: import( "nightmare" ).Nightmare ) => Nightmare | Promise
	pageFunc?: ( nm: import( "../components/nm" ).NightmareParsing ) => Promise<void>
}

interface UniqueParserConfig extends ParserConfigBase {
	type: "unique"
	func: () => Promise<void>
}

interface RequestsParserConfig extends ParserConfigBase, DefaultParserConfig {
	type: "requests"
}

type ParserConfigDefaults = ExtesionParserConfig | NightmareParserConfig | RequestsParserConfig
type ParserConfig = ExtesionParserConfig | NightmareParserConfig | RequestsParserConfig | UniqueParserConfig