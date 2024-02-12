import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 430,
  params: ["city"],
  itemSelector:
    "div.stock-price-item.filt-item",
  itemParams: {
    name: [".line-clamp"],
    price: ["div.active-price"],
    contextID: ["div.favori", "rel"]
  },
  func: async () => {
    console.log("apteka-lenina8");
    const tab = await create_tab("http://apteka-lenina8.ru");

    if (!tab) return;

    parser.exit.Add(() => tab.Close());
    await sleep(4);

    const categories = await tab.Evaluate(() => {
        const links = [];
        links.push(
  
          { name: "Лекарства и БАДы", link: "/catalog/category_7945.html" },
        );
        return links;
      });

    console.log("Categories", categories);
    await sleep(4);
    for (const cat of categories) {
      console.log("Start parse category", cat.name);
      await tab.GoTo(`https://apteka-lenina8.ru` + cat.link);
      await sleep(2);
        let page = 1;
        let tries = 0;
        while (true) {
          if (tries > 100) break;

          const html = await tab.Evaluate(
            async ([page]) => {
              const res = await fetch(`/catalog/page_${page}_category_7945.html`);
              const text = await res.text();
              return text;
            },
            [page]
          );
          const body = parse(html);

          if (!body) {
            tries++;
            continue;
          }

          parser.ParseItems(html);
          if (!body.querySelector(".stock-price-item.filt-item")) {
            break;
          }
          page++;
        }
        await sleep(5);
      }
  },
});

export default config;
