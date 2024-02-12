import type { InitParserConfig } from "../components/parsing"
import { exec_async } from "../components/local"
import { sleep } from "../components/utils"
import fs from "fs"

const PATH = "../old/eapteka"

const config: InitParserConfig<UniqueParserConfig> = parser => ( {
	type: "unique",
	id: -1,

	func: async () => {
		const cityFile = parser.params.city + ".cmd"
		const cityDirs = fs.readdirSync( PATH )

		if ( cityDirs.includes( cityFile ) ) {
			await exec_async( `cd ${PATH} && ${cityFile}` )
		}
	}
} )

export default config