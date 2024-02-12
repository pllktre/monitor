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

    // const currentCity = await tab.GetHTML(CURRENT_CITY);

    // console.log("Current city:", currentCity.trim());
    // console.log("Target city:", parser.params.city);
    // await sleep(2);
    // if (currentCity.trim() !== parser.params.city) {
    //   await tab.Click(CHANGE_CITY);
    //   await sleep(2);
    //   await tab.Click("div.sc-38a13369-0.bJkvCr");
    //   await sleep(2);
    //   await tab.Evaluate(async (city) => {
    //     const input = <HTMLInputElement>(
    //       document.querySelector(
    //         "div.Modal_modal-wrapper__uedko > div.Modal_modal-inner__XiRET > div >  div:nth-child(2) > div > div > div.TextField_text-field-wrap__iqiLJ > input"
    //       )
    //     );
    //     input.value = city;
    //     input.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true }));
    //     input.dispatchEvent(new KeyboardEvent("keypress", { bubbles: true }));
    //     input.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
    //     input.dispatchEvent(new Event("focus", { bubbles: true }));
    //     input.dispatchEvent(new Event("input", { bubbles: true }));
    //     input.dispatchEvent(new Event("change", { bubbles: true }));
    //   }, parser.params.city);
    //   await sleep(5);
    //   await tab.Evaluate(async (city) => {
    //     const cityList = document.querySelectorAll<HTMLAnchorElement>(
    //       ".sc-38a13369-2.coa-dvq > li > div"
    //     );
    //     for (const ce of cityList) {
    //       if (ce.textContent && ce.textContent.trim() === city) {
    //         ce.click();
    //         return;
    //       }
    //     }
    //   }, parser.params.city);
    //   await sleep(4);
    //   await tab.Click("div.Modal_modal-inner__XiRET > div > div:nth-child(3) > button");
    //   await sleep(4);
    // } else {
    //   console.log("It's ok");
    // }

    await sleep(10);
    const categories = await tab.Evaluate(() => {
      // const list = document.querySelectorAll<HTMLLabelElement>(
      //   "div.Nav_nav__93oCw > div.Container_container__f9MJQ > nav.Nav_nav-container__BxT_v > div.Nav_nav-list__mvHky > a"
      // );
      const links = [];
      links.push(
        { name: "лактожиналь", link: "лактожиналь" },
        { name: "лактонорм", link: "лактонорм" },
        { name: "лактофильтрум", link: "лактофильтрум" },
        { name: "ламиктал", link: "ламиктал" },
        { name: "ларигама", link: "ларигама" },
        { name: "левомеколь", link: "левомеколь" },
        { name: "левометил", link: "левометил" },
        { name: "левофлоксацин", link: "левофлоксацин" },
        { name: "левросо", link: "левросо" },
        { name: "леди-с", link: "леди-с" },
        { name: "леркамен", link: "леркамен" },
        { name: "лизобакт", link: "лизобакт" },
        { name: "ликопид", link: "ликопид" },
        { name: "лимфомиозот", link: "лимфомиозот" },
        { name: "линдинет", link: "линдинет" },
        { name: "лиотон", link: "лиотон" },
        { name: "липобейз", link: "липобейз" },
        { name: "липотропный", link: "липотропный" },
        { name: "липримар", link: "липримар" },
        { name: "логест", link: "логест" },
        { name: "лодоз", link: "лодоз" },
        { name: "лозап", link: "лозап" },
        { name: "лозартан", link: "лозартан" },
        { name: "лозартан-н", link: "лозартан-н" },
        { name: "лоперамид", link: "лоперамид" },
        { name: "лориста", link: "лориста" },
        { name: "лортенза", link: "лортенза" },
        { name: "люксфен", link: "люксфен" },
        { name: "магне", link: "магне" },
        { name: "магнерот", link: "магнерот" },
        { name: "максиколд", link: "максиколд" },
        { name: "манинил", link: "манинил" },
        { name: "мастодинон", link: "мастодинон" },
        { name: "мезим", link: "мезим" },
        { name: "мексидол", link: "мексидол" },
        { name: "мелатонин", link: "мелатонин" },
        { name: "мемантинол", link: "мемантинол" },
        { name: "меновазин", link: "меновазин" },
        { name: "мертенил", link: "мертенил" },
        { name: "метадоксил", link: "метадоксил" },
        { name: "метилурацил", link: "метилурацил" },
        { name: "метилурациловая", link: "метилурациловая" },
        { name: "метипред", link: "метипред" },
        { name: "метформин", link: "метформин" },
        { name: "метформин-рихтер", link: "метформин-рихтер" },
        { name: "мидзо", link: "мидзо" },
        { name: "мидиана", link: "мидиана" },
        { name: "мидокалм", link: "мидокалм" },
        { name: "мидокалм-рихтер", link: "мидокалм-рихтер" },
        { name: "микардис", link: "микардис" },
        { name: "микразим", link: "микразим" },
        { name: "милдронат", link: "милдронат" },
        { name: "милурит", link: "милурит" },
        { name: "мильгамма", link: "мильгамма" },
        { name: "мовалис", link: "мовалис" },
        { name: "момат", link: "момат" },
        { name: "моночинкве", link: "моночинкве" },
        { name: "мукоза", link: "мукоза" },
        { name: "мукосат", link: "мукосат" },
        { name: "мультифлора", link: "мультифлора" },
        { name: "муравьиный", link: "муравьиный" },
        { name: "назонекс", link: "назонекс" },
        { name: "найз", link: "найз" },
        { name: "насобек", link: "насобек" },
        { name: "нафтизин", link: "нафтизин" },
        { name: "наш", link: "наш" },
        { name: "небиволол-тева", link: "небиволол-тева" },
        { name: "небилет", link: "небилет" },
        { name: "нейромидин", link: "нейромидин" },
        { name: "нео-пенотран", link: "нео-пенотран" },
        { name: "ниаспам", link: "ниаспам" },
        { name: "никуриллы", link: "никуриллы" },
        { name: "нимесулид", link: "нимесулид" },
        { name: "нифекард", link: "нифекард" },
        { name: "новинет", link: "новинет" },
        { name: "нольпаза", link: "нольпаза" },
        { name: "норваск", link: "норваск" },
        { name: "нормобакт", link: "нормобакт" },
        { name: "нормодипин", link: "нормодипин" },
        { name: "но-шпа", link: "но-шпа" },
        { name: "нурофаст", link: "нурофаст" },
        { name: "нурофен", link: "нурофен" },
        { name: "облепиховое", link: "облепиховое" },
        { name: "овестин", link: "овестин" },
        { name: "оксифрин", link: "оксифрин" },
        { name: "октенисепт", link: "октенисепт" },
        { name: "олеос", link: "олеос" },
        { name: "олиджим", link: "олиджим" },
        { name: "омакор", link: "омакор" },
        { name: "омез", link: "омез" },
        { name: "омепразол", link: "омепразол" },
        { name: "омник", link: "омник" },
        { name: "онихелп", link: "онихелп" },
        { name: "отрио", link: "отрио" },
        { name: "офтальмоферон", link: "офтальмоферон" },
        { name: "пк-мерц", link: "пк-мерц" },
        { name: "плавикс", link: "плавикс" },
        { name: "плагрил", link: "плагрил" },
        { name: "плетакс", link: "плетакс" },
        { name: "полидекса", link: "полидекса" },
        { name: "полиоксидоний", link: "полиоксидоний" },
        { name: "прадакса", link: "прадакса" },
        { name: "предуктал", link: "предуктал" },
        { name: "престанс", link: "престанс" },
        { name: "престариум", link: "престариум" },
        { name: "престилол", link: "престилол" },
        { name: "прогинова", link: "прогинова" },
        { name: "прожестожель", link: "прожестожель" },
        { name: "прокто-гливенол", link: "прокто-гливенол" },
        { name: "пролатан", link: "пролатан" },
        { name: "офтан", link: "офтан" },
        { name: "офтолик", link: "офтолик" },
        { name: "панавир", link: "панавир" },
        { name: "панангин", link: "панангин" },
        { name: "пантокальцин", link: "пантокальцин" },
        { name: "панцеф", link: "панцеф" },
        { name: "пенталгин", link: "пенталгин" },
        { name: "пентоксифиллин", link: "пентоксифиллин" },
        { name: "периндоприл", link: "периндоприл" },
        { name: "периндоприл-тева", link: "периндоприл-тева" },
        { name: "пилобакт", link: "пилобакт" },
        { name: "пиносол", link: "пиносол" },
        { name: "пиридоксина", link: "пиридоксина" },
        { name: "пирогенал", link: "пирогенал" },
        { name: "офтан", link: "офтан" },
        { name: "пропанорм", link: "пропанорм" },
        { name: "простамол", link: "простамол" },
        { name: "протафан", link: "протафан" },
        { name: "рабепразол-сз", link: "рабепразол-сз" },
        { name: "раеном", link: "раеном" },
        { name: "рамазид", link: "рамазид" },
        { name: "расторопша-парафарм", link: "расторопша-парафарм" },
        { name: "реаферон-липинт", link: "реаферон-липинт" },
        { name: "ревмафлекс", link: "ревмафлекс" },
        { name: "реглисам", link: "реглисам" },
        { name: "регулон", link: "регулон" },
        { name: "релиф", link: "релиф" },
        { name: "ренгалин", link: "ренгалин" },
        { name: "ренни", link: "ренни" },
        { name: "рибоксин", link: "рибоксин" },
        { name: "ригевидон", link: "ригевидон" },
        { name: "риксия", link: "риксия" },
        { name: "рингер-солофарм", link: "рингер-солофарм" },
        { name: "ринобакт", link: "ринобакт" },
        { name: "ринорус", link: "ринорус" },
        { name: "риностоп", link: "риностоп" },
        { name: "риолма", link: "риолма" },
        { name: "роаккутан", link: "роаккутан" },
        { name: "розарт", link: "розарт" },
        { name: "розистарк", link: "розистарк" },
        { name: "розувастатин-канон", link: "розувастатин-канон" },
        { name: "розувастатин-сз", link: "розувастатин-сз" },
        { name: "розувастатин-тева", link: "розувастатин-тева" },
        { name: "солгар", link: "солгар+бромелайн" },
        { name: "солгар витамин", link: "солгар+витамин" },
        { name: "солгар двойная", link: "солгар+двойная" },
        { name: "солгар кангавитес", link: "солгар+кангавитес" },
        { name: "солгар кожа", link: "солгар+кожа" },
        { name: "солгар комплекс", link: "солгар+комплекс" },
        { name: "солгар легкодоступное", link: "солгар+легкодоступное" },
        { name: "солгар мульти", link: "солгар+мульти" },
        { name: "солгар фолат(метафолин)", link: "солгар+фолат" },
        { name: "солгар холин/инозитол", link: "солгар+холин" },
        { name: "солгар эстер-с", link: "солгар+эстер-с" },
        { name: "розукард", link: "розукард" },
        { name: "розулип", link: "розулип" },
        { name: "рокона", link: "рокона" },
        { name: "роксатенз-инда", link: "роксатенз-инда" },
        { name: "роксера", link: "роксера" },
        { name: "ролитен", link: "ролитен" },
        { name: "ротапрост", link: "ротапрост" },
        { name: "румалон", link: "румалон" },
        { name: "сейзар", link: "сейзар" },
        { name: "селектра", link: "селектра" },
        { name: "селенцин", link: "селенцин" },
        { name: "селенцин", link: "селенцин" },
        { name: "сероквель", link: "сероквель" },
        { name: "силденафил", link: "силденафил" },
        { name: "силует", link: "силует" },
        { name: "симбикорт", link: "симбикорт" },
        { name: "сингуляр", link: "сингуляр" },
        { name: "синупрет", link: "синупрет" },
        { name: "сиофор", link: "сиофор" },
        { name: "систейн", link: "систейн" },
        { name: "скин-кап", link: "скин-кап" },
        { name: "смекта", link: "смекта" },
        { name: "солиан", link: "солиан" },
        { name: "сонирид", link: "сонирид" },
        { name: "сорбифер", link: "сорбифер" },
        { name: "сотагексал", link: "сотагексал" },
        { name: "соталол", link: "соталол" },
        { name: "сотрет", link: "сотрет" },
        { name: "спазмалгон", link: "спазмалгон" },
        { name: "спарекс", link: "спарекс" },
        { name: "специальное", link: "специальное" },
        { name: "спирива", link: "спирива" },
        { name: "спиронолактон", link: "спиронолактон" },
        { name: "стрепсилс", link: "стрепсилс" },
        { name: "строметта", link: "строметта" },
        { name: "сувардио", link: "сувардио" },
        { name: "суматриптан-тева", link: "суматриптан-тева" },
        { name: "суперлимф", link: "суперлимф" },
        { name: "супрастин", link: "супрастин" },
        { name: "таваник", link: "таваник" },
        { name: "тайм", link: "тайм" },
        { name: "танакан", link: "танакан" },
        { name: "тантум", link: "тантум" },
        { name: "тардиферон", link: "тардиферон" },
        { name: "тауфон", link: "тауфон" },
        { name: "тафлотан", link: "тафлотан" },
        { name: "тебантин", link: "тебантин" },
        { name: "тевастор", link: "тевастор" },
        { name: "розукард", link: "розукард" },
        { name: "тевастор", link: "тевастор" },
        { name: "телзап", link: "телзап" },
        { name: "тералиджен", link: "тералиджен" },
        { name: "терафлекс", link: "терафлекс" },
        { name: "тержинан", link: "тержинан" },
        { name: "тиогамма", link: "тиогамма" },
        { name: "тиоктацид", link: "тиоктацид" },
        { name: "тиоктовая", link: "тиоктовая" },
        { name: "тиотриазолин", link: "тиотриазолин" },
        { name: "тирозол", link: "тирозол" },
        { name: "тобрадекс", link: "тобрадекс" },
        { name: "торасемид-сз", link: "торасемид-сз" },
        { name: "торвакард", link: "торвакард" },
        { name: "тотема", link: "тотема" },
        { name: "траватан", link: "траватан" },
        { name: "тражента", link: "тражента" },
        { name: "трайкор", link: "трайкор" },
        { name: "трентал", link: "трентал" },
        { name: "трентал-400", link: "трентал-400" },
        { name: "тридерм", link: "тридерм" },
        { name: "тримедат", link: "тримедат" },
        { name: "триметазидин", link: "триметазидин" },
        { name: "трипликсам", link: "трипликсам" },
        { name: "три-регол", link: "три-регол" },
        { name: "трихопол", link: "трихопол" },
        { name: "троксактив", link: "троксактив" },
        { name: "троксевазин", link: "троксевазин" },
        { name: "тромбитал", link: "тромбитал" },
        { name: "тромбо", link: "тромбо" },
        { name: "уро-ваксом", link: "уро-ваксом" },
        { name: "уротол", link: "уротол" },
        { name: "урсодез", link: "урсодез" },
        { name: "урсодезоксихолевая", link: "урсодезоксихолевая" },
        { name: "урсосан", link: "урсосан" },
        { name: "урсофальк", link: "урсофальк" },
        { name: "утрожестан", link: "утрожестан" },
        { name: "фавирокс", link: "фавирокс" },
        { name: "феварин", link: "феварин" },
        { name: "фезам", link: "фезам" },
        { name: "фемостон", link: "фемостон" },
        { name: "фенибут", link: "фенибут" },
        { name: "фенкарол", link: "фенкарол" },
        { name: "ферлатум", link: "ферлатум" },
        { name: "фестал", link: "фестал" },
        { name: "физиотенз", link: "физиотенз" },
        { name: "финалгель", link: "финалгель" },
        { name: "фитомуцил", link: "фитомуцил" },
        { name: "фламадекс", link: "фламадекс" },
        { name: "флебодиа", link: "флебодиа" },
        { name: "флемоксин", link: "флемоксин" },
        { name: "флуимуцил", link: "флуимуцил" },
        { name: "флуконазол-obl", link: "флуконазол-obl" },
        { name: "флюкостат", link: "флюкостат" },
        { name: "фозикард", link: "фозикард" },
        { name: "форадил", link: "форадил" },
        { name: "формула", link: "формула" },
        { name: "форсига", link: "форсига" },
        { name: "фосфоглив", link: "фосфоглив" },
        { name: "фурадонин", link: "фурадонин" },
        { name: "фурамаг", link: "фурамаг" },
        { name: "фурасол", link: "фурасол" },
        { name: "хартил", link: "хартил" },
        { name: "хилабак", link: "хилабак" },
        { name: "хлое", link: "хлое" },
        { name: "хлорпротиксен", link: "хлорпротиксен" },
        { name: "хондрогард", link: "хондрогард" },
        { name: "хондроитин", link: "хондроитин" },
        { name: "хондроитин-апекс", link: "хондроитин-апекс" },
        { name: "хондроитин-б", link: "хондроитин-б" },
        { name: "хондроитин-бинергия", link: "хондроитин-бинергия" },
        { name: "хондролон", link: "хондролон" },
        { name: "хофитол", link: "хофитол" },
        { name: "хумулин", link: "хумулин" },
        { name: "цель", link: "цель" },
        { name: "цераксон", link: "цераксон" },
        { name: "церебролизин", link: "церебролизин" },
        { name: "церетон", link: "церетон" },
        { name: "цетрин", link: "цетрин" },
        { name: "цинк+d+с+кверцетин", link: "цинк+d+с+кверцетин" },
        { name: "цинк+витамин", link: "цинк+витамин" },
        { name: "циннаризин", link: "циннаризин" },
        { name: "циннаризин-балканфарма", link: "циннаризин-балканфарма" },
        { name: "циннаризин-милве", link: "циннаризин-милве" },
        { name: "циннаризин-софарма", link: "циннаризин-софарма" },
        { name: "ципралекс", link: "ципралекс" },
        { name: "цитофлавин", link: "цитофлавин" },
        { name: "цитрамон", link: "цитрамон" },
        { name: "цифран", link: "цифран" },
        { name: "эгилок", link: "эгилок" },
        { name: "эгипрес", link: "эгипрес" },
        { name: "эглонил", link: "эглонил" },
        { name: "эглонил", link: "эглонил" },
        { name: "эдарби", link: "эдарби" },
        { name: "эзетимиб-сз", link: "эзетимиб-сз" },
        { name: "эзетрол", link: "эзетрол" },
        { name: "эквамер", link: "эквамер" },
        { name: "экватор", link: "экватор" },
        { name: "экзилак", link: "экзилак" },
        { name: "эксфорж", link: "эксфорж" },
        { name: "элевит", link: "элевит" },
        { name: "элидел", link: "элидел" },
        { name: "эликвис", link: "эликвис" },
        { name: "элькар", link: "элькар" },
        { name: "эманера", link: "эманера" },
        { name: "эмла", link: "эмла" },
        { name: "эмоксипин", link: "эмоксипин" },
        { name: "эналаприл", link: "эналаприл" },
        { name: "энап", link: "энап" },
        { name: "энзистал", link: "энзистал" },
        { name: "энлигрия", link: "энлигрия" },
        { name: "энтерофурил", link: "энтерофурил" },
        { name: "энцетрон-солофарм", link: "энцетрон-солофарм" },
        { name: "эпигаллат", link: "эпигаллат" },
        { name: "эпиген", link: "эпиген" },
        { name: "эскузан", link: "эскузан" },
        { name: "эспиро", link: "эспиро" },
        { name: "эссенциале", link: "эссенциале" },
        { name: "эстровэл", link: "эстровэл" },
        { name: "эторикоксиб-сз", link: "эторикоксиб-сз" },
        { name: "эффезел", link: "эффезел" },
        { name: "эффекс", link: "эффекс" },
        { name: "юперио", link: "юперио" },
        { name: "янувия", link: "янувия" },
        { name: "ярина", link: "ярина" }
        );

      // for (const e of list) {
      //   if (e.textContent) {
      //     links.push({
      //       name: e.textContent.trim(),
      //       link: e.getAttribute("href"),
      //     });
      //   }
      // }
      // links.splice(0, 2);
      return links;
    });
    await sleep(10);
    console.log("Categories", categories);
    await sleep(10);
    for (const cat of categories) {
      // console.log("Start parse category", cat.name);
      // await tab.GoTo(`https://zdravcity.ru` + cat.link);
      // await sleep(10);
      // const subCategories = await tab.Evaluate(() => {
      //   const list = document.querySelectorAll<HTMLLabelElement>(
      //     "div.CategoriesItem_categories-item-list__EwBo1 > a"
      //   );
      //   const links = [];

      //   for (const e of list) {
      //     if (e.textContent) {
      //       links.push({
      //         name: e.textContent.trim(),
      //         link: e.getAttribute("href"),
      //       });
      //     }
      //   }
      //   return links;
      // });
      // console.log("Categories", subCategories);
      // await sleep(10);
      // for (const subCat of subCategories) {
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
