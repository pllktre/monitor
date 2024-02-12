import type { InitParserConfig } from "../components/parsing";
import { parse } from "node-html-parser";
import { create_tab } from "../extension/background";
import { nothing, sleep } from "../components/utils";

export const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 433,
  itemSelector: "#catalog-list > div",
  itemParams: {
    name: ["div.product-info.d-flex-class > p > a"],
    price: ["p.product-price"],
    contextID: ["div > a", "href", [/\/drugs\/(\d*)/g, 1]],
  },
  func: async () => {
    const tab = await create_tab("https://stolichki.ru/?utm_referrer=https://stolichki.ru/");
    await sleep(4);
    await tab.WaitSelector("button.headerButton");
    await tab.Click("button.headerButton");
    await sleep(4);
    await tab.Evaluate((city) => {
      const list = document.querySelectorAll<HTMLLabelElement>(
        "#popupTownChoose > div > div > form > ul span.popupTownChoose__town"
      );

      for (const e of list) {
        if (e.textContent && e.textContent.trim() === city) {
          e.click();
          return;
        }
      }
    }, parser.params.city);

    //await sleep(4);
    //const url = await tab.GetUrl();
    //await tab.GoTo("https://stolichki.ru/catalog");

    await sleep(10);

    const categories = await tab.Evaluate(() => {
      // const list = document.querySelectorAll<HTMLLabelElement>(
      //   "div.categoryList__item > div.itemContentMore > ul > li > a"
      // );
      const links = [];
      links.push(
        { name: "Мезим", link: "search?name=мезим" },
        { name: "Accu-chek", link: "search?name=accu-chek" },
        { name: "One touch", link: "search?name=one+touch" },
        { name: "Авамис", link: "search?name=авамис" },
        { name: "Адвантан", link: "search?name=адвантан" },
        { name: "Азарга", link: "search?name=азарга" },
        { name: "Аденурик", link: "search?name=аденурик" },
        { name: "Азопт", link: "search?name=азопт" },
        { name: "Актрапид", link: "search?name=актрапид" },
        { name: "Аллапинин", link: "search?name=аллапинин" },
        { name: "Араферон", link: "search?name=анаферон" },
        { name: "Акатинол", link: "search?name=акатинол" },
        { name: "Акнекутан", link: "search?name=акнекутан" },
        { name: "Апроваск", link: "search?name=апроваск" },
        { name: "Апровель", link: "search?name=апровель" },
        { name: "Арифам", link: "search?name=арифам" },
        { name: "Актовегин", link: "search?name=актовегин" },
        { name: "АЦЦ", link: "search?name=ацц" },
        { name: "Алфлутоп", link: "search?name=алфлутоп" },
        { name: "Альфаган", link: "search?name=альфаган" },
        { name: "Протефикс", link: "search?name=протефикс" },
        { name: "Президент", link: "search?name=президент" },
        { name: "Арифон", link: "search?name=арифон" }, 
        { name: "Амарил", link: "search?name=амарил" },
        { name: "Анжелик", link: "search?name=анжелик" },
        { name: "Атаканд", link: "search?name=атаканд" },
        { name: "Аторис", link: "search?name=аторис" },
        { name: "Афобазол", link: "search?name=афобазол" },
        { name: "Белара", link: "search?name=белара" },
        { name: "Берлитион", link: "search?name=берлитион" },
        { name: "Белодуал", link: "search?name=белодуал" },
        { name: "Беталок", link: "search?name=беталок" },
        { name: "Бетасерк", link: "search?name=бетасерк" },
        { name: "Бетоптик", link: "search?name=бетоптик" },
        { name: "Бонвива", link: "search?name=бонвива" },
        { name: "Брилинта", link: "search?name=брилинта" },
        { name: "Валосердин", link: "search?name=валосердин" },
        { name: "Верошпирон", link: "search?name=верошпирон" },
        { name: "Валтрекс", link: "search?name=валтрекс" },
        { name: "Вессел", link: "search?name=вессел" },
        { name: "Вальсакор", link: "search?name=вальсакор" },
        { name: "Вамлосет", link: "search?name=вамлосет" },
        { name: "Визанна", link: "search?name=визанна" },
        { name: "Випромет", link: "search?name=випромет" },
        { name: "Випдомет", link: "search?name=випдомет" },
        { name: "Витапрост", link: "search?name=витапрост" },
        { name: "Випидия", link: "search?name=випидия" },
        { name: "Галвус", link: "search?name=галвус" },
        { name: "Гептрал", link: "search?name=гептрал" },
        { name: "Ганфорт", link: "search?name=ганфорт" },
        { name: "Глаупрост", link: "search?name=глаупрост" },
        { name: "Глиатилин", link: "search?name=глиатилин" },
        { name: "Глибомет", link: "search?name=глибомет" },
        { name: "Гипосарт", link: "search?name=гипосарт" },
        { name: "Глюкованс", link: "search?name=глюкованс" },
        { name: "Глюкофаж", link: "search?name=глюкофаж" },
        { name: "Гевискон", link: "search?name=гевискон" },
        { name: "Детралекс", link: "search?name=детралекс" },
        { name: "Джес", link: "search?name=джес" },
        { name: "Диабетон", link: "search?name=диабетон" },
        { name: "Джардинс", link: "search?name=джардинс" },
        { name: "Цитовир", link: "search?name=цитовир" },
        { name: "Диане", link: "search?name=диане" },
        { name: "Димиа", link: "search?name=димиа" },
        { name: "Денол", link: "search?name=денол" },
        { name: "Диротон", link: "search?name=диротон" },
        { name: "Диувер", link: "search?name=диувер" },
        { name: "Дона", link: "search?name=дона" },
        { name: "Дорзопт", link: "search?name=дорзопт" },
        { name: "Драстоп", link: "search?name=драстоп" },
        { name: "Достинекс", link: "search?name=достинекс" },
        { name: "Дуотрав", link: "search?name=дуотрав" },
        { name: "Дюспаталин", link: "search?name=дюспаталин" },
        { name: "Дюфалак", link: "search?name=дюфалак" },
        { name: "Дуопрост", link: "search?name=дуопрост" },
        { name: "Дюфастон", link: "search?name=дюфастон" },
        { name: "Жанин", link: "search?name=жанин" },
        { name: "Индинол", link: "search?name=индинол" },
        { name: "Ирифрин", link: "search?name=ирифрин" },
        { name: "Изофра", link: "search?name=изофра" },
        { name: "Инспра", link: "search?name=инспра" },
        { name: "Зилт", link: "search?name=зилт" },
        { name: "Кардиомагнил", link: "search?name=кардиомагнил" },
        { name: "Коапровель", link: "search?name=коапровель" },
        { name: "Калькарея", link: "search?name=калькарея" },
        { name: "Каталин", link: "search?name=каталин" },
        { name: "Ко-вамлосет", link: "search?name=вамлосет" },
        { name: "Клайра", link: "search?name=клайра" },
        { name: "Климонорм", link: "search?name=климонорм" },
        { name: "Комбилипен", link: "search?name=комбилипен" },
        { name: "Конкор", link: "search?name=конкор" },
        { name: "Коплавикс", link: "search?name=коплавикс" },
        { name: "Кораксан", link: "search?name=кораксан" },
        { name: "Кордарон", link: "search?name=кордарон" },
        { name: "Комбиган", link: "search?name=комбиган" },
        { name: "Корега", link: "search?name=корега" },
        { name: "Капотен", link: "search?name=капотен" },
        { name: "Ко-перинева", link: "search?name=перинева" },
        { name: "Ко-ренитек", link: "search?name=ренитек" },
        { name: "Креон", link: "search?name=креон" },
        { name: "Коронал", link: "search?name=коронал" },
        { name: "Корнерегель", link: "search?name=корнерегель" },
        { name: "Кортексин", link: "search?name=кортексин" },
        { name: "Кординик", link: "search?name=кординик" },
        { name: "Косопт", link: "search?name=косопт" },
        { name: "Косопт", link: "search?name=канефрон" },
        { name: "Крестор", link: "search?name=крестор" },
        { name: "Ксалаком", link: "search?name=ксалаком" },
        { name: "Ксалатан", link: "search?name=ксалатан" },
        { name: "Ксарелто", link: "search?name=ксарелто" },
        { name: "Леркамен", link: "search?name=леркамен" },
        { name: "Линдинет", link: "search?name=линдинет" },
        { name: "Лозартан", link: "search?name=Лозартан" },
        { name: "Липримар", link: "search?name=липримар" },
        { name: "Лориста", link: "search?name=лориста" },
        { name: "Лортенза", link: "search?name=лортенза" },
        { name: "Лозап", link: "search?name=лозап" },
        { name: "Люксфен", link: "search?name=люксфен" },
        { name: "Мексидол", link: "search?name=мексидол" },
        { name: "Мемантин", link: "search?name=мемантин" },
        { name: "Мертенил", link: "search?name=мертенил" },
        { name: "Метилурацил", link: "search?name=метилурацил" },
        { name: "Метформин", link: "search?name=метформин+лонг" },
        { name: "Мидиана", link: "search?name=мидиана" },
        { name: "Мидокалм", link: "search?name=мидокалм" },
        { name: "Мильгамма", link: "search?name=мильгамма" },
        { name: "Милдронат", link: "search?name=милдронат" },
        { name: "Мовалис", link: "search?name=мовалис" },
        { name: "Магне", link: "search?name=магне" },
        { name: "Мемантинол", link: "search?name=мемантинол" },
        { name: "Назонекс", link: "search?name=назонекс" },
        { name: "Найз", link: "/search?name=найз" },
        { name: "Небилет", link: "search?name=небилет" },
        { name: "Нейромидин", link: "search?name=нейромидин" },
        { name: "Нифекард", link: "search?name=нифекард" },
        { name: "Нолипрел", link: "search?name=нолипрел" },
        { name: "Овестин", link: "search?name=овестин" },
        { name: "Омник", link: "search?name=омник" },
        { name: "Офтан", link: "search?name=офтан" },
        { name: "Офтолик", link: "search?name=офтолик" },
        { name: "Панангин", link: "search?name=панангин" },
        { name: "Пенталгин", link: "search?name=пенталгин" },
        { name: "Плавикс", link: "search?name=плавикс" },
        { name: "Полиоксидоний", link: "search?name=полиоксидоний" },
        { name: "Прадакса", link: "search?name=прадакса" },
        { name: "Предуктал", link: "search?name=предуктал" },
        { name: "Престанс", link: "search?name=престанс" },
        { name: "Престариум", link: "search?name=престариум" },
        { name: "Пролатан", link: "search?name=пролатан" },
        { name: "Пропанорм", link: "search?name=пропанорм" },
        { name: "Румалон", link: "search?name=румалон" },
        { name: "Сингуляр", link: "search?name=сингуляр" },
        { name: "Сиофор", link: "search?name=сиофор" },
        { name: "Спирива", link: "search?name=спирива" },
        { name: "Супрастин", link: "search?name=супрастин" },
        { name: "Танакан", link: "search?name=танакан" },
        { name: "Тауфон", link: "search?name=тауфон" },
        { name: "Тафлотан", link: "search?name=тафлотан" },
        { name: "Терафлекс", link: "search?name=терафлекс" },
        { name: "Траватан", link: "search?name=траватан" },
        { name: "Тражента", link: "search?name=тражента" },
        { name: "Трайкор", link: "search?name=трайкор" },
        { name: "Трентал", link: "search?name=трентал" },
        { name: "рипликсам", link: "search?name=трипликсам" },
        { name: "Троксевазин", link: "search?name=троксевазин" },
        { name: "Урсосан", link: "search?name=урсосан" },
        { name: "Урсофальк", link: "search?name=урсофальк" },
        { name: "Утрожестан", link: "search?name=утрожестан" },
        { name: "Фезам", link: "search?name=фезам" },
        { name: "Фестал", link: "search?name=фестал" },
        { name: "Фемостон", link: "search?name=фемостон" },
        { name: "Флебодиа", link: "search?name=флебодиа" },
        { name: "Форсига", link: "search?name=форсига" },
        { name: "Фосфоглив", link: "search?name=фосфоглив" },
        { name: "Хондрогард", link: "search?name=хондрогард" },
        { name: "Цераксон", link: "search?name=цераксон" },
        { name: "Церебролизин", link: "search?name=церебролизин" },
        { name: "Церетон", link: "search?name=церетон" },
        { name: "Эгилок", link: "search?name=эгилок" },
        { name: "Эдарби", link: "search?name=эдарби" },
        { name: "Эзетрол", link: "search?name=эзетрол" },
        { name: "Эквамер", link: "search?name=эквамер" },
        { name: "Экватор", link: "search?name=экватор" },
        { name: "Элевит", link: "search?name=элевит" },
        { name: "Эликвис", link: "search?name=эликвис" },
        { name: "Эспиро", link: "search?name=эспиро" },
        { name: "Эссенциале", link: "search?name=эссенциале" },
        { name: "Энзистал", link: "search?name=энзистал" },
        { name: "Энтерофурил", link: "search?name=энтерофурил" },
        { name: "Эпиген", link: "search?name=эпиген" },
        { name: "Юперио", link: "search?name=юперио" },
        { name: "янувия", link: "search?name=янувия" },
        { name: "ярина", link: "search?name=ярина" },
        { name: "бетофтан", link: "search?name=бетофтан" },
        { name: "мовалис", link: "search?name=мовалис" },
        { name: "найз", link: "search?name=найз" },
        { name: "омакор", link: "search?name=омакор" },
        { name: "отрио", link: "search?name=отрио" },
        { name: "офтан", link: "search?name=офтан" },
        { name: "плагрил", link: "search?name=плагрил" },
        { name: "престанс", link: "search?name=престанс" },
        { name: "престилол", link: "search?name=престилол" },
        { name: "регулон", link: "search?name=регулон" },
        { name: "розувастатин", link: "search?name=розувастатин" },
        { name: "розукард", link: "search?name=розукард" },
        { name: "роксера", link: "search?name=роксера" },
        { name: "симбикорт", link: "search?name=симбикорт" },
        { name: "сотрет", link: "search?name=сотрет" },
        { name: "спирива", link: "search?name=спирива" },
        { name: "тевастор", link: "search?name=тевастор" },
        { name: "телзап", link: "search?name=телзап" },
        { name: "тражента", link: "search?name=тражента" },
        { name: "три-регол", link: "search?name=три-регол" },
        { name: "тромбитал", link: "search?name=тромбитал" },
        { name: "тромбо", link: "search?name=тромбо" },
        { name: "физиотенз", link: "search?name=физиотенз" },
        { name: "форадил", link: "search?name=форадил" },
        { name: "хлое", link: "search?name=хлое" },
        { name: "хондролон", link: "search?name=хондролон" },
        { name: "хумулин", link: "search?name=хумулин" },
        { name: "цераксон", link: "search?name=цераксон" },
        { name: "церетон", link: "search?name=церетон" },
        { name: "эксфорж", link: "search?name=эксфорж" },
        { name: "элевит", link: "search?name=элевит" },
        { name: "энап", link: "search?name=энап" },
        { name: "Энлигрия", link: "search?name=энлигрия" },
      );
      // for (const e of list) {
      //   if (e.textContent) {
      //     console.log(e.textContent.trim())
      //     if(e.textContent.trim() !=='Ароматерапия' && e.textContent.trim() !=='Гигиена' && e.textContent.trim() !== 'Компрессионное и корректирующее белье'
      //     && e.textContent.trim() !=='Хозяйственные товары' && e.textContent.trim() !=='Лубриканты, смазки' && e.textContent.trim() !=='Красота'
      //     && e.textContent.trim() !=='Медицинские изделия и расходные материалы' && e.textContent.trim() !=='Оптика' && e.textContent.trim() !=='Товары спортивной медицины'
      //     && e.textContent.trim() !=='Декоративная косметика' && e.textContent.trim() !=='Солнечная серия' && e.textContent.trim() !=='Фиточаи'
      //     && e.textContent.trim() !=='Питательные смеси' && e.textContent.trim() !=='Стоматология' && e.textContent.trim() !=='Бытовая химия'
      //     && e.textContent.trim() !=='Все для кормления ребенка' && e.textContent.trim() !=='Все для купания ребенка' && e.textContent.trim() !=='Детская медицинская и бытовая техника'
      //     && e.textContent.trim() !=='Детское питание' && e.textContent.trim() !=='Репеленты' && e.textContent.trim() !=='Средства безопасности'
      //     && e.textContent.trim() !=='Здоровое питание и напитки' && e.textContent.trim() !=='Зоотовары' && e.textContent.trim() !=='Печатные издания'
      //     ) {
      //     links.push({
      //       name: e.textContent.trim(),
      //       link: e.getAttribute("href"),
      //     });
      //   }
      //   }
      // }

      return links;
    });

    console.log("BEBQ", categories);

    for (const cat of categories) {
      console.log("Start parse category", cat.name);

      let page = 1;
      while (true) {
        await sleep(Math.random() * 26.1233);
        const href = cat.link;
        const link = "https://stolichki.ru/" + href + "&page=" + page;
        await tab.GoTo(link);
        await sleep(Math.random() * 38.256);
        await tab.WaitSelector("#catalog-list > div");
        const text = await tab.Evaluate(async () => document.body.innerHTML);
        const body = parse(text);
        if(body.innerHTML.includes("По Вашему запросу ничего не найдено")) {break;}
        parser.ParseItems(text);

        if (
          page > 100 ||
          !body.querySelector(
            "#products-paginator > div > ul > li.paging-list__item.paging-next > a"
          )
        ) {
          break;
        }

       page++;
      }

      await sleep(Math.random() * 38.256);
    }
  },
});

export default config;
