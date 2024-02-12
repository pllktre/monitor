import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const CURRENT_CITY =
  "div.h-top > div.container-fluid > div > div.d-flex.align-items-center.justify-content-between.flex-static > a > div";
const CHANGE_CITY =
  "div.h-top > div.container-fluid > div > div.d-flex.align-items-center.justify-content-between.flex-static > a";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 403,
  params: ["city"],
  itemSelector:
    "div.entity-list-block__content-product > div.catalog-product-list > div.catalog-product-list__row > div.catalog-product-list__col",
  itemParams: {
    name: ["div.product-card__info-wrapper > a > div > span > span"],
    price: ["div.product-card__price > span:nth-child(1)"],
    brand: ["div.product-preview__sub-title"],
  },
  func: async () => {
    console.log("24farmacia");
    const tab = await create_tab("https://24farmacia.ru/apteki/");

    if (!tab) return;

    parser.exit.Add(() => tab.Close());
    await sleep(20);
    const url = await tab.GetUrl();
    await tab.GoTo(url + "catalog");

    await sleep(10);
    await tab.WaitSelector("div.catalog-section-page__second-level > a");
    await sleep(6);

    const categories = await tab.Evaluate(() => {
      const list = document.querySelectorAll<HTMLLabelElement>(
        "div.catalog-section-page__second-level > a"
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
      while (true) {
        const href = cat.link;
        const link = "https://24farmacia.ru" + href;
        await tab.GoTo(link);
        await sleep(10);
        await tab.GoTo(link);
        await sleep(3);
        while (true) {
          const btn1 = await tab.Evaluate(
            () =>
              !document.querySelector(
                ".nuxt-link-active.entity-list-block__content-fetch-button"
              )
          );
          if (btn1) {
            await sleep(5);
            await tab.Click(
              ".nuxt-link-active.entity-list-block__content-fetch-button"
            );
          } else {
            break;
          }
        }
        await sleep(3);
        const text = await tab.Evaluate(async () => document.body.innerHTML);
        parser.ParseItems(text);
        await sleep(4);
        break;
      }
    }

    await sleep(5);
  },
});

export default config;
