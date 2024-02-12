import type { InitParserConfig } from "../components/parsing"
import { parse } from "node-html-parser"
import Nightmare from "nightmare"
import { nothing } from "../components/utils"

const config: InitParserConfig<NightmareParserConfig> = parser => {
	let bnm: Nightmare | undefined = undefined

	const selectCity = async ( nm: Nightmare ) => {
		await nm
			.wait_click( "#modal-help-city > div > div > div > div > div > div > div.help-city__links > a:nth-child(2)" )
			.wait_click( "#changeCity div.search-city__wrapper > div > input" )
			.wait( 2000 )
			.evaluate( ( city ) => {
				const e = <HTMLInputElement>document.querySelector( "#changeCity div.search-city__wrapper > div > input" )
	
				if ( !e ) return
	
				e.value = city
	
				const change = document.createEvent( "Events" )
				change.initEvent( "change", true, true )
				e.dispatchEvent( change )
	
				const focus = document.createEvent( "Events" )
				focus.initEvent( "focus", true, true )
				e.dispatchEvent( focus )
			}, parser.params.city )
			.wait_click( "#search-city-result-list-1 > li" )
			.wait( 8000 )
	}

	return {
		type: "nightmare",
		id: 412,
		siteUrl: "https://vitaexpress.ru",
		itemValidate: ["name", "price", "contextID"],
		cache: ["brands"],
		show: true,
		timeout: 30000,
		categorySelectors: [
			{ s: "body > div.page > header > div.header-main.hidden-xs > div.container.w-md-100 > div > ul > li{0} > a", i: [
				1, 2, 3, 4, 6
			] },
			{ s: "#map-catalog > div.panel-mobile__content > div > div > a{0}" },
			{ s: "#map-catalog > div.panel-mobile__content > div > div > a{0}", o: true }
		],
		itemSelector: "#page- div.glide__track div.col-ms, #catalog-page div.js-contentPager.row > div.pager-content",
		itemParams: {
			name: ["div.product__title > a > span"],
			price: ["span.priceSVG > span"],
			contextID: ["div.product--main", "data-id"]
		},
		pageFunc: async parsing => await parsing.LoadMore(
			"#catalog-page div.js-contentPager.row",
			"#catalog-page div.js-contentPagerWrap > div.btn-block > button"
		),

		selectCity: selectCity,

		itemFunc: async ( item: InvalidItemRow, itemElement: KV ) => {
			if ( nothing( item.contextID ) || nothing( item.name ) || nothing( item.price ) ) {
				return
			}

			const ac = itemElement.querySelector( "div.product__nameplate__text" )

			console.log(
				!!ac,
				ac ? ac.textContent : undefined,
				ac ? ac.textContent.includes( "ВитаМикс 3 по 2" ) : undefined
			)

			if ( ac && ac.textContent.includes( "ВитаМикс 3 по 2" ) ) {
				console.log( "QQQ" )
				parser.AddItem( item )
			}
		},

		onError: () => bnm ? bnm.end() : undefined
	} 
}

export default config