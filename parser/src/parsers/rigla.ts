import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const CURRENT_CITY =
  "div.active-city__text";
const CHANGE_CITY =
  "div.active-city__text";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 446,
  params: ["city"],
  itemSelector: "div.product-list-mode-grid > div > div.product",
  itemParams: {
    name: ["a.product__title"],
    price: ["div.product__active-price > span.product__active-price-number"],
    brand: ["div.product__brand > a.product-brand__link"],
    contextID: ["a.product__title", "href", [/\/(\d+)$/, 1]],
  },
  func: async () => {
    console.log("rigla");
    const tab = await create_tab("https://www.rigla.ru/");

    if (!tab) return;

    parser.exit.Add(() => tab.Close());

    await sleep(10);
    const currentCity = await tab.GetHTML(CURRENT_CITY);

    console.log("Current city:", currentCity.trim());
    console.log("Target city:", parser.params.city);

    if (currentCity.trim() !== parser.params.city) {
      await tab.Click(CHANGE_CITY);
      await sleep(10);
      await tab.Evaluate(async (city) => {
        const cityList = document.querySelectorAll<HTMLAnchorElement>(
          "div.city-selector__i > section > a > div.city-selector-city__city"
        );
        for (const ce of cityList) {
          if (ce.textContent && ce.textContent.replace("(выбран)","").trim() === city) {
            ce.click();
            return;
          }
        }
      }, parser.params.city);
    } else {
      console.log("It's ok");
    }
    await sleep(10);

    const categories = await tab.Evaluate(() => {
      const links = [];

      links.push(
        {name: "Лекарственные препараты",link: "cat/lekarstvennye-preparaty",},
        {name: "Витамины и БАДы",link: "cat/vitaminy-i-bady",}
      )
      return links;
    });
    const url = await tab.GetUrl();

    console.log("Categories", categories);
    await sleep(4);
    for (const cat of categories) {
      console.log("Start parse category", cat.name);
      await tab.GoTo(url + cat.link + "?filter=stock__in_stock");
      await tab.WaitSelector(".pagination__item._last");
      await sleep(5);
      const text = await tab.Evaluate(async () => document.body.innerHTML);
      const body = parse(text);
      const len = body.querySelector(".pagination__item._last > div").textContent.trim();
      console.log("len:", Number(len))
      const numbers = Array.from({length: Number(len)}, (_, i) => i + 1);

      for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
      }
      await sleep(5);
      let i = 0;
      let tries = 0;

      while (true) {
        if (tries > 100) break;
        const href = cat.link;
        let link = "";
       // switch(cat.name) {
         // case "Лекарственные препараты": 
          link = url + href + "/?p=" + numbers[i] + "&filter=stock__in_stock";
         // break;
          //case "Витамины и БАДы": 
          //link = url + href + "/?p=" + numbers[i] + "&filter=stock__in_stock";
          //break;
       // }
        await tab.GoTo(link);
        await sleep(Math.random()*26.33434);

        const text = await tab.Evaluate(async () => document.body.innerHTML);
        const body = parse(text);

        if (!body) {
          tries++;
          continue;
        }
        await sleep(Math.random()*26.1934);
        const propetries = body.querySelectorAll(
          "div.product-list-mode-grid > div > div.product"
        );
        
        if (body.innerHTML.includes("Товары не найдены")) {
          break;
        }

        if (propetries.length === 0) {continue;}
        for (let r of propetries) {
          const name = r.querySelector(
            "a.product__title"
          );
          let price = r.querySelector("div.product__active-price > span.product__active-price-number");
          let brand = r.querySelector("div.product__brand > a.product-brand__link");
          let contextID = String(r.querySelector("a.product__title").getAttribute("href")).replace(/[^0-9]/g, "");

          if(price && name) {
            const item = {
              name: name.textContent.trim(),
              price: price.textContent.trim(),
              brand: brand.textContent.trim(),
              contextID:contextID
            };
            console.log("Add item", item);
            parser.AddItem(item);
          }
        }
          
        i++;
      }

      await sleep(Math.random()*26.1934);
    }
  },
});

export default config;