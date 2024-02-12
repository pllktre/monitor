const login = {
	deviceName: "",
	envName: ""
}

const value_event = ( key, selector ) => {
	const e = document.querySelector( selector )
	e.oninput = () => {
		login[key] = e.value
	}
}

value_event( "deviceName", "#device_name_input" )
value_event( "envName", "#env_name_input" )

document.querySelector( "#enter_button" ).onclick = () => {
	chrome.runtime.sendMessage( {
		type: "socket_login",
		data: login
	} )
}