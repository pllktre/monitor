import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";

const CURRENT_CITY =
  "#__layout > div > header > div.layout-top-bar.text_size_small.text_weight_medium.layout-default__topbar.desktop-content > div > div.layout-city.text.layout-top-bar__city > a > span";
const CONFRIM_CITY =
  "#__layout > div > div.layout-city-confirm-dialog > div.layout-city-confirm-dialog__controls > button";
const CHANGE_CITY =
  "#__layout > div > header > div.layout-top-bar.text_size_small.text_weight_medium.layout-default__topbar.desktop-content > div > div.layout-city.text.layout-top-bar__city > a";
const INPUT_CITY =
  "#__layout > div > div.ui-overlay.ui-modal-overlay.layout-city-modal.desktop-content.ui-modal-overlay_fullscreen-mobile > div > div > div.ui-modal__content > div > div.layout-city-modal__inner > div.layout-city-modal__form > div.ui-input.layout-city-modal__search.ui-input_theme_default.ui-input_size_default.ui-input_icon_prefix > input";

declare global {
  var __NUXT__: any;
}

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 449,
  params: ["city"],
  func: async () => {
    parser.Log("apteka ot sklada", false, parser);
    const tab = await create_tab(
      "https://apteka-ot-sklada.ru/",
      undefined,
      parser
    );

    await tab.Evaluate(() => {
      const e = document.querySelector<HTMLAnchorElement>(
        "#__layout > div > div.layout-city-confirm-dialog > div.layout-city-confirm-dialog__controls > button"
      );

      if (e) {
        e.click();
      }
    });

    const currentCity = await tab.GetHTML(CURRENT_CITY);

    parser.Log("Current city:", currentCity.trim());
    parser.Log("Target city:", parser.params.city);

    if (currentCity.trim() !== parser.params.city) {
      await tab.Click(CHANGE_CITY);
      await sleep(4);
      tab.SetTimeout(180);
      await tab.Evaluate(async (city) => {
        const regionList = document.querySelectorAll<HTMLAnchorElement>(
          "#__layout > div > div.ui-overlay.ui-modal-overlay.layout-city-modal.desktop-content.ui-modal-overlay_fullscreen-mobile > div > div > div.ui-modal__content > div > div.layout-city-modal__sidebar > div > ul > li > div"
        );

        console.log("REGION COUNT", regionList.length);

        for (let i = regionList.length - 1; i >= 0; i--) {
          console.log("Region iterate", i, regionList[i]);

          const re = regionList[i];
          re.click();

          await new Promise((res) => setTimeout(res, 4000));

          const cityList = document.querySelectorAll<HTMLAnchorElement>(
            "div.layout-city-modal__cities-area.text > ul > li > a"
          );

          for (const ce of cityList) {
            if (ce.textContent && ce.textContent.trim() === city) {
              ce.click();

              return;
            }
          }
        }
      }, parser.params.city);
      tab.SetTimeout(60);
    }

    await sleep(10);

    parser.Log("HEh");

    const categories: any[] = await tab.Evaluate(async () => {
      let categories: undefined | any[] = undefined;

      window.addEventListener("message", (e) => {
        console.log("Categories content", e.data);
        categories = e.data;
      });

      const script = document.createElement("script");
      script.textContent = `
				console.log( "Categories web page", window.__NUXT__.state.catalog.categories );
				window.postMessage( window.__NUXT__.state.catalog.categories, "*" );
			`;
      script.onload = function () {
        (this as HTMLScriptElement).remove();
      };
      (document.head || document.documentElement).appendChild(script);

      while (true) {
        if (categories) {
          return categories;
        }

        await new Promise((res) => setTimeout(res, 1000));
      }
    });

    parser.Log("URAAAA", categories);

    for (const cat of categories) {
      parser.Log("Category:", cat);

      for (const subcat of cat.children || []) {
        if (subcat.children === null) {
          parser.Log("Sub category:", subcat);

          let i = 0;
          let totalCount = 0;

          while (true) {
            if (i > totalCount) {
              break;
            }

            const url = `https://apteka-ot-sklada.ru/api/catalog/search?sort=price_asc&slug=${encodeURI(
              subcat.slug
            )}${i < 1 ? "" : "&offset=" + i}&limit=12`;
            const data = await tab.Evaluate(async (url) => {
              const res = await fetch(url);
              const data = await res.json();

              return data;
            }, url);

            if (!data || !data.goods || data.goods.length < 1) {
              break;
            }

            totalCount = data.totalCount;

            for (const good of data.goods) {
              if (!good.cost || !good.name || !good.producer || !good.id) continue;

              parser.Log("GOOD", good);
              if (good.startPrice === null) {
                parser.AddItem({
                  price: good.cost.toString(),
                  contextID: good.id,
                  name: good.name,
                  brand: good.producer,
                });
              } else {
                parser.AddItem({
                  price: good.startPrice.toString(),
                  contextID: good.id,
                  name: good.name,
                  brand: good.producer,
                });
              }
            }

            i += 12;

            await sleep(2);
          }
        } else {
          for (const SubSubcat of subcat.children || []) {
            parser.Log("Sub category:", SubSubcat);

            let i = 0;
            let totalCount = 0;

            while (true) {
              if (i > totalCount) {
                break;
              }

              const url = `https://apteka-ot-sklada.ru/api/catalog/search?sort=price_asc&slug=${encodeURI(
                SubSubcat.slug
              )}${i < 1 ? "" : "&offset=" + i}&limit=12`;
              const data = await tab.Evaluate(async (url) => {
                const res = await fetch(url);
                const data = await res.json();

                return data;
              }, url);

              if (!data || !data.goods || data.goods.length < 1) {
                break;
              }

              totalCount = data.totalCount;

              for (const good of data.goods) {
                if (!good.cost || !good.name || !good.producer || !good.id)
                  continue;

                parser.Log("GOOD", good);

                if (good.startPrice === null) {
                    parser.AddItem({
                      price: good.cost.toString(),
                      contextID: good.id,
                      name: good.name,
                      brand: good.producer,
                    });
                  } else {
                    parser.AddItem({
                      price: good.startPrice.toString(),
                      contextID: good.id,
                      name: good.name,
                      brand: good.producer,
                    });
                  }
              }

              i += 12;

              await sleep(2);
            }
          }
        }
      }
    }
  },
});

export default config;
