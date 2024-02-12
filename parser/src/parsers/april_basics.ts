import type { InitParserConfig } from "../components/parsing";
import type { BrowserTab } from "../extension/background";
import { create_tab } from "../extension/background";
import { sleep } from "../components/utils";

let brandTab: BrowserTab | undefined = undefined;
const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 411,
  cache: ["brands"],
  params: ["city", "region"],
  itemSelector: "#product-list > div.c-product-card",
  itemParams: {
    name: ["div > a.name > span"],
    price: ["div > div.prices > div:nth-child(3) > span:nth-child(2)"],
    contextID: ["div > a", "href", [/\/product\/(\d*)-/g, 1]],
  },
  itemFunc: async (item, ie) => {
    if (!item.price || !item.name || !brandTab || !item.contextID) return;

    const orderButton = ie.querySelector("div.card-info > div.footer-card > div.button > button > div");
    if (!orderButton) return;

    const isStock = orderButton.textContent;

    if (isStock === "Недоступно к заказу" || isStock === "Временно отсутствует") {
        return;
    }

    const cachedBrand = parser.GetCache("brands", item.contextID);
    item.price = item.price.replace("| ", "").replace("₽", "").trim();

    if (cachedBrand) {
      item.brand = cachedBrand;
      parser.AddItem(item);
      return;
    }
  },
  func: async () => {
    const tab = await create_tab("https://apteka-april.ru/", false, parser);
    brandTab = await create_tab(
      {
        url: "https://apteka-april.ru/",
        active: false,
      },
      false,
      parser
    );

    tab.SetTimeout(180);
    brandTab.SetTimeout(180);

    await tab.WaitSelector(
      "#app > section.c-types.container > div > div > button"
    );

    console.log("HEEEEY WAITED");

    const correctCity = await tab.Evaluate((city) => {
      const e = document.querySelector(
        "#app > section.c-types.container > div > div > button"
      );

      if (!e || !e.textContent) throw "Hasnt city button element";

      return e.textContent.trim() === city;
    }, parser.params.city);

    console.log("HEEEEY correctCity", correctCity);

    await sleep(10);

    if (!correctCity) {
      await tab.Click(
        "#app > section.c-types.container > div > div > button"
      );
      await sleep(4);
      await tab.WaitSelector(
        "#app > section.c-types.container > div > div > div > div > div.search > div > input"
      );
      await tab.Insert(
        "#app > section.c-types.container > div > div > div > div > div.search > div > input",
        parser.params.city
      );
      await sleep(10);
      await tab.Evaluate(
        ([city, region]) => {
          const cityList = document.querySelectorAll<HTMLButtonElement>(
            "#app > section.c-types.container > div > div > div > div > div.cities > div > span > div"
          );
          const regoinList = document.querySelectorAll<HTMLButtonElement>(
            "#app > section.c-types.container > div > div > div > div > div.cities > div > span > span"
          );
          console.log(regoinList);
          for (const e of cityList) {
            for (const b of regoinList) {
              if (e && e.textContent && e.textContent.replace(/,(\s|\S)*/g, "").trim() ===city) {
                if (b && b.textContent && b.textContent.replace(".", "").trim() === region) {
                  e.click();
                  break;
                }
              }
            }
          }
        },
        [parser.params.city, parser.params.region]
      );
    }

    console.log("Selected");

    await sleep(10);

    await tab.Click("#app > header > div > section > div.c-catalog > button");
    await sleep(2);
    await tab.Click(
      "#app > header > div > section > div.c-catalog > div > div > div.types.scrollbar > ul > li:nth-child(1) > a"
    );
    await tab.WaitSelector("#app > main > ul > li > ul > li > a");
    await sleep(6);

    const catCount = await tab.GetSelectorCount(
      "#app > main > ul > li > ul > li > a"
    );
    const startCat = Number(parser.GetStorage("category"));

    console.log("Start parse April", catCount, startCat);

    for (let i = startCat || 0; i < catCount; i++) {
      parser.AddStorage("category", i.toString());
      await tab.WaitSelector("#app > main > ul > li > ul > li > a");
      await sleep(10);
      console.log("Check cat");
      const hasCat = await tab.Evaluate((catIndex) => {
        const e = document.querySelectorAll<HTMLAnchorElement>(
          "#app > main > ul > li > ul > li > a"
        )[catIndex];

        if (!e) {
          return false;
        }

        e.click();

        return true;
      }, i);

      console.log("Has category", hasCat, catCount, i);

      if (!hasCat) break;

      let lastItemCount = 0;

      for (let l = 0; l < 100; l++) {
        await sleep(5);
        const needLoadMore = await tab.Evaluate(() => {
          const e = document.querySelector<HTMLButtonElement>(
            "#app > main > div > div.results > div.catalog > div > button"
          );

          return e && e.style.display !== "none";
        });

        console.log("Not needLoadMore");

        if (!needLoadMore) break;

        await tab.Click(
          "#app > main > div > div.results > div.catalog > div > button"
        );
        await sleep(10);

        const itemCount = await tab.GetSelectorCount(
          "#product-list > div.c-product-card"
        );

        console.log("Item counts", lastItemCount, itemCount);

        if (lastItemCount >= itemCount) break;

        lastItemCount = itemCount;
      }

      const html = await tab.GetHTML();

      console.log("QQQQQQQQQQQQQQQQQQ", lastItemCount);

      await parser.ParseItems(html);

      await tab.Click("#app > header > div > section > div.c-catalog > button");
      await sleep(2);
      await tab.Click(
        "#app > header > div > section > div.c-catalog > div > div > div.types.scrollbar > ul > li:nth-child(1) > a"
      );
    }
  },
});
export default config;
