export function nothing( x: any ): x is undefined | null {
	return x === undefined || x === null || typeof( x ) === "number" && isNaN( x )
}