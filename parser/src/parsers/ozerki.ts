import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const CURRENT_CITY =
  ".header-upper-region-control__text-overflow";
const CHANGE_CITY = ".header-upper-region-control__text-overflow";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 414,
  params: ["city"],
  itemSelector: "main > div > div > div > div:nth-child(2) > div:nth-child(2) > div > div",
  itemParams: {
    name: [".product-name"],
    price: ["div.product-price__base-price"],
    brand: ["div:nth-child(3) > div > div:nth-child(3) > span > a"],
  },
  func: async () => {
    console.log("ozerki_ru");
    const tab = await create_tab("https://ozerki.ru/");

    if (!tab) return;

    parser.exit.Add(() => tab.Close());

    const currentCity = await tab.GetHTML(CURRENT_CITY);

    console.log("Current city:", currentCity.trim());
    console.log("Target city:", parser.params.city);
    await sleep(4);

    if (currentCity.trim() !== parser.params.city) {
      await tab.WaitSelector(CHANGE_CITY);
      await tab.Click(CHANGE_CITY);
      await sleep(4);
      await tab.Evaluate(async (city) => {
        const cityList = document.querySelectorAll<HTMLAnchorElement>(
          "div.sc-a63911a6-1.fVESIq.loader-wrapper > div"
        );
        for (const ce of cityList) {
          console.log(ce.textContent);
          if (ce.textContent && ce.textContent.trim() === city) {
            ce.click();
            return;
          }
        }
      }, parser.params.city);
      sleep(4);
    } else {
      console.log("It's ok");
    }
    await sleep(6);

    const categories = await tab.Evaluate(() => {
        const links = [];
        links.push(
          { name: "ЛЕКАРСТВЕННЫЕ И ПРОФИЛАКТИЧЕСКИЕ СРЕДСТВА", link: "/catalog/lekarstvennye-i-profilakticheskie-sredstva/" },
        );
        return links;
      });

    console.log("Categories", categories);
    await sleep(4);
    for (const cat of categories) {
      console.log("Start parse category", cat.name);
      await tab.GoTo(`https://ozerki.ru/sankt-peterburg` + cat.link);
      await sleep(4);

      const subCategories = await tab.Evaluate(() => {
        const list = document.querySelectorAll<HTMLLabelElement>(
          "div.sc-295616af-0.CUgKW > a"
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
          const href = subCat.link;
          console.log(href);
          const link = "https://ozerki.ru" + href + "search/available/?page=" + page;
          await sleep(Math.random() * 23.24353);
          await tab.GoTo(link);
          if (page === 1) {
            await sleep(15);
          } else {
            await sleep(10);
          }

          const text = await tab.Evaluate(async () => document.body.innerHTML);
          const body = parse(text);

          if (!body) {
            tries++;
            continue;
          }
          await sleep(Math.random() * 22.23234);
          if(body.innerHTML.includes("Извините, по вашему запросу ничего не нашлось")) {break;}
          if(!body.querySelector("div.product-price__base-price")) {break};
          
          parser.ParseItems(text);

          if (page > 500 || body.querySelector("h2.sc-fc09f47e-1.cHUTgM")) {
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
