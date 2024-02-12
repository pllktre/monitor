import type { InitParserConfig } from "../components/parsing"
import { parse } from "node-html-parser"
import { nothing, sleep } from "../components/utils"

const config: InitParserConfig<UniqueParserConfig> = parser => ( {
	type: "unique",
	id: 22,
	func: async () => {
		const res = await fetch( "https://med.yar.ru/tovar/22212" )
		const data = await res.text()

		console.log( data )
	}
} )

export default config