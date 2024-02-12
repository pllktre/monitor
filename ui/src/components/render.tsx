import React from "react"
import { R_subscribe, dispatch } from "./events"
import { emit } from "./monitoring"
import { nothing } from "./utils"

const LargeButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = props =>
	<button { ...props } className={ `py-1 px-3 rounded-2xl bg-gray-900 hover:bg-gray-800 h-8 flex text-center items-center ${props.className || ""}` }>
		{ props.children }
	</button>

const LargeButtonFullW: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = props =>
	<LargeButton { ...props } className="w-full my-2">
		<div className="mx-auto">{ props.children }</div>
	</LargeButton>

const LargeInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = props =>
	<LargeButton className={ props.className }>
		<input
			{ ...props }
			className="bg-transparent placeholder-opacity-50"
			type={ props.type || "text" }
			placeholder="Введите"
		/>
	</LargeButton>


const OnlyOneCheckBoxes = ( props: {
	boxes: string[]
	onChange: ( s: string, i: number ) => void
} ) => {
	const [selected, setSelected] = React.useState<number | undefined>( undefined )

	return <>
		{ props.boxes.map( ( s, i ) => (
			<span key={ i }>
				{ s }
				<input
					type="checkbox"
					checked={ i === selected }
					onChange={ () => {
						setSelected( i )
						props.onChange( s, i )
					} }
				/>
			</span>
		) ) }
	</>
}

const SwitchableCheckBox: React.FC<{ setChecked: ( b: boolean ) => void, checked: boolean }> = props =>
	<input
		type="checkbox"
		checked={ props.checked }
		onChange={ () => props.setChecked( !props.checked ) }
	/>

const DropDownSelection: React.FC<{
	className?: string
	buttonClassName?: string
	dropdownClassName?: string
	value: React.ReactNode
}> = props => {
	const [open, setOpen] = React.useState( false )

	return (
		<div className={ `relative inline-block ${props.className || ""}` }>
			<LargeButton className="w-full" onClick={ () => setOpen( !open ) }>
				{ props.value }
			</LargeButton>
			<div
				onClick={ () => setOpen( !open ) }
				className={ `absolute z-[1000] transition-all flex flex-col overflow-y-auto bg-gray-900 ml-3 border-black ${
					open ? "max-h-64 border-[1px] border-t-0 p-1" : "max-h-0 "} ${props.dropdownClassName || ""
				}` }
			>
				{ props.children }
			</div>
		</div>
	)
}

const StateTitle: React.FC<{ state: ParserState }> = props => {
	const colors: KV<string, ParserState> = {
		active: "#00D2FF",
		error: "#D24B41",
		stopped: "#FFC844",
		removing: "#3A3A3A",
		success: "#00C800",
		launching: "#065A16",
		sequence: "#6000FF"
	}

	const stateName: KV<string, ParserState> = {
		active: "Активен",
		error: "Ошибка",
		stopped: "Остановлен",
		removing: "Удаляется...",
		success: "Успешно",
		launching: "Запускается",
		sequence: "В очереди"
	}

	return (
		<div style={ { color: colors[props.state] } }>{ stateName[props.state] }</div>
	)
}

const TDM: React.FC<React.TdHTMLAttributes<HTMLTableDataCellElement>> = props =>
	<td { ...props } >
		<div className="mx-2 my-1">
			{ props.children }
		</div>
	</td>

const ParserRow = ( props: {
	data: ParserData
	onClick: ( id: string ) => void
} ) => {
	return (
		<tr
			className="border-b-[1px] border-gray-300 hover:bg-gray-800 w-full cursor-pointer"
			onClick={ () => {
				props.onClick( props.data.id )
				emit( "subscribe_parser", props.data.id )
			} }
		>
			<TDM>{ props.data.id }</TDM>
			<TDM>{ props.data.device }</TDM>
			<TDM>{ <StateTitle state={ props.data.state } /> }</TDM>
			<TDM>{ props.data.params.parser }</TDM>
			<TDM>{ props.data.params.city }</TDM>
			<TDM>{ props.data.creationDate }</TDM>
		</tr>
	)
}

const ParserList = () => {
	const parser = R_subscribe( "parser" )
	const [selectedParser, setSelectedParser] = React.useState<string | undefined>( undefined )

	console.log( "ParserList", parser, selectedParser )

	return (
		<div className="h-full flex">
			<div className="min-w-[20rem] border-r-2 border-gray-300 overflow-y-auto overflow-x-hidden">
				<table>
					<tbody>
						{ ( R_subscribe( "parsers", [] ) as ParserData[] )
							.sort( ( a, b ) => Number( a.id ) < Number( b.id ) ? 1 : -1 )
							.map( ( x, i ) =>
								<ParserRow
									key={ i }
									data={ x }
									onClick={ setSelectedParser }
								/>
						) }
					</tbody>
				</table>
			</div>
			{ parser ?
				parser.id === selectedParser ? 
					<>
						<div className="min-w-[16rem] border-r-2 border-gray-300 p-2 overflow-y-auto overflow-x-hidden">
							<div className="flex justify-between">
								<div>ID</div>
								<div>{ parser.id }</div>
							</div>
							<div className="flex justify-between">
								<div>Количество позиций</div>
								<div>{ parser.itemCount }</div>
							</div>
							{ parser.state === "active" ? 
								<LargeButtonFullW onClick={ () => emit( "stop", parser.id ) }>Остановить</LargeButtonFullW>
							: parser.state === "stopped" || parser.state === "error" ?
								<LargeButtonFullW onClick={ () => emit( "resume_parser", parser.id ) }>Возобновить</LargeButtonFullW>
							: undefined }
							{ parser.state !== "success" ?
								<LargeButtonFullW onClick={ () => emit( "upload_items", parser.id ) }>Выгрузить</LargeButtonFullW>
							: undefined }
							{ parser.state !== "active" ?
								<LargeButtonFullW onClick={ () => emit( "remove", parser.id ) }>Удалить</LargeButtonFullW>
							: undefined }
							
						</div>

						<div className="min-w-[16rem] border-r-2 border-gray-300 p-2 overflow-y-auto overflow-x-hidden">
							<div className="font-bold">Последние товары</div>
							{ parser.lastItems.map( x => <div>{ x }</div> ) }
						</div>

						<div className="min-w-[16rem] border-r-2 border-gray-300 p-2 overflow-y-auto overflow-x-hidden flex-grow">
							<div className="font-bold">Лог</div>
							{ parser.log.map( x => <div>{ x }</div> ) }
						</div>
					</>
				: <Loading />
			: undefined }
		</div>
	)
}

const DeviceActive = ( props: {
	sym: string,
	available: DeviceAvailable,
	circle: boolean
} ) => 
	<div className={ `w-6 h-6 m-1 text-center ${ props.circle ? "rounded-full" : "rounded" } ${
		props.available === "undefined" ?
			"bg-gray-400"
		: props.available === "available" ?
			"bg-green-600"
		: props.available === "not_available" ?
			"bg-red-500"
		: ""
	}` }>
		{ props.sym }
	</div>

const Device = ( props: { data: DeviceData } ) => {
	console.log( "DDDEEEEEVIIIIICEEEE", props.data )
	return <div className="flex items-center">
		<div>
			{ `${props.data.deviceName} (${props.data.activeCount})` }
		</div>
		{ props.data.managers.map( ( e, i ) =>
			<DeviceActive
				key={ i }
				sym={ e.extension ? e.name.slice( 0, 1 ).toUpperCase() : "D" }
				available={ e.available }
				circle={ e.extension }
			/>
		) }
	</div>
}

const HeaderDevice = ( props: { data: DeviceData } ) => {
	const [open, setOpen] = React.useState( false )

	return (
		<div className={ `relative inline-block` }>
			<button onClick={ () => setOpen( !open ) } className="py-1 px-3 rounded-2xl h-8 ml-2 flex hover:bg-gray-800 items-center">
				<Device data={ props.data } />
			</button>
			<div
				onClick={ () => setOpen( !open ) }
				className={ `absolute z-[1000] transition-all flex flex-col overflow-hidden bg-gray-900 ml-3 border-black ${
					open ? "max-h-64 border-[1px] border-t-0 p-1" : "max-h-0 "}` }
			>
				<button onClick={ () => emit( "update_parser", props.data.deviceName ) }>Обновить</button>
			</div>
		</div>
	)
}

const Header = ( props: { children?: React.ReactNode } ) =>
	<div className="w-full border-b-2 h-12 border-gray-300 flex items-center">
		<div className="flex mx-auto w-full">
			{ props.children }
		</div>
	</div>

const Loading = () => <div>Loading...</div>

const Popup: React.FC = props => 
	<div className="fixed top-0 bottom-0 left-0 right-0 flex items-center justify-items-center">
		<div className="w-full h-full bg-black bg-opacity-60 fixed z-[-1000]" onClick={ () => dispatch( "popup", undefined ) } />
		<div className="mx-auto bg-gray-700 p-5 rounded-2xl shadow shadow-black">
			{ props.children }
		</div>
	</div>

const Param: React.FC<{ name: string }> = props =>
	<>
		<div className="ml-2 mt-2">{ props.name }</div>
		{ props.children }
	</>

const ParserParam: React.FC<{
	param: EnterParserParam | EnterParserParamPattern
	params: KV<string>
	setParams: ( kv: KV<string> ) => void
}> = props => {
	let param: EnterParserParam = 
		props.param === "city" ?
			{ param: "city", name: "Город", type: "input" }
		: props.param

	if ( param.type === "input" ) {
		return (
			<Param name={ param.name }>
				<LargeInput
					className="w-full"
					value={ props.params[param.param] || "" }
					onChange={ e => {
						props.params[param.param] = e.currentTarget.value
						props.setParams( Object.assign( {}, props.params ) )
					} }
				/>
			</Param>
		)
	} else if ( param.type === "switchable" ) {
		return (
			<div className="mt-2 ml-2 items-center flex">
				{ param.name }
				<input
					className="m-1"
					type="checkbox"
					checked={ props.params[param.param] === "1" }
					onChange={ () => {
						props.params[param.param] = props.params[param.param] === "1" ? "0" : "1"
						props.setParams( Object.assign( {}, props.params ) )
					} }
				/>
			</div>
		)
	} else {
		return <></>
	}
}
	
const ParserParams: React.FC<{
	scheme: ParsersSchemeDBRow[]
	params: KV<string>
	setParams: ( kv: KV<string> ) => void
}> = props => {
	let scheme: ParsersSchemeDBRow | undefined = undefined

	for ( const s of props.scheme ) {
		if ( props.params.parser === s.parserName ) {
			scheme = s
		}
	}

	return (
		<>
			<Param name="Парсер">
				<DropDownSelection className="w-full" value={ props.params.parser }>
					{ props.scheme.map( ( x, i ) =>
							<div
								key={ i }
								onClick={ () => {
									props.setParams( Object.assign( {}, props.params, { parser: x.parserName } ) )
								} }
							>
								{ x.parserName }
							</div>
						)
					}
				</DropDownSelection>
			</Param>
			{ scheme ?
				scheme.params.map( ( x, i ) =>
					<ParserParam param={ x } params={ props.params } setParams={ props.setParams } />
				)
			: [] }
		</>
	)
}

const LaunchParser = () => {
	const [params, setParams] = React.useState<KV<string>>( {} )

	const devices = R_subscribe( "devices" )
	const scheme = R_subscribe( "parsers_scheme" )

	console.log( devices, scheme )

	if ( !devices || !scheme ) {
		return (
			<Popup>
				<Loading />
			</Popup>
		)
	}

	return (
		<Popup>
			<div className="min-w-[20rem]">
				<ParserParams scheme={ scheme } params={ params } setParams={ setParams } />
				<LargeButton
					className="w-full mt-6"
					onClick={ () => {
						if ( params.parser ) {
							emit( "launch_parser", [params, {}] )
						}
					} }
				>
					<div className="mx-auto">Запустить</div>
				</LargeButton>
			</div>
		</Popup>
	)
}

const WeekDayToggle: React.FC<{
	day: WeekDay,
	days: WeekDaysMode,
	onClick: ( day: WeekDay ) => void
}> = props => {
	const weekDays: KV<string, WeekDay> = {
		mo: "ПН",
		tu: "ВТ",
		we: "СР",
		th: "ЧТ",
		fr: "ПТ",
		sa: "СБ",
		su: "ВС"
	}

	return (
		<button
			className={ `w-8 h-8 m-1 rounded-full bg-gray-800 drop-shadow-lg text-white week_day_${props.days[props.day]}` }
			onClick={ () => props.onClick( props.day ) }
		>
			{ weekDays[props.day] }
		</button>
	)
}

const WeekDaysSwitchLine: React.FC<{
	days: WeekDaysMode,
	onClick: ( day: WeekDay ) => void
}> = props => {
	return (
		<div className="flex p-1">
			<WeekDayToggle day="mo" days={ props.days } onClick={ props.onClick } />
			<WeekDayToggle day="tu" days={ props.days } onClick={ props.onClick } />
			<WeekDayToggle day="we" days={ props.days } onClick={ props.onClick } />
			<WeekDayToggle day="th" days={ props.days } onClick={ props.onClick } />
			<WeekDayToggle day="fr" days={ props.days } onClick={ props.onClick } />
			<WeekDayToggle day="sa" days={ props.days } onClick={ props.onClick } />
			<WeekDayToggle day="su" days={ props.days } onClick={ props.onClick } />
		</div>
	)
}

const TimetableRowTD: React.FC<{ w?: number }> = props =>
	<td className="border-gray-200 border-[1px] px-2 py-1 timetable_row" style={ { minWidth: `${( props.w || 0 ) * 5}rem` } }>
		{ props.children }
	</td>

const TimetableRow: React.FC<{ data: ParsersTimetableDBRow }> = props => {
	return (
		<tr>
			<TimetableRowTD>
				<div className="flex">
					{ Object.keys( props.data.params ).map( k =>
						<div className="mr-4">{ props.data.params[k] }</div>
					) }
				</div>
			</TimetableRowTD>
			<TimetableRowTD>{ props.data.priority }</TimetableRowTD>
			<TimetableRowTD>
				<WeekDaysSwitchLine days={ props.data.weekDaysMode } onClick={ () => {} } />
			</TimetableRowTD>
			<TimetableRowTD>{ props.data.avgItems }</TimetableRowTD>
			<TimetableRowTD>
				<LargeButton
					className="mx-auto"
					onClick={ () => emit( "timetable_remove", props.data.id ) }
				>
					X
				</LargeButton>
			</TimetableRowTD>
		</tr>
	)
}

const Timetable = () => {
	const timetable = R_subscribe( "timetable" )
	const scheme = R_subscribe( "parsers_scheme" )
	const weekDays = R_subscribe( "timetable_week_days", {
		mo: "on",
		tu: "on",
		we: "on",
		th: "on",
		fr: "on",
		sa: "off",
		su: "off"
	} )
	const [params, setParams] = React.useState<KV<string>>( {} )
	const [priority, setPriority] = React.useState( 1 )
	const [avgItems, setAvgItems] = React.useState( "1000" )
	const [wdm, setWdm] = React.useState<WeekDaysMode>( {
		mo: "off",
		tu: "off",
		we: "off",
		th: "off",
		fr: "off",
		sa: "off",
		su: "off"
	} )

	console.log( "PARAMSSS", timetable )

	if ( !timetable || !scheme ) {
		return <Loading />
	}

	return (
		<div className="h-full flex w-full">
			<div className="h-full max-h-full border-r-2 border-gray-300 flex flex-col min-w-[24rem] p-2">
				<div className="flex flex-col grow flex-grow">
					<ParserParams scheme={ scheme } params={ params } setParams={ setParams } />
					<Param name="Приоритет">
						<LargeInput
							type="number"
							value={ priority }
							onChange={ e => setPriority( Number( e.currentTarget.value ) ) }
						/>
					</Param>
					<Param name="Среднее кол-во позиций">
						<LargeInput
							type="string"
							value={ avgItems }
							onChange={ e => setAvgItems( String( e.currentTarget.value ) ) }
						/>
					</Param>
					<WeekDaysSwitchLine days={ wdm } onClick={ day => {
						wdm[day] = 
							wdm[day] === "off" ?
								"day"
							: wdm[day] === "day" ?
								"night"
							: "off"

						setWdm( wdm )
					} } />
				</div>
				<LargeButton onClick={ () => emit( "timetable_add", [params, wdm, priority, avgItems] ) }>
					<div className="mx-auto">Добавить</div>
				</LargeButton>
			</div>
			<div className="flex-1 overflow-auto">
				<WeekDaysSwitchLine days={ weekDays } onClick={ day => {
					weekDays[day] = weekDays[day] === "on" ? "off" : "on"
					dispatch( "timetable_week_days", weekDays )
				} } />
				<div className="w-full border-t-2 border-gray-200 overflow-y-auto">
					<table className="w-full timetable_table border-none">
						<thead>
							<tr>
								<TimetableRowTD w={ 6 }>Параметры</TimetableRowTD>
								<TimetableRowTD>Приоритет</TimetableRowTD>
								<TimetableRowTD>Дни недели</TimetableRowTD>
								<TimetableRowTD>Кол-во позиций</TimetableRowTD>
								<TimetableRowTD>Удалить</TimetableRowTD>
							</tr>
						</thead>
						<tbody>
							{ timetable.map( ( x, i ) => <TimetableRow key={ i } data={ x } /> ) }
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}

const Documentation = () =>
	<div>
		<h3 className="text-2xl">
			Когда-нибудь здесь будет документация.
		</h3>
	</div>

export const Main = () => {
	const popup = R_subscribe( "popup" )
	const page = R_subscribe( "main_page", "parser_list" )

	return (
		<div className="fixed bg-gray-700 top-0 bottom-0 left-0 right-0 text-gray-300">
			<Header>
				{ R_subscribe( "devices", [] )
					.map( ( data: any, i: number ) =>
						<HeaderDevice key={ i } data={ data } />
				) }
			</Header>
			<Header>
				<div className="flex w-full">
					<div className="flex flex-1">
						<LargeButton className="m-1" onClick={ () => dispatch( "popup", "launch_parser" ) }>Запустить парсер</LargeButton>
						<LargeButton className="m-1" onClick={ () => dispatch( "main_page", "parser_list" ) }>Мониторинг</LargeButton>
						<LargeButton className="m-1" onClick={ () => dispatch( "main_page", "timetable" ) }>Расписание</LargeButton>
						<LargeButton className="m-1" onClick={ () => dispatch( "main_page", "description" ) }>Подробности парсеров</LargeButton>
					</div>
					<div className="flex">
						<LargeButton className="m-1" onClick={ () => dispatch( "main_page", "documentation" ) }>Документация</LargeButton>
						<LargeButton className="m-1" onClick={ () => emit( "update_parser_scheme" ) }>Обновить схему</LargeButton>
					</div>
				</div>
			</Header>
			<div className="fixed top-0 bottom-0 left-0 right-0 mt-24 flex">
				{ page === "parser_list" ?
					<ParserList />
				: page === "timetable" ?
					<Timetable />
				: page === "documentation" ?
					<Documentation />
				: undefined }
			</div>
			{ popup === "launch_parser" ?
				<LaunchParser />
			: undefined }
		</div>
	)
}