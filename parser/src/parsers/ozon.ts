import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const CURRENT_CITY =
  "#layoutPage > div > div:nth-child(1) > div > div > div:nth-child(2) > div > div > div > div > button > div";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 442,
  params: ["city"],
  itemSelector: "div.widget-search-result-container > div > div",
  itemParams: {
    name: ["div > a.tile-hover-target > div > span"],
    price: ["div > div:nth-child(2) > span > span:nth-child(1)"],
  },
  func: async () => {
    console.log("ozon");
    const tab = await create_tab("https://www.ozon.ru/geo/moskva/");

    if (!tab) return;

    parser.exit.Add(() => tab.Close());
    await tab.WaitSelector(CURRENT_CITY);
    const currentCity = await tab.GetHTML(CURRENT_CITY);

    console.log("Current city:", currentCity.trim());
    console.log("Target city:", parser.params.city);

    // if (currentCity.trim() !== parser.params.city) {
    //   await sleep(4);
    //   await tab.Click("#layoutPage");
    //   await sleep(4);
    //   await tab.Click(CHANGE_CITY);
    //   await sleep(4);
    //   await tab.Click(CHANGE_CITY1);
    //   await sleep(4);
    //   await tab.Evaluate(async (city) => {
    //     const cityList =
    //       document.querySelectorAll<HTMLAnchorElement>("div.tsBody500Medium");
    //     for (const ce of cityList) {
    //       if (ce.textContent && ce.textContent.trim() === city) {
    //         ce.click();
    //         return;
    //       }
    //     }
    //   }, parser.params.city);
    // } else {
    //   console.log("It's ok");
    // }
    await sleep(6);

    const categories = await tab.Evaluate(() => {
      const links = [];
      links.push(
        {name:"Продавец Озон",link:"planeta-zdorovya-8372/products/?miniapp=seller_8372"}
      );
      return links;
    });

    console.log("Categories", categories);
    await sleep(4);
    for (const cat of categories) {
      console.log("Start parse category", cat.name);
      let page = 1;
      while (true) {
        await sleep(4);
        const link = "https://www.ozon.ru/seller/" + cat.link + "&page=" + page;
        await tab.GoTo(link);
        await sleep(6);

        const text = await tab.Evaluate(async () => document.body.innerHTML);
        const body = parse(text);
        const propetries = body.querySelectorAll(
          "div.widget-search-result-container > div > div"
        );
        for (let r of propetries) {
          const name = r.querySelector(
            "div > a.tile-hover-target > div > span"
          );

          let price = r.querySelector(
            "div > div:nth-child(1) > div:nth-child(1) > span"
          );
          if (name && price) {
            const item = {
              name: name.textContent,
              price: price.textContent
            };
            console.log("Add item", item);
            parser.AddItem(item);
          }
        }
        if(body.innerHTML.includes("ничего не нашлось")) {
          break;
        }
        page++;
      }
      await sleep(5);
    }
  },
});

export default config;