import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const CURRENT_CITY =
  "#layoutPage > div > div:nth-child(1) > div > div > div:nth-child(2) > div > div > div > div > div:nth-child(1) > div > button > span > span";
const CHANGE_CITY =
  "#layoutPage > div > div:nth-child(1) > div > div > div:nth-child(2) > div > div > div > div > div:nth-child(1) > div > button";
  const CHANGE_CITY1 =
  "div.vue-portal-target > div > div:nth-child(2) > div > div > div:nth-child(2) > div > div > div > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(2)";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 443,
  params: ["city"],
  itemSelector: "div._3KhA2._1jTgr > div > div > div > div > article",
  itemParams: {
    name: ["span._1E10J._1zh3_"],
    price: ["._1He5n._36SPc > span:nth-child(2)"],
  },
  func: async () => {
    console.log("ozon");
    const tab = await create_tab("https://market.yandex.ru");

    if (!tab) return;

    parser.exit.Add(() => tab.Close());

    // const currentCity = await tab.GetHTML(CURRENT_CITY);

    // console.log("Current city:", currentCity.trim());
    // console.log("Target city:", parser.params.city);

    // if (currentCity.trim() !== parser.params.city) {
    //   await tab.Click(CHANGE_CITY);
    //   await sleep(4);
    //   await tab.Click(CHANGE_CITY1);
    //   await sleep(4);
    //   await tab.Evaluate(async (city) => {
    //     const cityList = document.querySelectorAll<HTMLAnchorElement>(
    //       "div.vue-portal-target > div > div:nth-child(2) > div > div > div:nth-child(2) > div > div > div:nth-child(2) > div > div > div > div > div:nth-child(1) > div"
    //     );
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
    // await sleep(6);

    const categories = await tab.Evaluate(() => {
      const links = [];
      links.push(
        {name: "ЛС",link: "https://market.yandex.ru/catalog--lekarstvennye-preparaty-i-bad/72412?hid=15754673&lr=213",},
      );
      return links;
    });

    console.log("Categories", categories);
    await sleep(4);
    for (const cat of categories) {
      console.log("Start parse category", cat.name);
      await tab.GoTo(cat.link);
      await sleep(4);
        const subCategories = await tab.Evaluate(() => {
          const list = document.querySelectorAll<HTMLLabelElement>(
            "a.egKyN "
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
          links.pop();
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
            await sleep(4);
            const href = subCat.link;
            const link = "https://market.yandex.ru" + href + "&allowCollapsing=1&local-offers-first=0&page=" + page;
            await tab.GoTo(link);
            await sleep(5);
            await tab.ScrollTo("div._3mydt");
            await sleep(10);
    
            const text = await tab.Evaluate(async () => document.body.innerHTML);
            const body = parse(text);
    
              if (!body) {
                tries++;
                continue;
              }
              
              parser.ParseItems(text);
              if ( page > 500 || body.innerHTML.includes("Что-то пошло не так") || !body.innerHTML.includes("Вперёд")) {
                break;
            }
              page++;
              await sleep(10);
            }
    
            await sleep(5);
        }
    }
  },
});

export default config;
