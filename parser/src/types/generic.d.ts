interface InvalidItemRow {
	name?: string
	contextID?: string
	brand?: string
	city?: string
	seller?: string
	price?: string
	price1?: string
	price2?: string
}

interface ItemRow {
	name: string
	contextID?: string
	brand: string
	city?: string
	seller?: string
	price: string
	price1?: string
	price2?: string
}

type ItemValidate = GenericKV<keyof InvalidItemRow, string>

type KV<Value=any> = { [Key: string]: Value }
type Nothing = undefined | null