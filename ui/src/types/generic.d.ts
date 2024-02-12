interface IReactEvents {
	main_page: "parser_list" | "timetable" | "documentation" | "description"
	popup: "launch_parser"
	interval_s: number
}

interface IReactEvents extends IUserInterfaceFromServerEvents {}