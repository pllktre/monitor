import type { InitParserConfig } from "../components/parsing"
import { exec_async } from "../components/local"
import { sleep } from "../components/utils"
import fs from "fs"

const config: InitParserConfig<UniqueParserConfig> = parser => ( {
	type: "unique",
	id: -1,

	func: async () => {
		const cities = ["all", "norilsk", "krasnoyarsk", "krasnodarskiy_kray"]

		if ( cities.includes( parser.params.city ) ) {
			await exec_async( `cd ../old/24farmacia && ${parser.params.city}.cmd` )
		} else {
			throw( "Invalid city" )
		}
	}
} )

export default config