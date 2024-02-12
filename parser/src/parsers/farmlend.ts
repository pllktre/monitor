import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const CURRENT_CITY =
  "div.ht-adress-wrapper > a > div.hta-text";
const CHANGE_CITY =
  "div.ht-adress-wrapper > a";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 403,
  params: ["city"],
  itemSelector: "#w0 > div.products > div > div > div",
  itemParams: {
    name: ["div.pi-content > div.pi-title"],
    price: ["div.pi-current"],
    brand: ["div.pi-content > div.pi-firm.text-truncate"],
    contextID: ["a", "href", [/\/(\d+)$/, 1]],
  },
  itemFunc: async (item, ie) => {
    const current = ie.querySelector("div.pi-current");
    const discount = ie.querySelector("div.pi-discounted > span");
    if(discount) {
      item.price = discount.textContent;
      parser.AddItem(item);
    } else {
      item.price = current.textContent;
      parser.AddItem(item);
    }
    },
  func: async () => {
    console.log("farmlend");
    const tab = await create_tab("https://farmlend.ru/");

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
          "div.modal-content > div.modal-body > div > div.panel > div > div > ul > li > a"
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
    await tab.GoTo("https://farmlend.ru/catalog");

    await sleep(2);
    await tab.WaitSelector("div.categories-block > div.row > div > a");
    await sleep(6);

    const categories = await tab.Evaluate(() => {
      const list = document.querySelectorAll<HTMLLabelElement>(
        "div.categories-block > div.row > div > a"
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
              ` https://farmlend.ru${url}/?order_by=title&order_dir=ASC&page=${page}`
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

        if (page > 500 ||!body.querySelector("#w0 > div.text-center.m-t-5.m-md-t-20 > ul.pagination > li.next > a")
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