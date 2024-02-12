import type { InitParserConfig } from "../components/parsing";
import { nothing, sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";
import type { BrowserTab } from "../extension/background";

const CURRENT_CITY = "div.SiteHeaderMain__city > button.HeaderCity > span";
const CHANGE_CITY = "div.SiteHeaderMain__city > button.HeaderCity";

const config: InitParserConfig<UniqueParserConfig> = (parser) => {
  return {
    type: "unique",
    id: 422,
    params: ["city"],
    itemSelector:
      "div.ViewProductPage-product > div.ViewProductPage__info-wrapper > div.ViewProductPage__variants > div.ProductVariants.resize-observed > div.ProductVariants__level > div",
    itemParams: {
      name: ["a.variantButton__button", "aria-label"],
      price: ["a.variantButton__button > meta:nth-child(3)"],
    },
    func: async () => {
      console.log("apteka.ru");
      const tab = await create_tab("https://apteka.ru/");

      if (!tab) return;

      parser.exit.Add(() => tab.Close());

      const currentCity = await tab.GetHTML(CURRENT_CITY);

      await sleep(4);
      console.log("Current city:", currentCity.trim());
      console.log("Target city:", parser.params.city);

      await sleep(2);
      if (currentCity.trim() !== parser.params.city) {
        await tab.Click(CHANGE_CITY);
        await sleep(2);
        await tab.Evaluate(async (city) => {
          const input = <HTMLInputElement>(
            document.querySelector("div.TownSelector__input > input")
          );
          input.value = city;
          input.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true }));
          input.dispatchEvent(new KeyboardEvent("keypress", { bubbles: true }));
          input.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
          input.dispatchEvent(new Event("focus", { bubbles: true }));
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }, parser.params.city);
        await sleep(6);
        await tab.Evaluate(async (city) => {
          const cityList = document.querySelectorAll<HTMLAnchorElement>(
            ".TownSelector__options > li.TownSelector-option > div.CityLabel > strong"
          );
          for (const ce of cityList) {
            if (
              ce.textContent &&
              ce.textContent.replace(/[\s.,%]/g, "") === city
            ) {
              ce.click();
              return;
            }
          }
        }, parser.params.city);
      } else {
        console.log("It's ok");
      }
      await sleep(4);
      await tab.WaitSelector(
        "div.SidebarCatalog__list > div.SidebarCategoriesList > ul > li"
      );
      await sleep(6);

      const categories = await tab.Evaluate(async () => {
        const list = document.querySelectorAll<HTMLLabelElement>(
          "div.SidebarCatalog__list > div.SidebarCategoriesList > ul > li > a"
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
        const button = document.querySelector<HTMLAnchorElement>(
          "div.SidebarCatalog__tabs > button:nth-child(2)"
        );
        if (button) {
          button.click();
        }
        await new Promise((res) => setTimeout(res, 180));
        const list2 = document.querySelectorAll<HTMLLabelElement>(
          "div.SidebarCatalog__list > div.SidebarCategoriesList > ul > li > a"
        );
        console.log(list2);
        for (const a of list2) {
          console.log(a);
          if (a.textContent) {
            links.push({
              name: a.textContent.trim(),
              link: a.getAttribute("href"),
            });
          }
        }
        return links;
      });

      console.log("Categories", categories);
      await sleep(4);
      for (const cat of categories) {
        console.log("Start parse category", cat.name);
        await tab.GoTo(`https://apteka.ru` + cat.link);
        await sleep(2);
        await tab.WaitSelector("div.SidebarCategoriesList");
        const subCategories = await tab.Evaluate(() => {
          const list = document.querySelectorAll<HTMLLabelElement>(
            "div.SidebarCatalog__list > div.SidebarCategoriesList > ul > li > a"
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
          console.log("Start parse category", subCat.name);
          let page = 1;
          let tries = 0;
          while (true) {
            const href = subCat.link;
            const link = "https://apteka.ru" + href + "?withprice=1&page=" + page;
            await sleep(4);
            await tab.GoTo(link);
            await sleep(6);
            const product = await tab.Evaluate(() => {
              const list_pr = document.querySelectorAll<HTMLAnchorElement>(
                ".catalog-card__photos"
              );
              const links = [];

              for (const e of list_pr) {
                  console.log(e);
                  links.push({
                    link: e.getAttribute("href"),
                  });
              }
              return links;
            });
            console.log("Products", product);
            await sleep(4);
            for (const prod of product) {
              await tab.GoTo("https://apteka.ru/" + prod.link);
              await sleep(4);
              const text = await tab.Evaluate(
                async () => document.body.innerHTML
              );
              const body = parse(text);
              if (!body) {
                tries++;
                continue;
              }
              // parser.ParseItems(text);

              const propetries = body.querySelectorAll(
                "div.ViewProductPage-product > div.ViewProductPage__info-wrapper > div.ViewProductPage__variants > div.ProductVariants.resize-observed > div.ProductVariants__level > div"
              );
              for (let r of propetries) {               
                const name = r.querySelector("a.variantButton__link").getAttribute("aria-label");

                const price = r.querySelector("a.variantButton__link > meta:nth-child(3)").getAttribute("itemprop");

                if (price === "price") {
                  const price = r.querySelector("a.variantButton__link > meta:nth-child(3)").getAttribute("content");

                  const rv = body.querySelector("div.ProductDescription > div.ProductDescription-content > div:nth-child(1) > dl > div:nth-child(1) > dt");
                  if (rv.textContent === "Действующие вещества") {
                    const rvb = body.querySelector("div.ProductDescription > div.ProductDescription-content > div:nth-child(1) > dl > div:nth-child(4) > dd > a");
                    const item = {
                      name: name,
                      price: price,
                      brand: rvb.textContent,
                    };
                    console.log("Add item", item);
                    parser.AddItem(item);
                  } else {
                    const price = r.querySelector("a.variantButton__link > meta:nth-child(3)").getAttribute("content");
                    const rvb = body.querySelector("div.ProductDescription > div.ProductDescription-content > div:nth-child(1) > dl > div:nth-child(3) > dd > a");
                    const item = {
                      name: name,
                      price: price,
                      brand: rvb.textContent,
                    };
                    console.log("Add item", item);
                    parser.AddItem(item);
                  }
                } else {
                  const item = {
                    name: name
                  };
                    console.log("Add item", item);
                    parser.AddItem(item);
                }
              }
              await sleep (10);
            }
            if (product.length === 0) {
              break;
            }
            page++;
          }

          await sleep(5);
        }
      }
      await sleep(10);
    },
  };
};

export default config;
