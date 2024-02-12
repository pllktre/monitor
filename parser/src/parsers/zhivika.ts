import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const CURRENT_CITY =
  "div.city-change-block > span";
// const CHANGE_CITY =
//   "div.ht-adress-wrapper > a";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 406,
  params: ["city"],
  itemSelector: "div.catalog-page-content__products-wrapper > div.product-slider-card",
  itemParams: {
    name: ["div.product-slider-info__product-name > a"],
    price: ["div.product-slider-info__product-name > div > div.product-price"],
    contextID: ["a", "href", [/\/product\/(\d*)/g, 1]]
  },
  itemFunc: async (item, ie) => {
    const current = ie.querySelector("div.product-slider-info__product-name > div > div.product-price > div.product-price__price");
    const discount = ie.querySelector("div.product-slider-info__product-name > div > div.product-price > div.product-price__price-fractional-part");
    //if(current) {
      item.price = String(item.price).replace("₽", "").replace("от", "").trim();
      parser.AddItem(item);
    //} 
    },
  func: async () => {
    console.log("zhivika");
    const tab = await create_tab("https://kirov.zhivika.ru/");

    if (!tab) return;

    parser.exit.Add(() => tab.Close());

    const currentCity = await tab.GetHTML(CURRENT_CITY);

    console.log("Current city:", currentCity.trim());
    console.log("Target city:", parser.params.city);

    // if (currentCity.trim() !== parser.params.city) {
    //   await tab.Click(CHANGE_CITY);
    //   await sleep(4);
    //   await tab.Evaluate(async (city) => {
    //     const cityList = document.querySelectorAll<HTMLAnchorElement>(
    //       "div.modal-content > div.modal-body > div > div.panel > div > div > ul > li > a"
    //     );
    //     for (const ce of cityList) {
    //       if (ce.textContent && ce.textContent.trim() === city) {
    //         ce.click();
    //         return;
    //       }
    //     }
    //   }, parser.params.city);
    // } else {
    //   console.log("It's ok");
    // }
    let url = "";
    if(parser.params.city =='Киров') {
      url = "https://kirov.zhivika.ru/";
    } else if(parser.params.city =='Барнаул') {
      url = "https://barnaul.zhivika.ru/";
    }
	await sleep(4);
	// await tab.Click("div.header-pc-catalog-btn > div");
	await sleep(4);
	const categories = await tab.Evaluate(async () => {
		const links = [];
		links.push( 
			{name: "Лекарста и бады", link: "catalog/lekarstva_i_bad"},
			{name: "Медицинские изделия", link: "catalog/medicinskie_izdeliya"},
			{name: "Лекарста и бады", link: "catalog/kosmetika"},
			{name: "Товары для мамы и малыша", link: "catalog/tovary_dlya_mamy_i_malysha"},
			{name: "Ортопедия", link: "catalog/bandazhi_i_ogranichiteli_na_sustavy"},
		);
		return links;
	  });
    await sleep(4);

    console.log("Categories", categories);
    await sleep(4);
    for (const cat of categories) {
		console.log("Start parse category", cat.name);
      await tab.GoTo(url + cat.link);
      await sleep(5);

      const subCategories = await tab.Evaluate(() => {
        const list = document.querySelectorAll<HTMLLabelElement>(
          "div.catalog-page__subcategories > div > a"
        );
        const links = [];

        for (const e of list) {
          if (e.textContent) {
            links.push({
              name: e.textContent.trim(),
              link: e.getAttribute("href"),
            });
          }
        }
        return links;
      });
      console.log("Categories", subCategories);
      await sleep(4);
	  for (const Subcat of subCategories) {
      console.log("Start parse category", Subcat.name);
      let page = 1;
      let tries = 0;

      while (true) {
        if (tries > 100) break;
        const href = Subcat.link;
        const link = url.substring(0, url.length - 1) + href +"/?page=" + page;
        await sleep(4);
        await tab.GoTo(link);
        await sleep(20);

        const text = await tab.Evaluate(async () => document.body.innerHTML);
        const body = parse(text);
      

        if (!body) {
          tries++;
          continue;
        }

        parser.ParseItems(text);
        let existence = body.querySelectorAll("div.catalog-page-content__products-wrapper > div.product-slider-card")
        if(existence.length === 0) {
          break;
        }
        if (!body.querySelector("div.catalog-page-content__products-wrapper")
        ) {
          break;
        }
		await sleep(40);
        page++;
      }

      await sleep(5);
    }
}
  },
});

export default config;