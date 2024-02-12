import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const CURRENT_CITY =
  "a.link.link_secondary.header-link.header-link_region > span";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 451,
  params: ["city"],
  itemSelector: "div.product-list-mode-grid > div > div",
  itemParams: {
    name: ["div.product-info__description > a"],
    price: ["div.product__active-price > span.product__active-price-number"],
    brand: ["div.product-info__brand > a"],
    contextID: ["a", "href", [/\/(\d+)$/, 1]],
  },
  func: async () => {
    console.log("budzdorov");
    const tab = await create_tab("https://www.budzdorov.ru/");

    if (!tab) return;
    await sleep(20);
    parser.exit.Add(() => tab.Close());

    const currentCity = await tab.GetHTML(CURRENT_CITY);

    console.log("Current city:", currentCity.trim());
    console.log("Target city:", parser.params.city);

    if (currentCity.trim() !== parser.params.city) {
      await tab.Click(CURRENT_CITY);
      await sleep(4);
      await tab.Evaluate(async (city) => {
        const cityList = document.querySelectorAll<HTMLAnchorElement>(
          "div.header-region-selector__by-region > div > div > div > a"
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

    await sleep(10);

    await tab.Click(".header__logo-container > a");

    await sleep(10);

    const urls = await tab.GetUrl();

    const categories = await tab.Evaluate(() => {
      const links = [];
      links.push(
        { name: "Лекарственные препараты", link: "category/2035" },
        { name: "БАДы", link: "category/2036" },
        { name: "Витамины", link: "category/2037" }
      );
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
        await sleep(15);
        const href = urls + cat.link;
        const link = href + "?p=" + page;
        await tab.GoTo(link);
        await sleep(15);

        const text = await tab.Evaluate(async () => document.body.innerHTML);
        const body = parse(text);

        if (!body) {
          tries++;
          continue;
        }

        parser.ParseItems(text);

        if (page > 500 || body.innerHTML.includes("Товары не найдены")) {
          break;
        }
        const no_stock = body.querySelectorAll("product__no-stock-text");
        console.log("Нет в наличии: ",no_stock)
        if(no_stock.length > 5) break;
        page++;
      }

      await sleep(20);
    }
  },
});

export default config;
