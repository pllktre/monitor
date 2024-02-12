const xlsx = require( "node-xlsx" )
const { insert_db_timetable } = require( "./dist/components/db" )
const parsed = xlsx.parse( __dirname + "/timetable.xlsx" )

const parsers = {}
parsers[1] = "zhivika"
parsers[2] = "april"
parsers[3] = "aptekiplus"
parsers[4] = "apteka-ot-sklada"
parsers[5] = "_aptekaru"

const days = {}
days[1] = "mo"
days[2] = "tu"
days[3] = "we"
days[4] = "th"
days[5] = "fr"

const timetable = []

//timetable.forEach( list => {
//	list.data.forEach( console.log )
//} )

const [list] = parsed

for ( const pri in list.data ) {
	const parser = parsers[pri]

	if ( !parser ) {
		continue
	}

	const parserRow = list.data[pri]

	for ( const di in parserRow ) {
		const day = days[di]

		if ( !day ) {
			continue
		}

		const cities = parserRow[di].split( "," )

		for ( let cp of cities ) {
			const reg = /^(.*)\s*\((\d*)\)/g
			const match = reg.exec( cp )
			const city = match[1].trim()
			const priority = Number( match[2] )

			let data = undefined

			for ( const tb of timetable ) {
				if ( tb.params.parser === parser && tb.params.city === city && tb.priority === priority ) {
					data = tb
				}
			}

			if ( !data ) {
				data = {
					params: {
						parser,
						city
					},
					priority,
					weekDaysMode: {
						mo: "off",
						tu: "off",
						we: "off",
						th: "off",
						fr: "off",
						sa: "off",
						su: "off"
					}
				}
		
				timetable.push( data )
			}

			data.weekDaysMode[day] = "day"
		}
	}
}

( async () => {
for ( const tb of timetable ) {
	console.log( "TB", tb )
	await insert_db_timetable( tb.params, tb.weekDaysMode, tb.priority )
}
} )()