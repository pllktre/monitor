import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const CURRENT_CITY = "span.header-city__city";
const CHANGE_CITY = "div.header-city__i";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 445,
  params: ["city"],
  itemSelector: "ol.products.list.items.product-items > li",
  itemParams: {
    name: ["a.indexGoods__item__name.indexGoods__item__name__3lines"],
    price: ["div.price-box > span:nth-child(1) > span > span > span"],
    contextID: ["a", "href", [/\/(\d+)$/, 1]],
  },
  func: async () => {
    console.log("goldapple");
    const tab = await create_tab("https://goldapple.ru");

    if (!tab) return;

    parser.exit.Add(() => tab.Close());

    const currentCity = await tab.GetHTML(CURRENT_CITY);

    console.log("Current city:", currentCity.trim());
    console.log("Target city:", parser.params.city);

    const categories = await tab.Evaluate(() => {
      const links = [];
      links.push({
        name: "Все категории",
        link: "/aptechnaja-kosmetika",
      });
      return links;
    });

    console.log("Categories", categories);
    await sleep(4);
    for (const cat of categories) {
      console.log("Start parse category", cat.name);
      await sleep(2);
      let page = 1;
      while (true) {
        const url = `https://goldapple.ru${cat.link}/?cat=3747&page=${page}`;
        console.log(url);
        const data = await tab.Evaluate(async (url) => {
          const res = await fetch(url);
          const data = await res.json();
          return data;
        }, url);
        console.log(data.products);
        if (!data || !data.products || data.products.length < 1) {
          break;
        }
        for (const good of data.products) {
          if (!good.price || !good.name || !good.id) break;
          parser.Log("GOOD", good);

          parser.AddItem({
            price: good.price.toString(),
            contextID: good.id,
            name: good.category_type + " " + good.brand + " " + good.name + " " + good.volume.toString(),
          });
        }
        sleep(20);
        page++;
        if(page>500) {
          break;
        }
      }
    }
  },
});

export default config;
