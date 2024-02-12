export const http_get = async ( url: string ) => {
	const res = await fetch( url, {
		headers: {
			"Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
		}
	} )
	const data = await res.text()

	return data
}