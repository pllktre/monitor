import type { InitParserConfig } from "../components/parsing"
import { exec_async } from "../components/local"

const config: InitParserConfig<UniqueParserConfig> = parser => ( {
	type: "unique",
	id: -1,

	func: async () => await exec_async( `cd ../old/detskiy_mir && childrens_world.bat` )
} )

export default config