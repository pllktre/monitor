import type { Parser } from "../components/parser"
import {
	get_db_timetable,
	insert_db_timetable,
	delete_db_timetable,
	update_db_timetable_last_launch_date
} from "../components/db"
import { create_parser, get_all_parsers } from "../components/parser"
import { timetable_updated } from "../components/ui"
import { sleep, nothing, delete_from_array, datetime_format } from "../components/utils"
import { get_devices_data } from "../components/manager"

const DAY_START = [6, 0]
const NIGHT_START = [23, 0]
const weekDays: WeekDay[] = ["su", "mo", "tu", "we", "th", "fr", "sa"]
let timetable: ParsersTimetableDBRow[] = []
let weekDaysMode: WeekDaysMode = {
	mo: "on",
	tu: "on",
	we: "on",
	th: "on",
	fr: "on",
	sa: "on",
	su: "on"
}

export const set_week_days_mode = ( wdm: WeekDaysMode ) => weekDaysMode = wdm

export const get_week_days_mode = () => weekDaysMode

export const get_timetable = () => timetable

const is_same_day = ( d1: number, d2: number ) => {
	const date1 = new Date( d1 )
	const date2 = new Date( d2 )

	return (
		date1.getFullYear() === date2.getFullYear() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getDate() === date2.getDate()
	)
}

const is_right_time = ( d: number, wdm: WeekDaysMode ) => {
	const date = new Date( d )
	const day = date.getDay()
	const hour = date.getHours()
	const minutes = date.getHours()

	switch ( wdm[weekDays[day]] ) {
		case "off": return false
		case "on": return true
		case "day": return hour > DAY_START[0] && minutes > DAY_START[1]
		case "night": return hour > NIGHT_START[0] && minutes > NIGHT_START[1]
	}
}

export const init_timetable = () => {
	;( async () => {
		await sleep( 60 )

		while ( true ) {
			timetable = await get_db_timetable()
			timetable_updated()

			await sleep( 30 )

			const now = Date.now()

			if ( !is_right_time( now, weekDaysMode ) ) {
				return
			}

			for ( const tb of timetable ) {
				console.log( "TB", is_same_day( now, tb.lastLaunchDate ), is_right_time( now, tb.weekDaysMode ) )
				
				if ( is_same_day( now, tb.lastLaunchDate ) || !is_right_time( now, tb.weekDaysMode ) ) {
					continue
				}

				await update_db_timetable_last_launch_date( tb.id, now )

				create_parser(
					tb.params,
					undefined,
					tb.priority,
					undefined,
					undefined
				)
			}
		}
	} )()
}