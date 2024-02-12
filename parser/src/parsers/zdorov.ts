import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const CURRENT_CITY =
  "#__next > div:nth-child(2) > div > div > div:nth-child(1) > div:nth-child(1) > a:nth-child(1)";
const CHANGE_CITY =
  "#__next > div:nth-child(2) > div > div > div:nth-child(1) > div:nth-child(1) > a:nth-child(1)";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 436,
  params: ["city"],
  itemSelector: "div.uistyled__GoodList-sc-3j31ig-2 > div",
  itemParams: {
    name: ["a.CatalogGoodItemstyled__FullTitle-sc-1wfmxei-4"],
    price: ["span.PriceBlockstyled__PriceNumberActualBold-sc-1qxl8i0-18"],
    brand: ["div.CatalogGoodItemstyled__TextInfoDescription-sc-1wfmxei-9"],
  },
  func: async () => {
    console.log("zdorov");
    const tab = await create_tab("https://zdorov.ru/");

    if (!tab) return;

    parser.exit.Add(() => tab.Close());

    await sleep(10);

    const currentCity = await tab.GetHTML(CURRENT_CITY);

    const regex = /( |<([^>]+)>)/gi;
    var currentCityRegex = currentCity.replace(regex, "");
    console.log("Current city:", currentCityRegex.trim());
    console.log("Target city:", parser.params.city);

    if (currentCityRegex.trim() !== parser.params.city) {
      await tab.Click(CHANGE_CITY);
      await sleep(4);
      await tab.Evaluate(async (city) => {
        const cityList = document.querySelectorAll<HTMLAnchorElement>(
          "#__next > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(3) > div > div > div > div > div > div"
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
    await sleep(10);
    await tab.Click("#__next > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > div > button");

    const categories = await tab.Evaluate(async () => {
      const categoryList = document.querySelectorAll<HTMLAnchorElement>(
        "#__next > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(3) > div > div:nth-child(1) > span"
      );

      console.log("Category", categoryList);
      const links = [];
      for (let i = 0; i < categoryList.length; i++) {
       // console.log("categoryList iterate", i, categoryList[i]);
          const re = categoryList[i];
          re.dispatchEvent(new Event("click", { bubbles: true }));

          await new Promise((res) => setTimeout(res, 2000));
          const subCategoryList = document.querySelectorAll<HTMLAnchorElement>(
            "#__next > div:nth-child(2) > div > div > div:nth-child(2) > div:nth-child(3) > div > div:nth-child(2) > a"
          );
       //   console.log(subCategoryList);

          for (const e of subCategoryList) {
            if (e.textContent) {
              links.push({
                name: e.textContent.trim(),
                link: e.getAttribute("href"),
              });
            }
        }
      }
      return links;
    });

    console.log("Categories", categories);
    await sleep(4);
    for (const cat of categories) {
      console.log("Start parse category", cat.name);
      let tries = 0;

      while (true) {
        if (tries > 100) break;

        const href = cat.link;
        const link = "https://zdorov.ru" + href;
        await sleep(4);
        await tab.GoTo(link);
        await sleep(10);

        const texts = await tab.Evaluate(async () => document.body.innerHTML);
        const body = parse(texts);
        await sleep(5);
        let elements = body.querySelector("div.Paginatorstyled__Container-sc-1163mbb-0 > .Buttonstyled__ButtonElement-sc-1yi760-0:nth-last-child(2)");
        if(!elements) {break;}
        let page = Number(elements.innerHTML);
        console.log(page);
        for(let i = 0; i < page; i++) {
          const text = await tab.Evaluate(async () => document.body.innerHTML);
          await sleep(10);
          parser.ParseItems(text);
          await tab.Click("div.Paginatorstyled__Container-sc-1163mbb-0 > .Buttonstyled__ButtonElement-sc-1yi760-0:nth-last-child(1)");
        }
        break;

      }

      await sleep(5);
    }
  },
});

export default config;
