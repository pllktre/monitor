import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const CURRENT_CITY = "div.header__mainlinks__geo > a";
const CHANGE_CITY = "div.header__mainlinks__geo > a";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 438,
  params: ["city"],
  itemSelector: "div.goods__items.minilisting.borderedTiles.js__goods__items > div.indexGoods__item",
  itemParams: {
    name: ["a.indexGoods__item__name.indexGoods__item__name__3lines"],
    price: ["span.price"],
    contextID: ["span.indexGoods__item__fastView ",'data-itemid'],
  },
  itemFunc: async (item, ie) => {
    const button = ie.querySelector("a.button.button__orange.js__ajaxExchange");
    if (button && button.textContent === "Купить") {
      parser.AddItem(item);
      return;
    } 
    const button1 = ie.querySelector("a.button.button__blue.js__ajaxExchange");
    if(button1 && button1.textContent === "Сообщить") {
      return;
    }
  },
  func: async () => {
    console.log("onlinetrade");
    const tab = await create_tab("https://www.onlinetrade.ru/");

    if (!tab) return;

    parser.exit.Add(() => tab.Close());

    await sleep(4)

    const currentCity = await tab.GetHTML(CURRENT_CITY);

    console.log("Current city:", currentCity.trim());
    console.log("Target city:", parser.params.city);

    if (currentCity.trim() !== parser.params.city) {
        await tab.Click(CHANGE_CITY);
        await sleep(4);
        await tab.Evaluate(async (city) => {
          const cityList = document.querySelectorAll<HTMLAnchorElement>(
            "table.citysColummns > tbody > tr > td > ul > li > a"
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

    const categories = await tab.Evaluate(() => {
      const links = [];
      links.push(
        { name: "Лекарственные средства", link: "/catalogue/lekarstvennye_sredstva-c5318/" },
        { name: "Профилактические средства", link: "/catalogue/profilakticheskie_sredstva_fitosbory_kremy_kapli-c5312/" },
        { name: "Медицинская техника", link: "/catalogue/meditsinskaya_tekhnika-c1307/"},
        { name: "Витамины, БАДы и пищевые добавки", link: "/catalogue/vitaminy_bady_i_pishchevye_dobavki-c5302/"},
      );
      return links;
    });

    console.log("Categories", categories);
    await sleep(4);
    for (const cat of categories) {
      console.log("Start parse category", cat.name);
      await tab.GoTo(`https://www.onlinetrade.ru` + cat.link);
      await sleep(10);
      const subCategories = await tab.Evaluate(() => {
        const list = document.querySelectorAll<HTMLLabelElement>(
          "div.drawCats__item > a"
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
        let page = 0;
        let tries = 0;

        while (true) {
          if (tries > 100) break;
          const href = subCat.link;
        const link = "https://www.onlinetrade.ru" + href + "?page=" + page;
        await sleep(4);
        await tab.GoTo(link);
        await sleep(20);

        const btn = await tab.Evaluate(() => document.querySelector("input.button.button__orange")); 
        if(btn) {
          await tab.Click("input.button.button__orange");
        }
        else {
        const text = await tab.Evaluate(async () => document.body.innerHTML);
        const body = parse(text);

          if (!body) {
            tries++;
            continue;
          }
          parser.ParseItems(text);
          if(page!==0) {
          if (body.querySelector("span.gray.disabled") || !body.querySelector("div.paginator__links > a")) {
            break;
          }
        }
      }
          page++;
          await sleep(20);
        }
        

        await sleep(30);
      }
    }
  },
});

export default config;
