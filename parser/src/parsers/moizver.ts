import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const CURRENT_CITY =
  "div.js_city_chooser.colored > span";
const CHANGE_CITY =
  "div.js_city_chooser.colored";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 448,
  params: ["city"],
  itemSelector: "div.catalog_block.items.block_list > div > div > div:nth-child(2)",
  itemParams: {
    name: ["div.item-title > a > span"],
    price: ["div.cost.prices.clearfix > div.price"],
    contextID: ["a", "href"],
  },
  itemFunc: async (item, ie) => {
	if (!item.price || !item.contextID) return;
	item.price = item.price.replace(".", "");
    item.contextID = item.contextID.replace(/[^0-9]/g, "");
    parser.AddItem(item);
	return;
  },
  func: async () => {
    console.log("moizver");
    const tab = await create_tab("https://moizver.com/");

    if (!tab) return;

    parser.exit.Add(() => tab.Close());

    const currentCity = await tab.GetHTML(CURRENT_CITY);

    console.log("Current city:", currentCity.trim());
    console.log("Target city:", parser.params.city);

    if (currentCity.trim() !== parser.params.city) {
      await tab.Click(CHANGE_CITY);
      await sleep(4);
      await tab.Evaluate(async (city) => {
        const cityList = document.querySelectorAll<HTMLAnchorElement>(
          "div.items_block > div > a"
        );
        for (const ce of cityList) {
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
    const url = await tab.GetUrl();
    await tab.GoTo(url + "catalog/");

    await sleep(2);
    await tab.WaitSelector("div.catalog_section_list");
    await sleep(6);

    const categories = await tab.Evaluate(() => {
      const list = document.querySelectorAll<HTMLLabelElement>(
        "div.catalog_section_list > div > div.section_item.item > table > tbody > tr:nth-child(1) > td.section_info > ul > li > a"
      );
      const links = [];
      
      for (const e of list) {
        if (e.textContent) {
            if(e.textContent.trim() !=='Товары для собак' && e.textContent.trim() !=='Товары для кошек'
            && e.textContent.trim() !== 'Товары для грызунов и хорьков'
            && e.textContent.trim() !=='Товары для птиц' && e.textContent.trim() !=='Товары для рыб'
            && e.textContent.trim() !=='Товары для сельскохозяйственных животных'
            && e.textContent.trim() !=='Ветеринарная аптека' && e.textContent.trim() !=='Новый год' && e.textContent.trim() !=='Другие товары') {
          links.push({
            name: e.textContent.trim(),
            link: e.getAttribute("href"),
          });
        }
        }
      }
      links.splice(links.length - 3, 3);
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

        const html = await tab.Evaluate(
          async ([url, page]) => {
            const res = await fetch(
              ` https://moizver.com${url}?PAGEN_3=${page}`
            );
            const text = await res.text();
            return text;
          },
          [cat.link, page]
        );
        const body = parse(html);

        if (!body) {
          tries++;
          continue;
        }

        parser.ParseItems(html);
        if (!body.querySelector("ul.flex-direction-nav > li.flex-nav-next > a")) {
          break;
        }
        page++;
      }

      await sleep(5);
    }
  },
});

export default config;