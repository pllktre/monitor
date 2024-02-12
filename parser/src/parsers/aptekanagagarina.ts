import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 427,
  params: ["city"],
  itemSelector:
    "div.product_list > div > div",
  itemParams: {
    name: [".product_item_title.js-s-open"],
    price: ["div.product_item_total_price > div"],
    brand: ["div.product_item_from > span"]
  },
  func: async () => {
    console.log("aptekanagagarina");
    const tab = await create_tab("https://aptekanagagarina.ru/");

    if (!tab) return;

    parser.exit.Add(() => tab.Close());
    await sleep(4);

    const categories = await tab.Evaluate(() => {
      const list = document.querySelectorAll<HTMLLabelElement>(
        "ul.header_menu.header_menu_desctop.js-header-menu > li:nth-child(2) > a"
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
      await tab.GoTo(`https://aptekanagagarina.ru` + cat.link);
      await sleep(2);
      const subCategories = await tab.Evaluate(() => {
        const list = document.querySelectorAll<HTMLLabelElement>(
          "div.section_sub-category > ul > li > a"
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
      for (const subCat of subCategories) {
        console.log("Start parse Subcategory", subCat.name, subCat.link);
        let page = 1;
        let tries = 0;

        while (true) {
          if (tries > 100) break;

          const html = await tab.Evaluate(
            async ([url, page]) => {
              const res = await fetch(`https://aptekanagagarina.ru${url}/?perPage=20&page=${page}`);
              const text = await res.text();
              return text;
            },
            [subCat.link, page]
          );
          const body = parse(html);

          if (!body) {
            tries++;
            continue;
          }

          parser.ParseItems(html);
          if (!body.querySelector(".product_item_row")) {
            break;
          }
          page++;
        }
        await sleep(5);
      }
    }
  },
});

export default config;
