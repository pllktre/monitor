import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const CURRENT_CITY =
  "div.icon-text.icon-text--region > .js-region--change.link.icon-text__control";
const CHANGE_CITY =
  "div.icon-text.icon-text--region > .js-region--change.link.icon-text__control";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 404,
  params: ["city"],
  itemSelector: "div.Product-item.js-product-cart-with-new-stock",
  itemParams: {
    name: ["div.Product-item__name > a"],
    price: ["span.Product-prices__price--bold"],
    brand: ["span.Product-item__definition > a"],
    contextID: ["div.link.Stock-info__available-link",'data-code'],
  },
  func: async () => {
    console.log("gorzdrav");
    const tab = await create_tab("https://gorzdrav.org/");

    if (!tab) return;

    parser.exit.Add(() => tab.Close());

    const currentCity = await tab.GetHTML(CURRENT_CITY);

    console.log("Current city:", currentCity.trim());
    console.log("Target city:", parser.params.city);

    if (currentCity.trim() !== parser.params.city) {
      await sleep(4);
      await tab.Click(CHANGE_CITY);
      await sleep(4);
      await tab.Evaluate(async (city) => {
        const regionList = document.querySelectorAll<HTMLAnchorElement>(
          "div.row > div:nth-child(1) > a"
        );

        console.log("REGION COUNT", regionList.length);

        for (let i = regionList.length - 1; i >= 0; i--) {
          console.log("Region iterate", i, regionList[i]);

          const re = regionList[i];
          re.dispatchEvent(new Event("mouseover", { bubbles: true }));

          await new Promise((res) => setTimeout(res, 4000));

          const cityList = document.querySelectorAll<HTMLAnchorElement>(
            "div.col-sm-9.col-xs-12.text-col-4.js-base-stores__cities-container > a"
          );

          for (const ce of cityList) {
            if (ce.textContent && ce.textContent.trim() === city) {
              ce.click();

              return;
            }
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
        { name: "Препараты", link: "/category/preparaty/" },
        { name: "Болезни", link: "/category/bolezni/" },
        { name: "Органы и системы", link: "/category/organy-i-sistemy/" },
        { name: "Травы и бальзамы", link: "/category/travy-i-balzamy/" },
        { name: "Витамины, минералы, БАД", link: "/category/vitaminy-mineraly-bad/"},
      );
      return links;
    });

    console.log("Categories", categories);
    await sleep(4);
    for (const cat of categories) {
      console.log("Start parse category", cat.name);
      await tab.GoTo(`https://gorzdrav.org` + cat.link);
      await sleep(2);
      await tab.WaitSelector(
        "div.c-facets__container.c-facets__container--top.c-facets__container--bottom.-easy-links.js-facet.js-facets-container"
      );
      const subCategories = await tab.Evaluate(() => {
        const list = document.querySelectorAll<HTMLLabelElement>(
          "div.c-facets__container.c-facets__container--top.c-facets__container--bottom.-easy-links.js-facet.js-facets-container > div.item.js-facet-item > a"
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
      console.log("SubCategories", subCategories);
      await sleep(4);
      for (const subCat of subCategories) {
        console.log("Start parse Subcategory", subCat.name, subCat.link);
        let page = 1;
        let tries = 0;

        while (true) {
          if (tries > 100) break;
        const href = subCat.link;
        //const link = "https://gorzdrav.org" + href + "?page=" + page;
        const link = "https://gorzdrav.org" + href;
        await tab.GoTo(link);
        await sleep(Math.random()*21.4343);
        // const text = await tab.Evaluate(async () => document.body.innerHTML);
        // const body = parse(text);

        //   if (!body) {
        //     tries++;
        //     continue;
        //   }
        //   parser.ParseItems(text);
        //   if ( page > 500 || !body.querySelector("a.b-pagination__item.js-pager-next > .b-icn--next")) {
        //     break;
        //   }
        //   page++;
        const texts = await tab.Evaluate(async () => document.body.innerHTML);
        const body = parse(texts);
        await sleep(5);
        let elements = body.querySelector("div.b-pagination > .b-pagination__item:nth-last-child(2)");
        if(!elements) {break;}

        let page = Number(elements.innerHTML);
        console.log(page);
        for(let i = 1; i < page; i++) {
          const text = await tab.Evaluate(async () => document.body.innerHTML);
          await sleep(15);
          parser.ParseItems(text);
          await tab.Click("div.b-pagination > .b-pagination__item.js-pager-next:nth-last-child(1)");
          await sleep(15);
        }
        break;
    }
        await sleep(Math.random()*16.345);
      }
    }
  },
});

export default config;
