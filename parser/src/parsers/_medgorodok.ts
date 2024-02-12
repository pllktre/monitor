import type { InitParserConfig } from "../components/parsing"
import { exec_async } from "../components/local"
import { sleep } from "../components/utils"
import fs from "fs"

const config: InitParserConfig<UniqueParserConfig> = parser => ( {
	type: "unique",
	id: -1,

	func: async () => await exec_async( `cd ../old/medgorodok && medgorodok.bat` )
} )

export default config