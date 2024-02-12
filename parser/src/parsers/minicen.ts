import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const CURRENT_CITY = "span.fsField-NameRegion";
const APTEKA_CITY = "span.fsField-AddressDostShort";
const CHANGE_CITY = "li.header-tradepoint-unknow > a.link";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 444,
  params: ["city","region"],
  itemSelector: "#search-block-tovar > div",
  itemParams: {
    name: ["span.tp-tovarName"],
    price: [".tp-addToCart.tp-addToCart1 > div > div.tp-cost"],
    brand: ["li.tp-tovarMaker"],
  },
  itemFunc: async (item, ie) => {
    let brand = ie.querySelector("li.tp-tovarMaker").innerText;
    item.brand = brand.replace("Производитель:", "").trim();
    parser.AddItem(item);
	return;
  },
  func: async () => {
    console.log("minicen");
    const tab = await create_tab("https://minicen.ru");

    if (!tab) return;

    parser.exit.Add(() => tab.Close());

    await sleep(20);
    const currentCity = await tab.GetHTML(CURRENT_CITY);
    const aptekaCity = await tab.GetHTML(APTEKA_CITY);

    console.log("Current city:", currentCity.trim());
    console.log("Target city:", parser.params.city);
    console.log("Apteka city:", aptekaCity.trim());

    if (
      currentCity.trim() !== parser.params.city ||
      aptekaCity.trim() !== "ул. Ленина, 128А"
    ) {
      await tab.Click(CHANGE_CITY);
      await sleep(4);
      await tab.Evaluate(async (city) => {
        const cityList =
          document.querySelectorAll<HTMLAnchorElement>("div.city-list > a");
        for (const ce of cityList) {
          if (ce.textContent && ce.textContent.trim() === city) {
            ce.click();
            return;
          }
        }
      }, parser.params.city);
      await sleep(5);
      if(parser.params.city==="Биробиджан") {
        await tab.Click("div.list-group.fs-frame > a:nth-child(3)");
      }
      else if (parser.params.city==="Владивосток" && parser.params.region==="пр-т Океанский, 52а"){
      await tab.Click("div.list-group.fs-frame > a:nth-child(3)");
      }
      else if (parser.params.city==="Владивосток" && parser.params.region==="ул. Семеновская, 15"){
        await tab.Click("div.list-group.fs-frame > a:nth-child(15)");
        }
      else {
        await tab.Click("div.list-group.fs-frame > a:nth-child(4)");
        }
    } else {
      console.log("It's ok");
    }
    await sleep(4);
    await tab.GoTo("https://minicen.ru/#!Catalog");

    await sleep(2);
    await tab.WaitSelector("div.fs-catalog > div > a");
    await sleep(6);

    const categories = await tab.Evaluate(() => {
      const list = document.querySelectorAll<HTMLLabelElement>(
        "div.panel-body > div.fs-catalog > div > a"
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
      links.splice(0, 1);
      links.splice(2, 9);
      return links;
    });

    console.log("Categories", categories);
    await sleep(4);
    for (const cat of categories) {
      console.log("Start parse category", cat.name);
      await tab.GoTo(`https://minicen.ru/` + cat.link);
      await sleep(2);
      const subCategories = await tab.Evaluate(() => {
        const list = document.querySelectorAll<HTMLLabelElement>(
          "a.catalog-link-main"
        );
        const links = [];
        
        links.push(
          { name: "Товар", link: "#Search/accu-chek/2//5/" },
          { name: "Товар", link: "#Search/one%20touch/2//5/" },
          { name: "Товар", link: "#Search/актрапид/2//5/" },
          { name: "Товар", link: "#Search/бонвива/2//5/" },
          { name: "Товар", link: "#Search/корега/2//5/" },
          { name: "Товар", link: "#Search/коронал/2//5/" },
          { name: "Товар", link: "#Search/люксфен/2//5/" },
          { name: "Товар", link: "#Search/мемантинол/2//5/" },
          { name: "Товар", link: "#Search/тевастор/2//5/" },
          { name: "Товар", link: "#Search/форадил/2//5/" },
          );

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
            const href = subCat.link;
            await sleep(6);
            const link = "https://minicen.ru/" + href + "/" + page + "/1//0///";
            await sleep(10);
            await tab.GoTo(link);
            await sleep(10);
    
            const text = await tab.Evaluate(async () => document.body.innerHTML);
            const body = parse(text);
            if (!body) {
              tries++;
              continue;
            }
            parser.ParseItems(text);

          if (page > 100 || !body.querySelector("#search-block-tovar > div > div.tovarPropertyBig")) {
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
