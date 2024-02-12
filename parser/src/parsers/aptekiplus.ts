import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const CURRENT_CITY = "div.context-menu > div";
const CHANGE_CITY = "div.context-menu > div > svg";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 409,
  params: ["city", "region"],
  itemSelector:
    "div.catalog > .product-card.product-card--line > div.product-card__inner",
  itemParams: {
    name: [".product-card__title-text"],
    price: ["div.product-card__price > div> div > p"],
    brand: [".product-card__desc-table > tbody > tr:nth-child(1) > td:nth-child(2)"]
  },
  itemFunc: async (item, ie) => {
    const brand = ie.querySelector(
      ".product-card__desc-table > tbody > tr:nth-child(1) > td:nth-child(1)"
    );
    const brand2 = ie.querySelector(
      ".product-card__desc-table > tbody > tr:nth-child(2) > td:nth-child(1)"
    );
    const brand3 = ie.querySelector(
      ".product-card__desc-table > tbody > tr:nth-child(3) > td:nth-child(1)"
    );
    if(brand && brand.textContent && brand.textContent == 'Производитель') 
    {
      const brands = ie.querySelector(
        ".product-card__desc-table > tbody > tr:nth-child(1) > td:nth-child(2)"
      );
      item.brand = brands.textContent
      parser.AddItem(item);
      return;
    }
    else if (brand2 && brand2.textContent && brand2.textContent == 'Производитель') {
      const brands2 = ie.querySelector(
        ".product-card__desc-table > tbody > tr:nth-child(2) > td:nth-child(2)"
      );
      item.brand = brands2.textContent
      parser.AddItem(item);
      return;
    } else if (brand3 && brand3.textContent && brand3.textContent == 'Производитель') {
      const brands3 = ie.querySelector(
        ".product-card__desc-table > tbody > tr:nth-child(3) > td:nth-child(2)"
      );
      item.brand = brands3.textContent
      parser.AddItem(item);
      return;
    }
    else {
      item.brand = ''
      parser.AddItem(item);
      return;
    }

  },
  func: async () => {
    console.log("aptekiplus");
    const tab = await create_tab("https://aptekiplus.ru/");

    if (!tab) return;

    parser.exit.Add(() => tab.Close());
    await sleep(10);
    await tab.WaitSelector(CURRENT_CITY);
    const currentCity = await tab.GetHTML(CURRENT_CITY);

    const regex = /( |<([^>]+)>)/gi;
    var currentCityRegex = currentCity.replace(regex, " ");
    console.log("Current city:", currentCityRegex.trim());
    console.log("Target city:", parser.params.city);

    if (currentCity.trim() !== parser.params.city) {
      await sleep(5);
      await tab.WaitSelector(CHANGE_CITY);
      await sleep(5);
      await tab.Click(CHANGE_CITY);
      await sleep(2);
      await tab.Evaluate(async (city) => {
        const input = <HTMLInputElement>(
          document.querySelector("div.formkit-inner.input__inner > input")
        );
        input.value = city;
        input.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true }));
        input.dispatchEvent(new KeyboardEvent("keypress", { bubbles: true }));
        input.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
        input.dispatchEvent(new Event("focus", { bubbles: true }));
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }, parser.params.city);
      await sleep(10);
      await tab.WaitSelector("div.scroll-container > ul > li");
      await tab.Evaluate(
        async ([city, region]) => {
          const cityList = document.querySelectorAll<HTMLAnchorElement>(
            "div.scroll-container > ul > li"
          );
          for (const ce of cityList) {
            console.log(ce.innerText.split(" г")[0]);
            console.log(ce.innerText.split("\n")[1]);
            console.log(region);
            if (
              ce.innerText.split(" г")[0] === city &&
              ce.innerText.split("\n")[1] === region
            ) {
              ce.click();
              return;
            }
          }
        },
        [parser.params.city, parser.params.region]
      );
    } else {
      console.log("It's ok");
    }
    await sleep(10);

    const categories = await tab.Evaluate(() => {
      const list = document.querySelectorAll<HTMLLabelElement>(
        "div.header__menu.container > div.header__menu-col.header__menu-col--main > ul > li:nth-child(1) > a"
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
      await tab.GoTo(`https://aptekiplus.ru` + cat.link);
      await sleep(2);
      await tab.Click(".catalog-filter__list > li:nth-child(6) > div > div > div.filter-block__title > svg");
      await sleep(2);
      await tab.Click(".filter-block__button.button.button--simple.button--blue.filter-block__button > span")
      await sleep(8);
      const subCategories = await tab.Evaluate(() => {
        const list = document.querySelectorAll<HTMLLabelElement>(
          "div.filter-block__fieldset > div > ul > li > a"
        );
        const links = [];
        const url =  document.location.href;
        links.push(
          { name: "Accu-chek", link: url.replace('lekarstva-i-badi/','') + "root?q=accu-chek" },
          { name: "One touch", link: url.replace('lekarstva-i-badi/','') + "root?q=one+touch" },
          { name: "Авамис", link: url.replace('lekarstva-i-badi/','') + "root?q=авамис+спрей" },
          { name: "Адвантан", link: url.replace('lekarstva-i-badi/','') + "root?q=адвантан" },
          { name: "Азарга", link: url.replace('lekarstva-i-badi/','') + "root?q=азарга" },
          { name: "Азопт", link: url.replace('lekarstva-i-badi/','') + "root?q=азопт" },
          { name: "Араферон", link: url.replace('lekarstva-i-badi/','') + "root?q=анаферон" },
          { name: "Акатинол", link: url.replace('lekarstva-i-badi/','') + "root?q=акатинол" },
          { name: "Акнекутан", link: url.replace('lekarstva-i-badi/','') + "root?q=акнекутан" },
          { name: "Актовегин", link: url.replace('lekarstva-i-badi/','') + "root?q=актовегин" },
          { name: "АЦЦ", link: url.replace('lekarstva-i-badi/','') + "root?q=ацц" },
          { name: "Алфлутоп", link: url.replace('lekarstva-i-badi/','') + "root?q=алфлутоп" },
          { name: "Альфаган", link: url.replace('lekarstva-i-badi/','') + "root?q=альфаган" },
          { name: "Амарил", link: url.replace('lekarstva-i-badi/','') + "root?q=амарил+таблетки" },
          { name: "Анжелик", link: url.replace('lekarstva-i-badi/','') + "root?q=анжелик" },
          { name: "Арифон", link: url.replace('lekarstva-i-badi/','') + "root?q=арифон" },
          { name: "Атаканд", link: url.replace('lekarstva-i-badi/','') + "root?q=атаканд" },
          { name: "Аторис", link: url.replace('lekarstva-i-badi/','') + "root?q=аторис" },
          { name: "Афобазол", link: url.replace('lekarstva-i-badi/','') + "root?q=афобазол" },
          { name: "Белара", link: url.replace('lekarstva-i-badi/','') + "root?q=белара" },
          { name: "Белодуал", link: url.replace('lekarstva-i-badi/','') + "root?q=белодуал" },
          { name: "Беталок", link: url.replace('lekarstva-i-badi/','') + "root?q=беталок" },
          { name: "Бетасерк", link: url.replace('lekarstva-i-badi/','') + "root?q=бетасерк" },
          { name: "Бетоптик", link: url.replace('lekarstva-i-badi/','') + "root?q=бетоптик" },
          { name: "Брилинта", link: url.replace('lekarstva-i-badi/','') + "root?q=брилинта" },
          { name: "Валосердин", link: url.replace('lekarstva-i-badi/','') + "root?q=валосердин" },
          { name: "Верошпирон", link: url.replace('lekarstva-i-badi/','') + "root?q=верошпирон" },
          { name: "Вессел", link: url.replace('lekarstva-i-badi/','') + "root?q=вессел" },
          { name: "Визанна", link: url.replace('lekarstva-i-badi/','') + "root?q=визанна" },
          { name: "Випдомет", link: url.replace('lekarstva-i-badi/','') + "root?q=випдомет" },
          { name: "Витапрост", link: url.replace('lekarstva-i-badi/','') + "root?q=витапрост" },
          { name: "Галвус", link: url.replace('lekarstva-i-badi/','') + "root?q=галвус" },
          { name: "Гептрал", link: url.replace('lekarstva-i-badi/','') + "root?q=гептрал" },
          { name: "Глаупрост", link: url.replace('lekarstva-i-badi/','') + "root?q=глаупрост" },
          { name: "Глиатилин", link: url.replace('lekarstva-i-badi/','') + "root?q=глиатилин" },
          { name: "Глибомет", link: url.replace('lekarstva-i-badi/','') + "root?q=глибомет" },
          { name: "Глюкованс", link: url.replace('lekarstva-i-badi/','') + "root?q=глюкованс" },
          { name: "Глюкофаж", link: url.replace('lekarstva-i-badi/','') + "root?q=глюкофаж" },
          { name: "Детралекс", link: url.replace('lekarstva-i-badi/','') + "root?q=детралекс" },
          { name: "Джес", link: url.replace('lekarstva-i-badi/','') + "root?q=джес" },
          { name: "Диабетон", link: url.replace('lekarstva-i-badi/','') + "root?q=диабетон" },
          { name: "Диане", link: url.replace('lekarstva-i-badi/','') + "root?q=диане" },
          { name: "Димиа", link: url.replace('lekarstva-i-badi/','') + "root?q=димиа" },
          { name: "Денол", link: url.replace('lekarstva-i-badi/','') + "root?q=де-нол" },
          { name: "Диротон", link: url.replace('lekarstva-i-badi/','') + "root?q=диротон" },
          { name: "Диувер", link: url.replace('lekarstva-i-badi/','') + "root?q=диувер" },
          { name: "Дона", link: url.replace('lekarstva-i-badi/','') + "root?q=дона" },
          { name: "Дорзопт", link: url.replace('lekarstva-i-badi/','') + "root?q=дорзопт" },
          { name: "Достинекс", link: url.replace('lekarstva-i-badi/','') + "root?q=достинекс" },
          { name: "Дуотрав", link: url.replace('lekarstva-i-badi/','') + "root?q=дуотрав" },
          { name: "Дюспаталин", link: url.replace('lekarstva-i-badi/','') + "root?q=дюспаталин" },
          { name: "Дюфалак", link: url.replace('lekarstva-i-badi/','') + "root?q=дюфалак" },
          { name: "Дюфастон", link: url.replace('lekarstva-i-badi/','') + "root?q=дюфастон" },
          { name: "Жанин", link: url.replace('lekarstva-i-badi/','') + "root?q=жанин" },
          { name: "Индинол", link: url.replace('lekarstva-i-badi/','') + "root?q=индинол" },
          { name: "Ирифрин", link: url.replace('lekarstva-i-badi/','') + "root?q=ирифрин" },
          { name: "Изофра", link: url.replace('lekarstva-i-badi/','') + "root?q=изофра" },
          { name: "Кардиомагнил", link: url.replace('lekarstva-i-badi/','') + "root?q=кардиомагнил" },
          { name: "Каталин", link: url.replace('lekarstva-i-badi/','') + "root?q=каталин" },
          { name: "Клайра", link: url.replace('lekarstva-i-badi/','') + "root?q=клайра" },
          { name: "Климонорм", link: url.replace('lekarstva-i-badi/','') + "root?q=климонорм" },
          { name: "Комбилипен", link: url.replace('lekarstva-i-badi/','') + "root?q=комбилипен" },
          { name: "Конкор", link: url.replace('lekarstva-i-badi/','') + "root?q=конкор" },
          { name: "Коплавикс", link: url.replace('lekarstva-i-badi/','') + "root?q=коплавикс" },
          { name: "Кораксан", link: url.replace('lekarstva-i-badi/','') + "root?q=кораксан" },
          { name: "Кордарон", link: url.replace('lekarstva-i-badi/','') + "root?q=кордарон" },
          { name: "Корега", link: url.replace('lekarstva-i-badi/','') + "root?q=корега" },
          { name: "Креон", link: url.replace('lekarstva-i-badi/','') + "root?q=креон" },
          { name: "Корнерегель", link: url.replace('lekarstva-i-badi/','') + "root?q=корнерегель" },
          { name: "Кортексин", link: url.replace('lekarstva-i-badi/','') + "root?q=кортексин" },
          { name: "Косопт", link: url.replace('lekarstva-i-badi/','') + "root?q=косопт" },
          { name: "Крестор", link: url.replace('lekarstva-i-badi/','') + "root?q=крестор" },
          { name: "Ксалаком", link: url.replace('lekarstva-i-badi/','') + "root?q=ксалаком" },
          { name: "Ксалатан", link: url.replace('lekarstva-i-badi/','') + "root?q=ксалатан" },
          { name: "Ксарелто", link: url.replace('lekarstva-i-badi/','') + "root?q=ксарелто" },
          { name: "Леркамен", link: url.replace('lekarstva-i-badi/','') + "root?q=леркамен" },
          { name: "Липримар", link: url.replace('lekarstva-i-badi/','') + "root?q=липримар" },
          { name: "Лозап", link: url.replace('lekarstva-i-badi/','') + "root?q=лозап" },
          { name: "Люксфен", link: url.replace('lekarstva-i-badi/','') + "root?q=люксфен" },
          { name: "Мезим", link: url.replace('lekarstva-i-badi/','') + "root?q=мезим" },
          { name: "Мексидол", link: url.replace('lekarstva-i-badi/','') + "root?q=мексидол" },
          { name: "Мемантин", link: url.replace('lekarstva-i-badi/','') + "root?q=мемантин" },
          { name: "Мертенил", link: url.replace('lekarstva-i-badi/','') + "root?q=мертенил" },
          { name: "Метилурацил", link: url.replace('lekarstva-i-badi/','') + "root?q=метилурацил" },
          { name: "Метформин", link: url.replace('lekarstva-i-badi/','') + "root?q=метформин+лонг" },
          { name: "Мидиана", link: url.replace('lekarstva-i-badi/','') + "root?q=мидиана" },
          { name: "Мидокалм", link: url.replace('lekarstva-i-badi/','') + "root?q=мидокалм" },
          { name: "Мильгамма", link: url.replace('lekarstva-i-badi/','') + "root?q=мильгамма" },
          { name: "Милдронат", link: url.replace('lekarstva-i-badi/','') + "root?q=милдронат" },
          { name: "Мовалис", link: url.replace('lekarstva-i-badi/','') + "root?q=мовалис" },
          { name: "Назонекс", link: url.replace('lekarstva-i-badi/','') + "root?q=назонекс" },
          { name: "Найз", link: url.replace('lekarstva-i-badi/','') + "/root?q=найз" },
          { name: "Небилет", link: url.replace('lekarstva-i-badi/','') + "root?q=небилет" },
          { name: "Нейромидин", link: url.replace('lekarstva-i-badi/','') + "root?q=нейромидин" },
          { name: "Нифекард", link: url.replace('lekarstva-i-badi/','') + "root?q=нифекард" },
          { name: "Нолипрел", link: url.replace('lekarstva-i-badi/','') + "root?q=нолипрел" },
          { name: "Овестин", link: url.replace('lekarstva-i-badi/','') + "root?q=овестин" },
          { name: "Омник", link: url.replace('lekarstva-i-badi/','') + "root?q=омник" },
          { name: "Офтан", link: url.replace('lekarstva-i-badi/','') + "root?q=офтан" },
          { name: "Офтолик", link: url.replace('lekarstva-i-badi/','') + "root?q=офтолик" },
          { name: "Панангин", link: url.replace('lekarstva-i-badi/','') + "root?q=панангин" },
          { name: "Пенталгин", link: url.replace('lekarstva-i-badi/','') + "root?q=пенталгин" },
          { name: "Плавикс", link: url.replace('lekarstva-i-badi/','') + "root?q=плавикс" },
          { name: "Полиоксидоний", link: url.replace('lekarstva-i-badi/','') + "root?q=полиоксидоний" },
          { name: "Прадакса", link: url.replace('lekarstva-i-badi/','') + "root?q=прадакса" },
          { name: "Предуктал", link: url.replace('lekarstva-i-badi/','') + "root?q=предуктал" },
          { name: "Престанс", link: url.replace('lekarstva-i-badi/','') + "root?q=престанс" },
          { name: "Престариум", link: url.replace('lekarstva-i-badi/','') + "root?q=престариум" },
          { name: "Пролатан", link: url.replace('lekarstva-i-badi/','') + "root?q=пролатан" },
          { name: "Пропанорм", link: url.replace('lekarstva-i-badi/','') + "root?q=пропанорм" },
          { name: "Румалон", link: url.replace('lekarstva-i-badi/','') + "root?q=румалон" },
          { name: "Сингуляр", link: url.replace('lekarstva-i-badi/','') + "root?q=сингуляр" },
          { name: "Сиофор", link: url.replace('lekarstva-i-badi/','') + "root?q=сиофор" },
          { name: "Спирива", link: url.replace('lekarstva-i-badi/','') + "root?q=спирива" },
          { name: "Супрастин", link: url.replace('lekarstva-i-badi/','') + "root?q=супрастин" },
          { name: "Танакан", link: url.replace('lekarstva-i-badi/','') + "root?q=танакан" },
          { name: "Тауфон", link: url.replace('lekarstva-i-badi/','') + "root?q=тауфон" },
          { name: "Тафлотан", link: url.replace('lekarstva-i-badi/','') + "root?q=тафлотан" },
          { name: "Терафлекс", link: url.replace('lekarstva-i-badi/','') + "root?q=терафлекс" },
          { name: "Траватан", link: url.replace('lekarstva-i-badi/','') + "root?q=траватан" },
          { name: "Тражента", link: url.replace('lekarstva-i-badi/','') + "root?q=тражента" },
          { name: "Трайкор", link: url.replace('lekarstva-i-badi/','') + "root?q=трайкор" },
          { name: "Трентал", link: url.replace('lekarstva-i-badi/','') + "root?q=трентал" },
          { name: "рипликсам", link: url.replace('lekarstva-i-badi/','') + "root?q=трипликсам" },
          { name: "Троксевазин", link: url.replace('lekarstva-i-badi/','') + "root?q=троксевазин" },
          { name: "Урсосан", link: url.replace('lekarstva-i-badi/','') + "root?q=урсосан" },
          { name: "Урсофальк", link: url.replace('lekarstva-i-badi/','') + "root?q=урсофальк" },
          { name: "Утрожестан", link: url.replace('lekarstva-i-badi/','') + "root?q=утрожестан" },
          { name: "Фезам", link: url.replace('lekarstva-i-badi/','') + "root?q=фезам" },
          { name: "Фемостон", link: url.replace('lekarstva-i-badi/','') + "root?q=фемостон" },
          { name: "Флебодиа", link: url.replace('lekarstva-i-badi/','') + "root?q=флебодиа" },
          { name: "Форсига", link: url.replace('lekarstva-i-badi/','') + "root?q=форсига" },
          { name: "Фосфоглив", link: url.replace('lekarstva-i-badi/','') + "root?q=фосфоглив" },
          { name: "Хондрогард", link: url.replace('lekarstva-i-badi/','') + "root?q=хондрогард" },
          { name: "Цераксон", link: url.replace('lekarstva-i-badi/','') + "root?q=цераксон" },
          { name: "Церебролизин", link: url.replace('lekarstva-i-badi/','') + "root?q=церебролизин" },
          { name: "Церетон", link: url.replace('lekarstva-i-badi/','') + "root?q=церетон" },
          { name: "Эгилок", link: url.replace('lekarstva-i-badi/','') + "root?q=эгилок" },
          { name: "Эдарби", link: url.replace('lekarstva-i-badi/','') + "root?q=эдарби" },
          { name: "Эзетрол", link: url.replace('lekarstva-i-badi/','') + "root?q=эзетрол" },
          { name: "Эквамер", link: url.replace('lekarstva-i-badi/','') + "root?q=эквамер" },
          { name: "Экватор", link: url.replace('lekarstva-i-badi/','') + "root?q=экватор" },
          { name: "Элевит", link: url.replace('lekarstva-i-badi/','') + "root?q=элевит" },
          { name: "Эликвис", link: url.replace('lekarstva-i-badi/','') + "root?q=эликвис" },
          { name: "Эспиро", link: url.replace('lekarstva-i-badi/','') + "root?q=эспиро" },
          { name: "Эссенциале", link: url.replace('lekarstva-i-badi/','') + "root?q=эссенциале" },
          { name: "Энзистал", link: url.replace('lekarstva-i-badi/','') + "root?q=энзистал" },
          { name: "Энтерофурил", link: url.replace('lekarstva-i-badi/','') + "root?q=энтерофурил" },
          { name: "Эпиген", link: url.replace('lekarstva-i-badi/','') + "root?q=эпиген" },
          { name: "Юперио", link: url.replace('lekarstva-i-badi/','') + "root?q=юперио" },
          { name: "Янувия", link: url.replace('lekarstva-i-badi/','') + "root?q=янувия" },
         { name: "Ярина", link: url.replace('lekarstva-i-badi/','') + "root?q=ярина" },
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

        while (true) {
        await sleep(Math.random() * 31.645344);
        const href = subCat.link;
        if(page === 1) {
        if(String(href).includes("root")) {
          const link = String(href);
          await tab.GoTo(link);
        }
        else {
          const link = "https://aptekiplus.ru" + href;
          await tab.GoTo(link);
        }
      }
      else {
        if(String(href).includes("root")) {
          const link = String(href).replace("root","root/" + page + "/");
          await tab.GoTo(link);
        }
        else {
          const link = "https://aptekiplus.ru" + href + page;
          await tab.GoTo(link);
        }
      }
        await sleep(Math.random() * 29.237653);

        const text = await tab.Evaluate(async () => document.body.innerHTML);
        const body = parse(text);
        parser.ParseItems(text);
        if(body.innerHTML.includes("ничего не найдено")) {break;}
        await sleep(5);
        page++;
        let properties = body.querySelectorAll("div.catalog > .product-card.product-card--line > div.product-card__inner");
        if(properties.length === 0) {
          break;
        }
        // let elements = body.querySelector("ol.pagination > li:nth-last-child(2) > button > span");
        // if(!elements) {break;}
        // let page = Number(elements.innerHTML);
        // console.log(page);
        // if(page > 1000) {break;}

        // for(let i = 1; i < page; i++) {
        //   const text = await tab.Evaluate(async () => document.body.innerHTML);
        //   await sleep(10);
        //   parser.ParseItems(text);

        //   if(pages < 6) {
        //   if(page < pages) break;
        //   await tab.Click("ol.pagination > li:nth-child(" + pages + ") > button");
        //   await sleep(5);
        //   } else {
        //     await tab.Click("ol.pagination > li:nth-child(" + 6 + ") > button");
        //     await sleep(5);
        //   }
        //   pages++;
        // }
        //break;
        }
        await sleep(5);
      }
    }
  },
});

export default config;
