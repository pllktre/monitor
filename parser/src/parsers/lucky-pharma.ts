import type { HTMLElement } from "node-html-parser"
import type { InitParserConfig } from "../components/parsing"
import { parse } from "node-html-parser"
import { http_get } from "../components/http"
import { is_valid_price } from "../components/utils"

const NAME_SELECTOR = "div > div.us-module-caption.d-flex.flex-column > div.us-module-title.flex-grow-1 > a"

const config: InitParserConfig<RequestsParserConfig> = parser => ( {
	type: "requests",
	id: 411,
	itemValidate: ["name", "price", "contextID", "brand"],
	show: true,
	siteUrl: "https://lucky-pharma.ru/",
	categorySelectors: [
		{ s: "#oct-menu-ul > li:nth-child(11) > a" },
		{ s: "#content > div > div > div{0} > div.us-all-categories-category-parent-title > a" }
	],
	itemSelector: "#content > div.row > div",
	itemParams: {
		name: [NAME_SELECTOR],
		price: ["div > div.us-module-caption.d-flex.flex-column > div.us-module-price > span"]
	},
	shiftPageMethod: [
		"url",
		"sort=pd.name&order=DESC&page={0}",
		undefined
	],
	itemFunc: async ( item, e, i ) => {
		console.log( "Lucky pharma item1", item )
		if ( !item.name || !item.price || item.price === "0.00р." ) return

		const a = e.querySelector( NAME_SELECTOR )
		const url = a.getAttribute( "href" )
		const detailHTML = await http_get( url )
		const details = parse( detailHTML )
		const brand = details.querySelector( "li.us-product-info-item.us-product-info-item-manufacturer > a" )
		const contextID = details.querySelector( "li.us-product-info-item.us-product-info-item-model > span" )

		item.brand = brand.textContent
		item.contextID = contextID.textContent

		console.log( "Lucky pharma item2", item )

		parser.AddItem( item )
	}
} )

export default config