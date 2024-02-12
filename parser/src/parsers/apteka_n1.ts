import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 119,
  params: ["city"],
  itemSelector: "div.list > div.item",
  itemParams: {
    name: ["p.product_name"],
    price: ["div.prices > span:nth-child(2)"],
    brand: ["div.pi-content > div.pi-firm.text-truncate"],
    contextID: ["a.product_link", "href"],
  },
  itemFunc: async (item, ie) => {
    item.contextID = ie.querySelector("a.product_link").getAttribute("href").split("").reverse().join("").split('-')[0].split("").reverse().join("").split('/')[0];
	parser.AddItem(item);
	return;
    },
  func: async () => {
    console.log("vn1");
    const tab = await create_tab("https://vn1.ru/");

    if (!tab) return;

    parser.exit.Add(() => tab.Close());

    await sleep(4);

    const categories = await tab.Evaluate(() => {
      const list = document.querySelectorAll<HTMLLabelElement>(
        "div.catalog_list > ul:nth-child(1) > div > div:nth-child(1) > li > a"
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
	  links.splice(0,1)
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
              ` https://vn1.ru${url}?PAGEN_1=${page}`
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
		console.log(body.querySelector("div.show_more-wrapper > a"))
        if (!body.querySelector("div.show_more-wrapper > a")
        ) {
          break;
        }
        page++;
      }

      await sleep(5);
    }
  },
});

export default config;