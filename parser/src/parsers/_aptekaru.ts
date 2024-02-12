import type { InitParserConfig } from "../components/parsing"
import { exec_async } from "../components/local"
import { sleep } from "../components/utils"
import fs from "fs"

const PATH = "../old/apteka_ru"

const config: InitParserConfig<UniqueParserConfig> = parser => ( {
	type: "unique",
	id: -1,

	func: async () => {
		const cityDirs = fs.readdirSync( PATH )

		if ( cityDirs.includes( parser.params.city ) ) {
			await exec_async( `cd ${PATH}/${parser.params.city}/ParsersPython/Monitor/AptekaRuPROXIES2/APISection && main.cmd` )
		}
	}
} )

export default config