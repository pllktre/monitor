import type { InitParserConfig } from "../components/parsing";
import { parse } from "node-html-parser";
import { create_tab } from "../extension/background";
import { sleep } from "../components/utils";

const CURRENT_CITY = ".Info_address__y7yvF > div > span";
const CHANGE_CITY = ".Info_address__y7yvF > div";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 440,
  params: ["city"],
  cache: ["brands"],
  itemSelector:
    "div.sc-58d8feb4-5.cLgip > div > div > div > div > div.sc-ba678b3d-2.sc-2c79eac2-0.dzQufw.cJemMl",
  itemParams: {
    name: ["a.sc-ba678b3d-6.iBQutf > span"],
    price: [
      "div.Price_common-price__8fNbt > div.Price_price__qHqZv.Price_common-price-currency__SwH6u",
    ],
    brand: [
      "div.sc-75f87ab0-0.hhisWi > div:nth-child(2) > span.sc-75f87ab0-3.kMVDrq",
    ],
  },

  func: async () => {
    console.log("zdravcity");
    const tab = await create_tab("https://zdravcity.ru/");

    if (!tab) return;

    parser.exit.Add(() => tab.Close());
    await sleep(10);
    const categories = await tab.Evaluate(() => {
      const links = [];
      links.push(
        { name: "accu-chek", link: "accu-chek" },
        { name: "anti-age", link: "anti-age" },
        { name: "gls триптофан", link: "gls+триптофан" },
        { name: "complex sw", link: "complex+sw" },
        { name: "l-тироксин ", link: "l-тироксин" },
        { name: "natures bounty", link: "natures+bounty" },
        { name: "now капс", link: "now+капс" },
        { name: "one touch", link: "one+touch" },
        { name: "realcaps", link: "realcaps" },
        { name: "vitateka", link: "vitateka" },
        { name: "авамис", link: "авамис" },
        { name: "адвантан", link: "адвантан" },
        { name: "аденопросин", link: "аденопросин" },
        { name: "аденурик", link: "аденурик" },
        { name: "азарга", link: "азарга" },
        { name: "азелик", link: "азелик" },
        { name: "азопт", link: "азопт" },
        { name: "акатинол", link: "акатинол" },
        { name: "аквадетрим", link: "аквадетрим" },
        { name: "акнекутан", link: "акнекутан" },
        { name: "акридерм", link: "акридерм" },
        { name: "аксамон", link: "аксамон" },
        { name: "актовегин", link: "актовегин" },
        { name: "актофлор-с", link: "актофлор-с" },
        { name: "актрапид", link: "актрапид" },
        { name: "албендазол-дж", link: "албендазол-дж" },
        { name: "алзепил", link: "алзепил" },
        { name: "аллапинин", link: "аллапинин" },
        { name: "аллервэй", link: "аллервэй" },
        { name: "аллопуринол", link: "аллопуринол" },
        { name: "акнекутан", link: "акнекутан" },
        { name: "алмагель", link: "алмагель" },
        { name: "алфлутоп", link: "алфлутоп" },
        { name: "альфа д3-тева", link: "альфа+д3-тева" },
        { name: "альфа нормикс", link: "альфа+нормикс" },
        { name: "амарил", link: "амарил" },
        { name: "амитриптилин", link: "амитриптилин" },
        { name: "аморолфин", link: "аморолфин" },
        { name: "анжелик", link: "анжелик" },
        { name: "апроваск", link: "апроваск" },
        { name: "апровель", link: "апровель" },
        { name: "аргосульфан", link: "аргосульфан" },
        { name: "арипризол", link: "арипризол" },
        { name: "арифам", link: "арифам" },
        { name: "арифон", link: "арифон" },
        { name: "аркоксиа", link: "аркоксиа" },
        { name: "артогистан", link: "артогистан" },
        { name: "артра", link: "артра" },
        { name: "артрадол", link: "артрадол" },
        { name: "артро-актив", link: "артро-актив" },
        { name: "артрозилен", link: "артрозилен" },
        { name: "аскорбиновая", link: "аскорбиновая" },
        { name: "аскорутин", link: "аскорутин" },
        { name: "атаканд", link: "атаканд" },
        { name: "аторвастатин", link: "аторвастатин" },
        { name: "аторис", link: "аторис" },
        { name: "аугментин", link: "аугментин" },
        { name: "афобазол", link: "афобазол" },
        { name: "африн", link: "африн" },
        { name: "ацетилсалициловая", link: "ацетилсалициловая" },
        { name: "аэртал", link: "аэртал" },
        { name: "баралгин", link: "баралгин" },
        { name: "белара", link: "белара" },
        { name: "белобаза", link: "белобаза" },
        { name: "белодерм", link: "белодерм" },
        { name: "белосалик", link: "белосалик" },
        { name: "берлитион", link: "берлитион" },
        { name: "беродуал", link: "беродуал" },
        { name: "беротек", link: "беротек" },
        { name: "беталок", link: "беталок" },
        { name: "бетасерк", link: "бетасерк" },
        { name: "бетоптик", link: "бетоптик" },
        { name: "бильтрицид", link: "бильтрицид" },
        { name: "бисопролол", link: "бисопролол" },
        { name: "благомин", link: "благомин" },
        { name: "блефарогель", link: "блефарогель" },
        { name: "бонвива", link: "бонвива" },
        { name: "борная", link: "борная" },
        { name: "бравадин", link: "бравадин" },
        { name: "брилинта", link: "брилинта" },
        { name: "бринтелликс", link: "бринтелликс" },
        { name: "вазобрал", link: "вазобрал" },
        { name: "валацикловир", link: "валацикловир" },
        { name: "валвир", link: "валвир" },
        { name: "валериана", link: "валериана" },
        { name: "валокордин-доксиламин", link: "валокордин+доксиламин" },
        { name: "валосердин", link: "валосердин" },
        { name: "валсартан", link: "валсартан" },
        { name: "вальтрекс", link: "вальтрекс" },
        { name: "вальсакор", link: "вальсакор" },
        { name: "вамлосет", link: "вамлосет" },
        { name: "вегетрокс", link: "вегетрокс" },
        { name: "велсон", link: "велсон" },
        { name: "венлафаксин-алси", link: "венлафаксин+алси" },
        { name: "венофер", link: "венофер" },
        { name: "верошпирон", link: "верошпирон" },
        { name: "версатис", link: "версатис" },
        { name: "вессел", link: "вессел" },
        { name: "ветом", link: "ветом" },
        { name: "виброцил", link: "виброцил" },
        { name: "визанна", link: "визанна" },
        { name: "випдомет", link: "випдомет" },
        { name: "випидия", link: "випидия" },
        { name: "висмута", link: "висмута" },
        { name: "витамин", link: "витамин" },
        { name: "витапрост", link: "витапрост" },
        { name: "витатека", link: "витатека" },
        { name: "витрум", link: "витрум" },
        { name: "вольтарен", link: "вольтарен" },
        { name: "гайномакс", link: "гайномакс" },
        { name: "галвус", link: "галвус" },
        { name: "ганфорт", link: "ганфорт" },
        { name: "гастал", link: "гастал" },
        { name: "гастрарекс", link: "гастрарекс" },
        { name: "гастрофарм", link: "гастрофарм" },
        { name: "гевискон", link: "гевискон" },
        { name: "генферон", link: "генферон" },
        { name: "гепа-мерц", link: "гепа-мерц" },
        { name: "гепатрин", link: "гепатрин" },
        { name: "гепатромбин", link: "гепатромбин" },
        { name: "гептрал", link: "гептрал" },
        { name: "гинкоум", link: "гинкоум" },
        { name: "гипосарт", link: "гипосарт" },
        { name: "глатион", link: "глатион" },
        { name: "глаупрост", link: "глаупрост" },
        { name: "глиатилин", link: "глиатилин" },
        { name: "глибомет", link: "глибомет" },
        { name: "глидиаб", link: "глидиаб" },
        { name: "гликлазид", link: "гликлазид" },
        { name: "глицерин", link: "глицерин" },
        { name: "глицериновые", link: "глицериновые" },
        { name: "глицин", link: "глицин" },
        { name: "глюкованс", link: "глюкованс" },
        { name: "глюкофаж", link: "глюкофаж" },
        { name: "грандаксин", link: "грандаксин" },
        { name: "гутталакс", link: "гутталакс" },
        { name: "дазолик", link: "дазолик" },
        { name: "дезринит", link: "дезринит" },
        { name: "дексилант", link: "дексилант" },
        { name: "деринат", link: "деринат" },
        { name: "детралекс", link: "детралекс" },
        { name: "джардинс", link: "джардинс" },
        { name: "джес", link: "джес" },
        { name: "диабетон", link: "диабетон" },
        { name: "диане-35", link: "диане-35" },
        { name: "дибикор", link: "дибикор" },
        { name: "дигидрокверцетин", link: "дигидрокверцетин" },
        { name: "дикловит", link: "дикловит" },
        { name: "диклофенак", link: "диклофенак" },
        { name: "димексид", link: "димексид" },
        { name: "димиа", link: "димиа" },
        { name: "дипросалик", link: "дипросалик" },
        { name: "диротон", link: "диротон" },
        { name: "диувер", link: "диувер" },
        { name: "дифферин", link: "дифферин" },
        { name: "долфин", link: "долфин" },
        { name: "дона", link: "дона" },
        { name: "доппельгерц", link: "доппельгерц" },
        { name: "дорзопт", link: "дорзопт" },
        { name: "достинекс", link: "достинекс" },
        { name: "драстоп", link: "драстоп" },
        { name: "дротаверин", link: "дротаверин" },
        { name: "дульколакс", link: "дульколакс" },
        { name: "дуодарт", link: "дуодарт" },
        { name: "дуоколд", link: "дуоколд" },
        { name: "дуопрост", link: "дуопрост" },
        { name: "дуоресп", link: "дуоресп" },
        { name: "дуотрав", link: "дуотрав" },
        { name: "дыши масло-спрей", link: "дыши+масло-спрей" },
        { name: "евра ттс", link: "евра+ттс" },
        { name: "дюспаталин", link: "дюспаталин" },
        { name: "дюфалак", link: "дюфалак" },
        { name: "дюфастон", link: "дюфастон" },
        { name: "жанин", link: "жанин" },
        { name: "зафрилла", link: "зафрилла" },
        { name: "звездочка", link: "звездочка" },
        { name: "здоровит", link: "здоровит" },
        { name: "зенон", link: "зенон" },
        { name: "зилт", link: "зилт" },
        { name: "зостерин-ультра", link: "зостерин-ультра" },
        { name: "иберогаст", link: "иберогаст" },
        { name: "ибуклин", link: "ибуклин" },
        { name: "изофра", link: "изофра" },
        { name: "ингавирин", link: "ингавирин" },
        { name: "индигал", link: "индигал" },
        { name: "индинол", link: "индинол" },
        { name: "инкресинк", link: "инкресинк" },
        { name: "инспиракс", link: "инспиракс" },
        { name: "инспра", link: "инспра" },
        { name: "инфлюцеин", link: "инфлюцеин" },
        { name: "инъектран", link: "инъектран" },
        { name: "ипидакрин-сз", link: "ипидакрин-сз" },
        { name: "ирифрин", link: "ирифрин" },
        { name: "ирузид", link: "ирузид" },
        { name: "итомед", link: "итомед" },
        { name: "кавинтон", link: "кавинтон" },
        { name: "кагоцел", link: "кагоцел" },
        { name: "кальцемин", link: "кальцемин" },
        { name: "кандидерм", link: "кандидерм" },
        { name: "капотен", link: "капотен" },
        { name: "карбамазепин", link: "карбамазепин" },
        { name: "кардиаск", link: "кардиаск" },
        { name: "кардиомагнил", link: "кардиомагнил" },
        { name: "карипазим", link: "карипазим" },
        { name: "каталин", link: "каталин" },
        { name: "кело-коут", link: "кело-коут" },
        { name: "кестин", link: "кестин" },
        { name: "кетоконазол", link: "кетоконазол" },
        { name: "кетонал", link: "кетонал" },
        { name: "клайра", link: "клайра" },
        { name: "клацид", link: "клацид" },
        { name: "клопидогрел-сз", link: "клопидогрел-сз" },
        { name: "коапровель", link: "коапровель" },
        { name: "ко-вамлосет", link: "ко-вамлосет" },
        { name: "ковирвин", link: "ковирвин" },
        { name: "когитум", link: "когитум" },
        { name: "кокарнит", link: "кокарнит" },
        { name: "комбиган", link: "комбиган" },
        { name: "комбилипен", link: "комбилипен" },
        { name: "комбифлокс", link: "комбифлокс" },
        { name: "компливит", link: "компливит" },
        { name: "комплинекс", link: "комплинекс" },
        { name: "конкор", link: "конкор" },
        { name: "ко-перинева", link: "ко-перинева" },
        { name: "коплавикс", link: "коплавикс" },
        { name: "кораксан", link: "кораксан" },
        { name: "кораксан", link: "кораксан" },
        { name: "корвалол", link: "корвалол" },
        { name: "кордарон", link: "кордарон" },
        { name: "кординик", link: "кординик" },
        { name: "корега", link: "корега" },
        { name: "ко-ренитек", link: "ко-ренитек" },
        { name: "корнерегель", link: "корнерегель" },
        { name: "коронал", link: "коронал" },
        { name: "кортексин", link: "кортексин" },
        { name: "косопт", link: "косопт" },
        { name: "коэнзим", link: "коэнзим" },
        { name: "красногорсклексредства брусника", link: "красногорсклексредства брусника" },
        { name: "красногорсклексредства мята", link: "красногорсклексредства мята" },
        { name: "красногорсклексредства эвкалипт", link: "красногорсклексредства эвкалипт" },
        { name: "креон", link: "креон" },
        { name: "крестор", link: "крестор" },
        { name: "ксалаком", link: "ксалаком" },
        { name: "ксалатан", link: "ксалатан" },
        { name: "ксарелто", link: "ксарелто" },
        { name: "ксефокам", link: "ксефокам" }
        );
      return links;
    });
    await sleep(10);
    console.log("Categories", categories);
    await sleep(10);
    for (const cat of categories) {
        console.log("Start parse Subcategory", cat.name, cat.link);
        let page = 1;
        let tries = 0;
        let city = " ";
        if(parser.params.city === "Когалым") {
          city = "r_hantymansiysk/";
        }
        else if(parser.params.city === "Тобольск") {
          city = "r_tyumen/";
        }
        while (true) {
          if (tries > 100) break;
          const href = cat.link;
          const link = "https://zdravcity.ru/search/" + city + "?what=" + href;
          await sleep(30);
          await tab.GoTo(link);
          await sleep(30);
          const text = await tab.Evaluate(async () => document.body.innerHTML);
          const body = parse(text);
          if (!body) {
            tries++;
            continue;
          }
          const propetries = body.querySelectorAll(
            "div.ProductsList_list-preview__OIemJ"
          );
          for (let r of propetries) {
            const name = r.querySelector("a.Horizontal_horizontal-title__XBc6D > span");

            const price = r.querySelector(
              "div.Horizontal_horizontal-price-container__WXiGk > div.Price_common-price__v9UOU > div.Price_price__Y1FnU"
            );

            const button = r.querySelector(
              "div.AddToCart_add-to-cart__JoFvR"
            );
            if (button !== null) {
              const rv = r.querySelector(
                "div.HorizontalInfoList_list-item__jITg2 > span"
              );

              if (rv.textContent === "Действующее вещество (МНН)") {
                const brand = r.querySelector(
                  "div.HorizontalInfoList_list__IOlDa > div:nth-child(2) > span:nth-child(2)"
                );
                if(price && name) {
                const item = {
                  name: name.textContent,
                  price: price.innerText.replace("Цена","").replace("₽",""),
                  brand: brand.textContent,
                };
                console.log("Add item", item);
                parser.AddItem(item);
              }

              } else {
                const brand = r.querySelector(
                  "div.HorizontalInfoList_list__IOlDa > div:nth-child(1) > span:nth-child(2)"
                );
                if(price && name) {
                const item = {
                  name: name.textContent,
                  price: price.textContent,
                  brand: brand.textContent,
                };
                
                console.log("Add item", item);
                parser.AddItem(item);
              }
              }
            }
          }
          const price = body.querySelectorAll(
            "div.Horizontal_horizontal-price-container__WXiGk > div.Price_common-price__v9UOU > div.Price_price__Y1FnU"
          );
          
          if(price.length === 0) {break;}
          if (body.innerHTML.includes("Ошибка 404")) { break; }
          if (body.innerHTML.includes("Ничего не найдено")) { break; }
          await sleep(50);
          break;
        }

        await sleep(5);
      //}
    }
  },
});
export default config;
