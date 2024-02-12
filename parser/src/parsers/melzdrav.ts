import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const CURRENT_CITY = "div.header__right > div.icon.header__geo-btn > span";

const CHANGE_CITY = "div.header__right > div.header__geo-btn";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 432,
  params: ["city"],
  itemSelector: "div.catalog__item", 
  itemParams: {
    name: ["div.catalog__item__name > a"],
    price: ["div.catalog__item__basket__price"],
    brand: ["div.catalog__item__producer"],
  },
  itemFunc: async (item, ie) => {
    item.price = ie.querySelector("div.catalog__item__basket__price").textContent.replace(".","").trim()
    parser.AddItem(item);
    return;
    },
  func: async () => {
    console.log("MELZDRAV");
    const tab = await create_tab("https://melzdrav.ru/");

    if (!tab) return;

    parser.exit.Add(() => tab.Close());

    const currentCity = await tab.GetHTML(CURRENT_CITY);
    console.log("Current city:", currentCity.trim());
    console.log("Target city:", parser.params.city);

    if (currentCity.trim() !== parser.params.city) {
      await tab.Click(CHANGE_CITY);
      await sleep(4);
      tab.SetTimeout(180);

      await tab.Evaluate(async (city) => {
        const regionList = document.querySelectorAll<HTMLAnchorElement>(
          "div.geo-selection > div.geo-selection__regions > div.geo-selection__regions__content > div.geo-selection__regions__content.scroll-content> div.geo-selection__regions__item"
        );
        console.log(regionList.length);
        for (let i = regionList.length - 1; i >= 0; i--) {
          console.log("Region iterate ", i, regionList[i]);

          const re = regionList[i];

          re.click();

          await new Promise((res) => setTimeout(res, 4000));

          const cityList = document.querySelectorAll<HTMLAnchorElement>(
            "div.geo-selection > div.geo-selection__cities> div.geo-selection__cities__content > div.geo-selection__cities__content.scroll-content > div.geo-selection__cities__block > div.geo-selection__cities__item"
          );

          console.log("Heh!");
          for (const ce of cityList) {
            console.log("City is: ", ce);
            if (ce.textContent && ce.textContent.trim() === city) {
              console.log("Hey!");
              ce.click();

              return;
            }
          }
        }
      }, parser.params.city);
      tab.SetTimeout(6);
    } else {
      console.log("It's ok!");
    }

    await sleep(5);

    const categories = await tab.Evaluate(() => {
      const list = document.querySelectorAll<HTMLLabelElement>(
        "ul.b-catalog-navigation__menu > li.b-catalog-navigation__menu-li > a"
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
      await sleep(4);

      console.log("Start parse category", cat.name, cat.link);
      let page = 1;
      let tries = 0;

      while (true) {
        if (tries > 100) break;
        const href = cat.link;
        const link = "https://melzdrav.ru" + href + "?PAGEN_1=" + page;
        await sleep(4);
        await tab.GoTo(link);
        await sleep(2);

        const text = await tab.Evaluate(async () => document.body.innerHTML);
        const body = parse(text);
        if (!body) {
          tries++;
          continue;
        }

        parser.ParseItems(text);
        if (page > 250 || !body.querySelector("a.right")) {
          break;
        }
        page++;
      }

      await sleep(5);
    }
  },
});

export default config;
