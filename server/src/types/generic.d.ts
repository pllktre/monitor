interface ServerSetup {
	express: Application
	server: Server
	managers: KV<Manager>
	parsers: Praser[]
}

interface ParserDB {
	id: number
	data: string
}

type CreateParserArguments = [
	ParserParams,
	ParserStorage | undefined,
	number | undefined,
	string | undefined,
	ParserState | undefined
]