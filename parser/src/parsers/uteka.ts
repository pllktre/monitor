// import type { InitParserConfig } from "../components/parsing"
// import { exec_async } from "../components/local"
// import { sleep } from "../components/utils"
// import fs from "fs"

// const PATH = "../old"

// const config: InitParserConfig<UniqueParserConfig> = parser => ( {
// 	type: "unique",
// 	id: -1,

// 	func: async () => {
// 			await exec_async( `cd ${PATH}/Uteka/Uteka/bin/Debug/net6.0 && Uteka.exe` )
//       await exec_async( `cd ${PATH}/Uteka/Uteka/bin/Debug/net6.0 && uteka.bat` )
// 	}
// } )

// export default config
import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const CURRENT_CITY =
  "div.ui-popover.ui-popover_bottom-left.ui-popover_size_m > a > div.ui-text__content";
const CHANGE_CITY =
  "div.ui-popover.ui-popover_bottom-left.ui-popover_size_m > a";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 413,
  params: ["city"],
  itemSelector: "div.product-list__grid > div > div",
  itemParams: {
    name: ["div.product-preview__inner > a > span"],
    price: ["div.ui-price__content"],
    brand: [
      "div.product-preview__sub-title.ui-text.ui-text_size_m.ui-text_type_low",
    ],
    contextID: [
      "div.product-preview__inner > a",
      "href",
      [/\/product\/\S*-(\d*)\//g, 1],
    ],
  },
  func: async () => {
    console.log("uteka");
    const tab = await create_tab("https://uteka.ru/");

    if (!tab) return;

    parser.exit.Add(() => tab.Close());

    await tab.WaitSelector(".ui-text__content");

    const currentCity = await tab.GetHTML(CURRENT_CITY);

    console.log("Current city:", currentCity.trim());
    console.log("Target city:", parser.params.city);

    if (currentCity.trim() !== parser.params.city) {
      await tab.Click(CHANGE_CITY);
      await sleep(4);
      await tab.Evaluate(async (city) => {
        const cityList = document.querySelectorAll<HTMLAnchorElement>(
          "div.new-city-picker-popup-city-item > div.new-city-picker-popup-city-item__left > a"
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
    const url = await tab.GetUrl();
    await tab.GoTo(url + "catalog");

    await sleep(2);
    await tab.WaitSelector("div.ui-grid.catalog-page__categories > a");
    await sleep(6);

    const categories = await tab.Evaluate(() => {
      const list = document.querySelectorAll<HTMLLabelElement>(
        "div.ui-grid.catalog-page__categories > a"
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
      console.log("Start parse category", cat.name);
      await tab.GoTo(`https://uteka.ru/` + cat.link);
      await sleep(2);
      const subCategories = await tab.Evaluate(() => {
        const list = document.querySelectorAll<HTMLLabelElement>(
          "div.catalog-page-category-links.catalog-category-page__category-links > a"
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
        let page = 1;
        let tries = 0;

        while (true) {
          if (tries > 100) break;
          await sleep(10);
          const href = subCat.link;

          const link = "https://uteka.ru" + href + "?page=" + page;
          await tab.GoTo(link);
          await sleep(20);

          const text = await tab.Evaluate(async () => document.body.innerHTML);
          const body = parse(text);

          if (!body) {
            tries++;
            continue;
          }
          await sleep(Math.random() * 26.1934);
          const propetries = body.querySelectorAll(
            "div.product-list__grid > div > div"
          );

          if (body.innerHTML.includes("Страница не найдена")) {
            break;
          }

          if (propetries.length === 0) {
            continue;
          }
          for (let r of propetries) {
            const name = r.querySelector("div.product-preview__inner > a > span");
            let price = r.querySelector(
              "div.ui-price__content"
            );
            let brand = r.querySelector(
              "div.product-preview__sub-title.ui-text.ui-text_size_m.ui-text_type_low"
            );
            let contextID = String(
              r.querySelector("div.product-preview__inner > a").getAttribute("href")
            ).replace(/[^0-9]/g, "");

            if (price && name) {
              const item = {
                name: name.textContent.trim(),
                price: price.textContent.trim(),
                brand: brand.textContent.trim(),
                contextID: contextID,
              };
              console.log("Add item", item);
              parser.AddItem(item);
            }
          }
          page++;
        }
        await sleep(5);
      }
    }
  },
});

export default config;
