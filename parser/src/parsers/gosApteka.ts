import { InitParserConfig, Parser, RequestsParsing} from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const CURRENT_CITY = 
"div.header__part > div.header__part-data > div.cnt > div.header__grid > div.header__grid-item > div.city-select > a > div.city-select__value-inner >  div";

const CHANGE_CITY =
"div.header__part > div.header__part-data > div.cnt > div.header__grid > div.header__grid-item > div.city-select > a";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
    type: "unique",
    id: 437,
    params: ["city"],
    itemSelector: "div.products__grid-item", // !!!!!!
    itemParams: {
      name: ["div.product-mini__title > a"],
      price: ["div.product-mini__price-item"],
      brand: ["div.product-mini__detail"],
    },
    func: async () => {
        console.log("gosApteka");
        const tab = await create_tab("https://gosapteka18.ru/");

        if(!tab) return;

        parser.exit.Add(() => tab.Close());

        const currentCity = await tab.GetHTML(CURRENT_CITY);
        console.log("Current city:", currentCity.split(".")[1].trim());
        console.log("Target city:", parser.params.city);

        if (currentCity.split(".")[1].trim() !== parser.params.city) {
            await tab.Click(CHANGE_CITY);
            await sleep(4);
            await tab.Evaluate(async (city) => {
              const cityList = document.querySelectorAll<HTMLAnchorElement>(
                "div.city-select-popup > div.city-select-popup__data > div > div.city-select-popup__city > a"
              );
              for (const ce of cityList) {
                if (ce.textContent && ce.textContent.split(".")[1].trim()  === city) {
                  ce.click();
                  return;
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
              { name: "Лекарства и БАД", link: "/catalog/lekarstva_i_bad/" },
            );
            return links;
          });

          console.log("Categories", categories);
          await sleep(4);
          for (const cat of categories) {      // Для каждой категории (одна в данном случае) выполнить следуюущий код
            console.log("Start parse category", cat.name);
            await tab.GoTo(`https://gosapteka18.ru` + cat.link);
            await sleep(2);
            await tab.WaitSelector(
              "div.menu-catalog__list > div.menu-catalog__item > div.menu-catalog__sub-menu > div.menu-catalog__sub-list > div.menu-catalog__sub-item > div.menu-catalog__sub2-menu > div > div"
            );
            
            const subCategories = await tab.Evaluate(() => {
              const list = document.querySelectorAll<HTMLLabelElement>(
                "div.menu-catalog__sub-menu-holder > div > div > div.menu-catalog__sub-item > div:nth-child(1) > a"  // Собрать все ссылки подкатегорий и сохранить в массив list
              );
              const links = [];

              for (const e of list) { // Для каждой подкатегории
                if (e.textContent) { 
                  links.push({
                    name: e.textContent.trim(), // Убрать пробелы в начале и конце
                    link: e.getAttribute("href"), // Получить содержимое аттрибута href
                  });
                }
              }
              return links; //Вернуть готовый массив ссылок
            }); 

            console.log("subCategories", subCategories);

            await sleep(4);
            for (const subCat of subCategories) {
              console.log("Start parse Subcategory", subCat.name, subCat.link); // /catalog/akusherstvo_i_ginekologiya/
              await tab.GoTo(`https://gosapteka18.ru` + subCat.link);
              let page = 1;
              let tries = 0;      
              while (true) {
                await sleep(5);
                if (tries > 100) break;
                const href = subCat.link;
                const link = "https://gosapteka18.ru" + href + "?PAGEN_1=" + page;
                await tab.GoTo(link);
                await sleep(5);                        
                const text = await tab.Evaluate(async () => document.body.innerHTML);

                parser.ParseItems(text);
                  if(page > 30 )
                  {
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


