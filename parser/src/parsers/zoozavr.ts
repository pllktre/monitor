import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const CURRENT_CITY =
  "header > div > div > div > ul > li > div > div > div > div > span";
const CHANGE_CITY =
  "header > div > div > div > ul > li > div > div > div > div > span";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 448,
  params: ["city"],
  itemSelector: "header > div > div:nth-child(3) > div > div > div > div > div:nth-child(2) > div > div > section",
  itemParams: {
    name: ["a > span"],
    price: ["div:nth-child(3) > div > span"],
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
    const tab = await create_tab("https://zoozavr.ru/");

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
          "section > div:nth-child(3) > ul > li > ul > li > span"
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

    await sleep(2);
    await tab.WaitSelector("header");
    await sleep(6);

    const categories = await tab.Evaluate(() => {
      const list = document.querySelectorAll<HTMLLabelElement>(
        "nav > div > ul > li > a"
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

        const html = await tab.Evaluate(
          async ([url, page]) => {
            const res = await fetch(
              `${url}page/2/${page}`
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
        if (!body.innerHTML.includes('Показать еще') || body.innerHTML.includes('Товар закончился') ) {
          break;
        }
        page++;
      }

      await sleep(5);
    }
  },
});

export default config;