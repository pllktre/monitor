import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const CURRENT_CITY =
  "#headerCity-root-adaptive > div.header--city > div > div.select_in > span";
const CHANGE_CITY =
  "#headerCity-root-adaptive > div.header--city > div > div.select_in > span";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 452,
  params: ["city"],
  itemSelector: "div.container > div:nth-child(3) > div > div.product-list  > div.listing > section",
  itemParams: {
    name: [undefined, "data-amplitude-offer"],
    price: [undefined, "data-amplitude-offer", [/"itemPrice":(\d+),?/g, 1]],
    brand: [".cc-item--info .cc-item--fields > p > a"],
    contextID: [undefined, "data-xml-id"],
  },
  itemFunc: async (item, ie) => {
    const name = item.name;
    const nameJson = JSON.parse(String(name));
    item.name = nameJson["itemName"];
    parser.AddItem(item);
	  return;
    },
  func: async () => {
    console.log("eapteka");
    const tab = await create_tab("https://www.eapteka.ru");

    if (!tab) return;

    parser.exit.Add(() => tab.Close());
    
    await sleep(5);
    const currentCity = await tab.GetHTML(CURRENT_CITY);

    console.log("Current city:", currentCity.trim());
    console.log("Target city:", parser.params.city);

    await tab.WaitSelector(CHANGE_CITY);

    if (currentCity.trim() !== parser.params.city) {
      await tab.Click(CHANGE_CITY);
      await sleep(4);

      await tab.WaitSelector("div.header__tower-form > div.header__tower-result > div.header__tower-link > a");

      await tab.Evaluate(async (city) => {
        const cityList = document.querySelectorAll<HTMLAnchorElement>(
          "div.header__tower-form > div.header__tower-result > div.header__tower-link > a"
        );
        for (const ce of cityList) {
          if (ce.textContent && ce.textContent.trim() === city) {
            ce.click();
            await sleep(4);
            return;
          }
        }
      }, parser.params.city);
    } else {
      console.log("It's ok");
    }
    await sleep(10);
    await tab.WaitSelector("div.header__nav > ul > li > a");

    const categories = await tab.Evaluate(() => {
      const list = document.querySelectorAll<HTMLLabelElement>(
        "div.header__nav > ul > li > a"
      );
      const links = [];

      // links.push(
      //   { name: "Линзы", link: "/goods/linzy/" },
      //   { name: "Мать и дитя", link: "/goods/mother/" },
      //   { name: "Медтовары", link: "/goods/medical/" },
      //   { name: "Медтехника", link: "/goods/pribory_i_meditsinskaya_tekhnika/" },
      //   { name: "Зоотовары", link: "/goods/zootovary/" }
      // );

      for (const e of list) {
        if (e.textContent) {
          links.push({
            name: e.textContent.trim(),
            link: e.getAttribute("href"),
          });
        }
      }
      links.splice(0,4);
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

        const href = cat.link;
        const link = "https://eapteka.ru" + href + "?PAGEN_1=" + page;
        await sleep(4);
        await tab.GoTo(link);
        await sleep(15);


        const text = await tab.Evaluate(async () => document.body.innerHTML);
        const body = parse(text);

        const propetries = body.querySelectorAll(
          "section.sec-inner > div.container > div.sec-categories > div:nth-child(3) > div.sec-categories__list > div.product-list > div.listing > *"
        );
        const names = [];
        const prices = [];
        const brands = [];
        const ContetId = [];

       for (let r of propetries) {           
          const name = r.querySelector("h5.listing-card__title > a");
          const price = r.querySelector("div.listing-card__price-wrapper > span");
          const brand = r.querySelector("div.listing-card__info > p > a");
          const contID = r.querySelector("h5.listing-card__title > a");
          if(name) {
            names.push(name.textContent.trim());
          }
          if(price) {
            prices.push(price.getAttribute("data-price")?.trim());
          }
          if(brand) {
            brands.push(brand.textContent.trim());
          }
          if(contID) {
            ContetId.push(String(contID.getAttribute("href")).replace(/[^0-9]/g, "").trim());
          }
       }
       for(let i = 0; i < names.length;i++) {
          const item = {
            name: names[i],
            price: prices[i],
            brand: brands[i],
            ContextId: ContetId[i],
          };
          console.log("Add item", item);
          parser.AddItem(item);
       }
        if (!body) {
          tries++;
          continue;
        }

        if(propetries.length === 0) break;
        // let existence = body.querySelectorAll("div.cc-item--price.price.pt-3.pt-md-0.mb-2.mb-md-0 > p");
        // if (page > 5) {
        //   if (existence.length === 0) {
        //     break;
        //   }
        // }
        await sleep(10);
        if (body.innerHTML.includes("Нет в наличии") || body.querySelector("div.sec-error") ) {
          break;
        }
        page++;
      }

      await sleep(20);
    }
  },
});

export default config;
