import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const CURRENT_CITY = "div.choosing-city > button";
const CHANGE_CITY = "div.city-popup__btn-container > button:nth-child(1)";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 417,
  params: ["city"],
  itemSelector: "div.app-filter__main > div:nth-child(2) > div",
  itemParams: {
    name: ["a.product-card-block__title > span"],
    price: ["div.product-price__current-price > span"],
    contextID: ["a", "href", [/\/catalog\/(\d*)/g, 1]],
  },
  func: async () => {
    console.log("maksavit");
    const tab = await create_tab("https://maksavit.ru/");

    if (!tab) return;

    parser.exit.Add(() => tab.Close());

    const currentCity = await tab.GetHTML(CURRENT_CITY);

    const regex = /( |<([^>]+)>)/gi;
    var currentCityRegex = currentCity.replace(regex, " ");
    console.log("Current city:", currentCityRegex.trim());
    console.log("Target city:", parser.params.city);

    if (currentCityRegex.trim() !== parser.params.city) {
      await tab.Click(CURRENT_CITY);
      await sleep(4);
      await tab.Click(CHANGE_CITY);
      await sleep(6);
      await tab.Evaluate(async (city) => {
        const cityList = document.querySelectorAll<HTMLAnchorElement>(
          ".h-72.overflow-y-auto.scrollbar-custom > li > button"
        );
        for (const ce of cityList) {
          console.log(ce);
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
    await tab.GoTo(url + "catalog/");

    await sleep(2);

    await tab.WaitSelector(
      "main.mb-10 > div > ul > li.accordion__item > div"
    );
    await sleep(6);

    const categories = await tab.Evaluate(() => {
      const list = document.querySelectorAll<HTMLLabelElement>(
        "main.mb-10 > div > ul > li.accordion__item > div > a"
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
      await tab.GoTo(`https://maksavit.ru` + cat.link);
      await sleep(4);

      const subCategories = await tab.Evaluate(() => {
        const list = document.querySelectorAll<HTMLLabelElement>(
          "div.swiper-wrapper > div > a.sub-category-slider__slide"
        );
        const links = [];

        for (const e of list) {
          if (e.textContent) {
            links.push({
              name: e.textContent.trim(),
              link: String(e.getAttribute("href")).replace("/vladimir","").replace("/kursk","").replace("/murmansk",""),
            });
          }
        }
        return links;
      });
      console.log("Categories", subCategories);
      await sleep(4);

    for (const Subcat of subCategories) {
      console.log("Start parse category", Subcat.name);
      let page = 1;
      let href = "";
      if(parser.params.city=="Владимир" || parser.params.city=="Калуга") {
       href = String(cat.link).replace("/vladimir","").replace("/kaluga","").replace("/murmansk","");
      }
      if(parser.params.city=="Мурманск") {
        href = String(Subcat.link).replace("/vladimir","").replace("/kaluga","").replace("/murmansk","");
      }
      if(parser.params.city=="Петрозаводск") {
        href = String(Subcat.link).replace("/petrozavodsk","");
      }

      let locationCode = " ";
      switch(parser.params.city) {
        case "Владимир":
          locationCode = "0000312126"
          break;
          case "Мурманск":
            locationCode = "0000352775"
            break;
          case "Калуга":
            locationCode = "0000147475"
            break;
          case "Петрозаводск":
            locationCode = "0000330194"
            break;
      }
      console.log(locationCode);

      while (true) {
        console.log(href);
        const url = `https://maksavit.ru/api${href}?analogsSummary=1&hideFilter=1&locationAvailableSorting=100&page=${page}`;
        console.log(url);
        const data = await tab.Evaluate(async ([url, locationCode]) => {
          const res = await fetch(url, {
            headers: {
              'Location-code': locationCode
            }
          });
          const data = await res.json();
          return data;
        }, [url, locationCode]);

        console.log(data.products);
        if (!data || !data.products || data.products.length < 1) {
          break;
        }
        for (const good of data.products) {
          if (!good.price || !good.name || !good.urlId) break;
          parser.Log("GOOD", good);

          parser.AddItem({
            price: good.price.toString(),
            brand: good.brandName,
            name: good.name,
            contextID: good.urlId.toString()
          });
        }
        sleep(20);
        page++;
        if(page>500) {
          break;
        }
      }
      await sleep(2);
    }
  }
  },
});

export default config;
