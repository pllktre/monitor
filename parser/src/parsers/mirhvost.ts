import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const CURRENT_CITY =
  "div.bx-regions > a.reg-modal-btn";
const CHANGE_CITY =
  "div.bx-regions > a.reg-modal-btn";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 453,
  params: ["city"],
  itemSelector: "ul.productList > li",
  itemParams: {
    name: ["div.wrap > a.name"],
    price: ["div.price-wrapper > span.price"],
  },
  itemFunc: async (item, ie) => {
	if (!item.price) return;
    const orderButton = ie.querySelector("a.notifyMe");
    if(orderButton) {
    const isOnOrder = orderButton.textContent.includes("Уведомить");
    if(isOnOrder) {
        return;
    }
} else {
    const price = item.price;
    const prices = price.substring(0, price.indexOf("P"));
    item.price = prices.replace("P\n-","").trim();
    parser.AddItem(item);
    return;
}
  },
  func: async () => {
    console.log("moizver");
    const tab = await create_tab("https://mirhvost.ru");

    if (!tab) return;

    parser.exit.Add(() => tab.Close());

    const currentCity = await tab.GetHTML(CURRENT_CITY);

    console.log("Current city:", currentCity.trim());
    console.log("Target city:", parser.params.city);

    if (currentCity.trim() !== parser.params.city) {
      await tab.Click(CHANGE_CITY);
      await sleep(4);
      await tab.Evaluate(async (city) => {
        const cityList = document.querySelectorAll<HTMLAnchorElement>(
          "div.modal-body > div > div > a"
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
    await tab.WaitSelector("div.catalogSection");
    await sleep(6);

    const categories = await tab.Evaluate(() => {
      const list = document.querySelectorAll<HTMLLabelElement>(
        "div.catalogSection > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td > a"
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
      let page = 1;
      let tries = 0;

      while (true) {
        if (tries > 100) break;

        const href = cat.link;
        const link = url.substring(0, url.length - 1) + href + "?PAGEN_1=" + page + "&SIZEN_1=30";
        await sleep(4);
        await tab.GoTo(link);
        await sleep(10);

        const text = await tab.Evaluate(async () => document.body.innerHTML);
        const body = parse(text);

        if (!body) {
          tries++;
          continue;
        }

        parser.ParseItems(text);
        await sleep(4);
        if (!body.innerHTML.includes("Следующая страница")){
          break;
        }
        page++;
      }

      await sleep(5);
    }
  },
});

export default config;