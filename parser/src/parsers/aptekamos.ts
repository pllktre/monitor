import type { InitParserConfig } from "../components/parsing"
import { parse } from "node-html-parser"
import Nightmare from "nightmare"
import { nothing, insert_string } from "../components/utils"


const brandSelector = "#modal-firms-d > div{0} > div > div > div > span"
const brandBtnSelector1 = "#products > div.product.flex-df > div:nth-child(2) > div:nth-child(3) > div > div > span.am-button.function.clarify"
const brandBtnSelector2 = "#products > div.product.flex-df > div:nth-child(2) > div:nth-child(3) > div > div > span.am-button.function.clarify > span > span > span:nth-child(2) > span.function.product-firms"

const config: InitParserConfig = parser => {
	let bnm: Nightmare | undefined = undefined

	const select_city = async ( nm: Nightmare ) => {
		const html = await nm
			.wait_click( "#h-regions" )
			.wait( "#modal-global-regions-d > ul > li" )
			.get_html()
	
		const all = parse( html ).querySelectorAll( "#modal-global-regions-d > ul > li" )
	
		console.log( "Cities count:", all.length )
	
		for ( let i in all ) {
			const ie = all[i]
			const n = ie.querySelector( "div.h-region-name" )
	
			console.log( "City", n ? n.textContent : undefined )
	
			if ( n && n.textContent === parser.params.city ) {
				console.log( n.textContent, parser.params.city, "CLICK", i )
				await nm.wait_click( `#modal-global-regions-d > ul > li:nth-child(${Number( i ) + 1}) > div.h-region-name` )
	
				return
			}
		}
	
		throw( "Cant select city" )
	}

	return {
		type: "nightmare",
		id: 407,
		itemValidate: ["name", "price", "brand"],
		siteUrl: "https://aptekamos.ru",
		params: ["city"],
		show: false,
		timeout: 30000,
		selectCity: select_city,
		categorySelectors: [{ s: "#h-menu > div:nth-child(2) > a" }],
		itemSelector: "#products > div.product.flex-df",
		itemParams: {
			name: ["div.product-name"]
		},

		shiftPageMethod: [
			"url",
			"page={0}",
			undefined
		],

		itemFunc: async ( item: InvalidItemRow, itemElement: KV ) => {
			const linkElement = itemElement.querySelector( "div.product-1 > div.product-2.flex-df > div.product-3 > div.org-button-c > a" )

			if ( nothing( linkElement ) ) return

			const link = linkElement.getAttribute( "href" )

			if ( nothing( link ) ) return

			const contextIDmatch = /-\d+\/\S+-(\d+)/g.exec( link )
			const contextID = contextIDmatch ? contextIDmatch[1] : undefined

			if ( !bnm ) {
				bnm = new Nightmare( { show: false } )
				await bnm.goto( "https://aptekamos.ru" ).wait( 4000 )
				await select_city( bnm )
				await bnm.wait( 1000 )
			}

			await bnm.goto( link )


			let i = 1
			let bc: undefined | number = undefined

			try {
				while( true ) {
					console.log( "Brand itrt", item, i, bc, !nothing( bc ) && i > bc )

					if ( !nothing( bc ) && i > bc ) break

					await bnm
						.wait_click( brandBtnSelector1 )
						.wait_click( brandBtnSelector2 )
						.wait( 300 )

					const iBrandSelector = insert_string( brandSelector, `:nth-child(${i})` )

					console.log( "wait selector", iBrandSelector )

					const brandHTML = await bnm
						.wait( iBrandSelector )
						.get_html()

					console.log( "wait selector", !!brandHTML )

					const brandBody = parse( brandHTML )
					const brand = brandBody.querySelector( iBrandSelector ).textContent

					console.log( "Again itrt", brand, i - 1, bc, !nothing( bc ) && i - 1 > bc )

					bc = brandBody.querySelectorAll( insert_string( brandSelector, "" ) ).length

					const html = await bnm
						.wait_click( iBrandSelector )
						.wait( 2000 )
						.get_html()

					const body = parse( html )
					let minPrice: number | undefined = undefined

					for ( let row of body.querySelectorAll( "#orgs > div.org.flex-df" ) ) {
						//const be = row.querySelector( "div > div.ret--firm" )
						const ne = row.querySelector( "div.org-name-c > noindex > a > span.bold-text" )
						const pe = row.querySelector( "div.org-price-c > span" )

						if ( !ne || nothing( ne.textContent ) || ne.textContent.includes( "Планета здоровья" ) )
						if ( !pe || nothing( pe.textContent ) ) { continue }

						const price = Number( pe.textContent.replace( /\s+|\.\.\..*/g, "" ) )

						if ( nothing( minPrice ) ) {
							minPrice = price
						} else if ( !nothing( price ) ) {
							minPrice = price < minPrice ? price : minPrice
						}
					}

					if ( !nothing( minPrice ) ) {
						parser.AddItem( Object.assign( {
							name: item.name,
							brand: brand,
							price: minPrice.toString()
						}, contextID ? { contextID: contextID } : {} ) )
					}

					i++
				}
			} catch( e ) {}
		}
	}
}

export default config