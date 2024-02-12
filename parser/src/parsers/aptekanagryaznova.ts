import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 429,
  params: ["city"],
  itemSelector:
    "div.product_list > div > div",
  itemParams: {
    name: [".product_item_title.js-s-open"],
    price: ["div.product_item_total_price > div"],
    brand: ["div.product_item_from > span"]
  },
  func: async () => {
    console.log("aptekanagryaznova.ru");
    const tab = await create_tab("http://aptekanagryaznova.ru");

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
      if(cat.link) {
        cat.link = cat.link.replaceAll(" ","_");
      }
      console.log("Start parse category", cat.name);
      await tab.GoTo(`http://aptekanagryaznova.ru` + cat.link);
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
        if(subCat.link) {
          subCat.link = subCat.link.replaceAll(" ","_");
        }
        console.log("Start parse Subcategory", subCat.name, subCat.link);
        let page = 1;
        let tries = 0;

        while (true) {
            if (tries > 100) break;

            const href = subCat.link;
            const link = "http://aptekanagryaznova.ru" + href + "/?perPage=20&page=" + page;
            await sleep(4);
            await tab.GoTo(link);
            await sleep(6);
    
            const text = await tab.Evaluate(async () => document.body.innerHTML);
            const body = parse(text);
  
            if (!body) {
              tries++;
              continue;
            }
  
            parser.ParseItems(text);
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
