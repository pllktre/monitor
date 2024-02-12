import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const CURRENT_CITY = "div.header__location-wrapper > a";
const CHANGE_CITY =
  "div.header__location-wrapper > a > svg";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 415,
  params: ["city"],
  itemSelector: "div.search-card.j-search-card.box__col.box__col_xs_6.box__col_md_4",
  itemParams: {
    name: [undefined, "data-name"],
    price: [undefined, "data-price"],
    brand: [".header-card-search__link"],
    contextID: ["a", "href", [/\.ru\S+\/(\d+)/g, 1]],
  },
  itemFunc: async (item, ie) => {
	if (!item.price || !item.name || !item.brand|| !item.contextID) return;
	  item.price = item.price.replace(",", "");
	  parser.AddItem(item);
	  return;
  },
  func: async () => {
    console.log("b-apteka");
    const tab = await create_tab("https://b-apteka.ru/");

    if (!tab) return;

    parser.exit.Add(() => tab.Close());
    
    await tab.WaitSelector(CURRENT_CITY);
    const currentCity = await tab.GetHTML(CURRENT_CITY);

    const regex = /( |<([^>]+)>)/gi;
    var currentCityRegex = currentCity.replace(regex, "");
    console.log("Current city:", currentCityRegex.trim());
    console.log("Target city:", parser.params.city);

    await sleep(10);
    if (currentCityRegex.trim() !== parser.params.city) {
      await tab.Click(CHANGE_CITY);
      await sleep(4);
      await tab.WaitSelector("div.location-modal__list");
      await tab.Evaluate(async (city) => {
        const cityList = document.querySelectorAll<HTMLAnchorElement>(
          "div.location-modal__list.j-location-list-city > div.j-total-item-list > label > p"
        );
        for (const ce of cityList) {
          console.log(ce);
          if (ce.textContent && ce.textContent.trim() === city) {
            ce.click();
            return;
          }
        }
      }, parser.params.city);
    } else {
      console.log("It's ok");
    }
    await sleep(4);
    await tab.Click(
      ".header__catalog-link.header__catalog-link_catalog.j-catalog-link"
    );
    await sleep(2);
    await tab.WaitSelector("div.catalog-item__title-container > a");
    await sleep(6);

    const categories = await tab.Evaluate(() => {
      const list = document.querySelectorAll<HTMLLabelElement>(
        "div.simple-item__title-container.simple-item__title_with-items > .simple-item__title"
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

    console.log("Categories", categories);
    await sleep(4);

    for (const cat of categories) {
      console.log("Start parse category", cat.name);
      let page = 1;
      let tries = 0;
      while (true) {
        if (tries > 100) break;
        await sleep(6);
        const href = cat.link;
        const link = href + "?page=" + page;
        await tab.GoTo(link);
        await sleep(4);

        const text = await tab.Evaluate(async () => document.body.innerHTML);
        const body = parse(text);

        if (!body) {
          tries++;
          continue;
        }
		let existence = body.querySelectorAll(".svg-icon.pagination__icon.pagination__icon_right")
        if(existence.length === 0) {
          break;
        }
		parser.ParseItems(text);
        page++;
      }

      await sleep(5);
    }
  },
});

export default config;