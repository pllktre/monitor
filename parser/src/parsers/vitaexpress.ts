import type { InitParserConfig } from "../components/parsing";
import { parse } from "node-html-parser";
import { create_tab } from "../extension/background";
import { sleep } from "../components/utils";
const CURRENT_CITY = "#selectCity";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 435,
  params: ["city"],
  itemSelector: "#catalogRoot > div.product-hor",
  itemParams: {
    name: ["div.horizontalCard__info > div.relative > a"],
    price: [".priceSVG > span"],
    contextID: [undefined, "data-id"],
  },

  itemFunc: async (item, ie) => {
    let price1 = ie.querySelector(".product-price-hor > .priceSVG:nth-child(1) > span");
    let price2 = ie.querySelector(".product-price-hor > .priceSVG:nth-child(2) > span");
    if(price2) {
      item.price = price2.textContent;
      parser.AddItem(item);
    }
    else {
      item.price = price1.textContent;
      parser.AddItem(item);
    }
    return;
  },
  func: async () => {
    console.log("vitaexpress");
    const tab = await create_tab("https://vitaexpress.ru/");

    if (!tab) return;

    parser.exit.Add(() => tab.Close());

    const currentCity = await tab.GetHTML(CURRENT_CITY);

    const regex = /( |<([^>]+)>)/gi;
    var currentCityRegex = currentCity.replace(regex, "");
    console.log("Current city:", currentCityRegex.trim());
    console.log("Target city:", parser.params.city);

    await sleep(4);
    const CHANGE_CITY = document.querySelector<HTMLAnchorElement>(
      "div.modalWindow > div > div > div > div.contentModal__body > div.help-city__inner > div.help-city__links"
    );

    async function ChangeCity() {
      await tab.Evaluate(async (city) => {
        const regionList = document.querySelectorAll<HTMLAnchorElement>(
          "#changeCityModalWrap > div.modalWindow > div > div > div > div > div.changeCityModalCalcedHeight > div > div.changeCityModalListsWrap.r > div:nth-child(1) > div.changeCityModalList > div.changeCityModalList__ul > div.changeCityModalList__ul-li"
        );

        console.log("REGION COUNT", regionList.length);

        for (let i = regionList.length - 1; i >= 0; i--) {
          console.log("Region iterate", i, regionList[i]);

          const re = regionList[i];
          re.click();

          await new Promise((res) => setTimeout(res, 4000));

          const cityList = document.querySelectorAll<HTMLAnchorElement>(
            "#changeCityModalWrap > div.modalWindow > div > div > div > div > div.changeCityModalCalcedHeight > div > div.changeCityModalListsWrap.r > div:nth-child(2) > div.changeCityModalList > div.changeCityModalList__ul > div.changeCityModalList__ul-li"
          );

          for (const ce of cityList) {
            if (ce.textContent && ce.textContent.trim() === city) {
              ce.click();

              return;
            }
          }
        }
      }, parser.params.city);
    }

    if (currentCityRegex.trim() !== parser.params.city) {
      console.log(CHANGE_CITY);
      if (!CHANGE_CITY) {
        await tab.Click(CURRENT_CITY);
        await sleep(4);
        tab.SetTimeout(180);
        await ChangeCity();
      } else {
        await tab.WaitSelector(
          "div.modalWindow > div > div > div > div.contentModal__body > div.help-city__inner > div.help-city__links"
        );
        await sleep(4);
        await tab.Click(
          "div.modalWindow > div > div > div > div.contentModal__body > div.help-city__inner > div.help-city__links > a:nth-child(2)"
        );
        await sleep(4);
        tab.SetTimeout(180);
        await ChangeCity();
      }
    } else {
      console.log("It's ok");
    }
    await sleep(2);
    const categories = await tab.Evaluate(() => {
      const links = [];
      links.push(
        {name: "Питание для мамы",link: "https://vitaexpress.ru/catalog/mama-i-malysh/pitanie-dlya-mamy/",},
        {name: "Кормление грудью",link: "https://vitaexpress.ru/catalog/mama-i-malysh/dlya-kormleniya-grudyu/",},
        {name: "Детская гигиена",link: "https://vitaexpress.ru/catalog/mama-i-malysh/detskaya-gigiena/",},
        {name: "Детское питание",link: "https://vitaexpress.ru/catalog/mama-i-malysh/detskoe-pitanie/",},
        {name: "Лечебно-профилактический уход",link: "https://vitaexpress.ru/catalog/beauty_health/kosmetika_i_aksessuary/lechebno_profilakticheskiy_ukhod/",},
        {name: "Уход за лицом",link: "https://vitaexpress.ru/catalog/beauty_health/kosmetika_i_aksessuary/ukhod_za_litsom_/",},
        {name: "Уход за волосами",link: "https://vitaexpress.ru/catalog/beauty_health/kosmetika_i_aksessuary/ukhod_ZA_volosami/",},
        {name: "Уход за телом",link: "https://vitaexpress.ru/catalog/beauty_health/kosmetika_i_aksessuary/ukhod_za_telom/",},
        {name: "Уход за ногами",link: "https://vitaexpress.ru/catalog/beauty_health/kosmetika_i_aksessuary/ukhod_za_nogami/",},
        {name: "Уход за руками",link: "https://vitaexpress.ru/catalog/beauty_health/kosmetika_i_aksessuary/ukhod_za_rukami/",},
        {name: "Подарочные наборы",link: "https://vitaexpress.ru/catalog/beauty_health/kosmetika_i_aksessuary/podarochnye_nabory/",},
        {name: "Солнцезащитные средства",link: "https://vitaexpress.ru/catalog/beauty_health/kosmetika_i_aksessuary/solntsezashchitnye_sredstva_/",},
        {name: "Диабетическое питание",link: "https://vitaexpress.ru/catalog/beauty_health/healthy_and_curative_nutrition/diabeticheskoe_pitanie/",},
        {name: "Лечебное и профилактическое питание",link: "https://vitaexpress.ru/catalog/beauty_health/healthy_and_curative_nutrition/lechebnoe_i_profilakticheskoe_pitanie/",},
        {name: "Спортивное питание",link: "https://vitaexpress.ru/catalog/beauty_health/healthy_and_curative_nutrition/sportivnoe_pitanie/",},
        {name: "Коррекция фигуры",link: "https://vitaexpress.ru/catalog/beauty_health/healthy_and_curative_nutrition/korrektsiya_figury/",},
        {name: "Презервативы",link: "https://vitaexpress.ru/catalog/beauty_health/intimate_health/prezervativy/",},
        {name: "Смазки",link: "https://vitaexpress.ru/catalog/beauty_health/intimate_health/smazki/",},
        {name: "Диагностические тесты",link: "https://vitaexpress.ru/catalog/beauty_health/intimate_health/diagnosticheskie_testy/",},
        {name: "Медицинские изделия",link: "https://vitaexpress.ru/catalog/beauty_health/medic_tools/",},
        {name: "Уход за полостью рта",link: "https://vitaexpress.ru/catalog/beauty_health/hygiene/ukhod_za_polostyu_rta/",},
        {name: "Личная гигиена",link: "https://vitaexpress.ru/catalog/beauty_health/hygiene/lichnaya_gigiena/",},
        {name: "Интимная гигиена",link: "https://vitaexpress.ru/catalog/beauty_health/hygiene/intimnaya_gigiena/",},
        {name: "Женская гигиена",link: "https://vitaexpress.ru/catalog/beauty_health/hygiene/zhenskaya_gigiena/", },
        {name: "Гигиенические принадлежности",link: "https://vitaexpress.ru/catalog/beauty_health/ukhod-za-bolnymi/gigienicheskie_prinadlezhnosti/",},
        {name: "Уход за кожей больных",link: "https://vitaexpress.ru/catalog/beauty_health/ukhod-za-bolnymi/ukhod_za_kozhey_bolnykh/",},     
        {name: "Дерматологические препараты",link: "https://vitaexpress.ru/catalog/lekarstva-i-bady/lekarstva-pri-kozhnykh-zabolevaniyakh/",},
        {name: "Нервная система",link: "https://vitaexpress.ru/catalog/lekarstva-i-bady/lekarstva-pri-nevrologicheskikh-rasstroystvakh/",},
        {name: "Иммунитет",link: "https://vitaexpress.ru/catalog/lekarstva-i-bady/lekarstva-pri-infektsionnykh-zabolevaniyakh/",},
        {name: "Антибактериальные препараты",link: "https://vitaexpress.ru/catalog/lekarstva-i-bady/antibiotiki/",},       
        {name: "Женское здоровье",link: "https://vitaexpress.ru/catalog/lekarstva-i-bady/zhenskoe-zdorove/",},
        {name: "Здоровое сердце и кроветворение",link: "https://vitaexpress.ru/catalog/lekarstva-i-bady/zdorovoe-serdtse-i-sosudy/",},  
        {name: "Диабет и другие гормональные нарушения",link: "https://vitaexpress.ru/catalog/lekarstva-i-bady/lekarstva-pri-gormonalnykh-narusheniyakh/",},
        {name: "Аллергия и бронхиальная астма",link: "https://vitaexpress.ru/catalog/lekarstva-i-bady/sredstva-ot-allergii/",},
        {name: "Лечение геморроя и варикоза",link: "https://vitaexpress.ru/catalog/lekarstva-i-bady/zdorovye-veny-gemorroy/",},
        {name: "Оказание первой помощи",link: "https://vitaexpress.ru/catalog/lekarstva-i-bady/okazanie-pervoy-pomoshchi/",},     
        {name: "Вакцины, аллергены, фаги",link: "https://vitaexpress.ru/catalog/lekarstva-i-bady/vaktsiny-syvorotki/", },      
        {name: "Мужское здоровье",link: "https://vitaexpress.ru/catalog/lekarstva-i-bady/muzhskoe-zdorove/",},
        {name: "Противопростудные препараты",link: "https://vitaexpress.ru/catalog/lekarstva-i-bady/lekarstva-ot-prostudy/",},
        {name: "Почки и мочевыводящие пути",link: "https://vitaexpress.ru/catalog/lekarstva-i-bady/lekarstva-dlya-lecheniya-pochek/",},
        {name: "Вредные привычки",link: "https://vitaexpress.ru/catalog/lekarstva-i-bady/zdorovyy-obraz-zhizni/",},         
        {name: "Опорно-двигательная система",link: "https://vitaexpress.ru/catalog/lekarstva-i-bady/lekarstva-dlya-lecheniya-sustavov/",},    
        {name: "ЖКТ и печень",link: "https://vitaexpress.ru/catalog/lekarstva-i-bady/zheludochno-kishechnye-preparaty/",},
        {name: "Противоопухолевые препараты",link: "https://vitaexpress.ru/catalog/lekarstva-i-bady/preparaty-dlya-sistemnogo-vozdeystviya/",},
        {name: "Против боли и воспаления",link: "https://vitaexpress.ru/catalog/lekarstva-i-bady/obezbolivayushchie/",},       
        {name: "Коррекция фигуры",link: "https://vitaexpress.ru/catalog/lekarstva-i-bady/zhenskoe-zdorove/",},
        {name: "Средства для глаз",link: "https://vitaexpress.ru/catalog/lekarstva-i-bady/lekarstva-i-bady-dlya-glaz/",},  
        {name: "Противогрибковые препараты",link: "https://vitaexpress.ru/catalog/lekarstva-i-bady/protivogribkovye-sredstva/",},
        {name: "Для массажа и красоты",link: "https://vitaexpress.ru/catalog/pribory-i-apparaty/pribory-dlya-massazha/",},
        {name: "Для ингаляций",link: "https://vitaexpress.ru/catalog/pribory-i-apparaty/pribory-dlya-ingalyatsiy/",},     
        {name: "Средства для гигиены полости рта",link: "https://vitaexpress.ru/catalog/pribory-i-apparaty/hygiene_of_teeth/", }, 
        {name: "Экспресс-тесты",link: "https://vitaexpress.ru/catalog/pribory-i-apparaty/sredstva-vizualnoy-diagnostiki-ekspress-analiz/",},        
        {name: "Измерение уровня сахара",link: "https://vitaexpress.ru/catalog/pribory-i-apparaty/pribory-dlya-izmereniya-urovnya-sakhara/",},
        {name: "Измерение температуры тела",link: "https://vitaexpress.ru/catalog/pribory-i-apparaty/pribory-dlya-izmereniya-temperatury-tela/",},        
        {name: "Измерение уровня кислорода",link: "https://vitaexpress.ru/catalog/pribory-i-apparaty/oxygen-level-measurement/",},
        {name: "Аппараты для физиотерапии",link: "https://vitaexpress.ru/catalog/pribory-i-apparaty/for-physiotherapy/",},
        {name: "Измерение давления",link: "https://vitaexpress.ru/catalog/pribory-i-apparaty/pribory-dlya-izmereniya-davleniya/",}   
        );
      return links;
    });
    
    console.log("Categories", categories);
    await sleep(4);

    for (const cat of categories) {
      console.log("Start parse category", cat.name);
      let tries = 0;
      while (true) {
        if (tries > 100) break;
        const link = cat.link;
        await sleep(10);
        await tab.GoTo(link);
        for (var i = 0; i < 3; i++) {
          await sleep(10);
          await tab.ScrollTo(".subs__input");
        }
        await sleep(3);
        const btn = await tab.Evaluate(() => !document.querySelector(".btn-pager.hidden")); 
        console.log(btn);
        var i=0;
        while (true) {
          const btn1 = await tab.Evaluate(() => !document.querySelector(".btn-pager.hidden"));
          if (btn1) {
            i++;
            await sleep(5);
            await tab.ScrollTo(".subs__input");
            await sleep(5);
            await tab.Click("#newBtnPager");
          } else {
            break;
          }
          if(i>35) {
            break;
          }
        }
        await sleep(3);
        const text = await tab.Evaluate(async () => document.body.innerHTML);
        const body = parse(text);
        if (!body) {
          tries++;
          continue;
        }
        parser.ParseItems(text);
        await sleep(4);
        if(!body.querySelector(".pager-content") || body.innerHTML.includes("Извините, страница не найдена")) {
          break;
        }
          break;
      }
      await sleep(5);
    }
  },
});
export default config;
