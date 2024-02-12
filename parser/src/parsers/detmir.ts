import type { InitParserConfig } from "../components/parsing"
import { exec_async } from "../components/local"
import { sleep } from "../components/utils"
import fs from "fs"

const PATH = "../old"

const config: InitParserConfig<UniqueParserConfig> = parser => ( {
	type: "unique",
	id: -1,

	func: async () => {
			await exec_async( `cd ${PATH}/Detmir/Detmir/bin/Debug/net6.0 && Detmir.exe` )
      await exec_async( `cd ${PATH}/Detmir/Detmir/bin/Debug/net6.0 && Detmir.bat` )
	}
} )

export default config
// import type { InitParse
// import type { InitParserConfig } from "../components/parsing";
// import { sleep } from "../components/utils";
// import { create_tab } from "../extension/background";
// import { parse } from "node-html-parser";

// const CURRENT_CITY =
//   "header > div:nth-child(2) > div > div:nth-child(1) > ul > li:nth-child(1) > div > div > div > div > span";
// const CHANGE_CITY =
//   "header > div:nth-child(2) > div > div:nth-child(1) > ul > li:nth-child(1) > div > div > div > div > span";

// const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
//   type: "unique",
//   id: 420,
//   params: ["city"],
//   itemSelector:
//     "main > div > div > div:nth-child(3) > div > div > div > div:nth-child(1) > div:nth-child(3) > div > div > section",
//   itemParams: {
//     name: ["a > h4"],
//     contextID: ["a", "href", [/\/(\d+)$/, 1]],
//   },
//   // itemFunc: async (item, ie) => {
//   //   if (!item.name || !item.contextID) return;
//   //     item.price = ie.querySelector("div._7X > span:nth-child(1)").textContent;
//   //     item.contextID = item.contextID.replace(/[^0-9]/g, "");
//   //     parser.AddItem(item);
//   //     return;
//   // },
//   func: async () => {
//     console.log("detmir");
//     const tab = await create_tab("https://www.detmir.ru/");

//     if (!tab) return;

//     parser.exit.Add(() => tab.Close());

//     const currentCity = await tab.GetHTML(CURRENT_CITY);

//     console.log("Current city:", currentCity.replace(".", "").trim());
//     console.log("Target city:", parser.params.city);

//     await sleep(4);

//     if (currentCity.trim() !== parser.params.city) {
//       await tab.Click(CHANGE_CITY);
//       await sleep(4);
//       await tab.Evaluate(async (city) => {
//         const cityList = document.querySelectorAll<HTMLAnchorElement>(
//           "ul > li > ul > li > span"
//         );
//         for (const ce of cityList) {
//           console.log(ce.textContent);
//           if (
//             ce.textContent &&
//             ce.textContent.trim().replace(".", "") === city
//           ) {
//             ce.click();
//             return;
//           }
//         }
//       }, parser.params.city);
//     } else {
//       console.log("It's ok");
//     }
//     await sleep(4);

//     const categories = await tab.Evaluate(() => {
//       const links = [];
//       links.push(
//         {name: "Bebelac",link: "https://www.detmir.ru/catalog/index/name/suhie_smesi_i_zameniteli_moloka/brand/23098",},
//         {name: "Bekari",link: "https://www.detmir.ru/catalog/index/name/suhie_smesi_i_zameniteli_moloka/brand/25170",},
//         {name: "Fabimilk",link: "https://www.detmir.ru/catalog/index/name/suhie_smesi_i_zameniteli_moloka/brand/23710",},
//         {name: "Frisco",link: "https://www.detmir.ru/catalog/index/name/suhie_smesi_i_zameniteli_moloka/brand/942",},
//         {name: "Goattiny",link: "https://www.detmir.ru/catalog/index/name/suhie_smesi_i_zameniteli_moloka/brand/22804",},
//         {name: "Hipp",link: "https://www.detmir.ru/catalog/index/name/suhie_smesi_i_zameniteli_moloka/brand/931",},
//         {name: "Kabrita",link: "https://www.detmir.ru/catalog/index/name/suhie_smesi_i_zameniteli_moloka/brand/4852",},
//         {name: "LateMa",link: "https://www.detmir.ru/catalog/index/name/suhie_smesi_i_zameniteli_moloka/brand/26795",},
//         {name: "Mamelle",link: "https://www.detmir.ru/catalog/index/name/suhie_smesi_i_zameniteli_moloka/brand/19032",},
//         {name: "NaN",link: "https://www.detmir.ru/catalog/index/name/suhie_smesi_i_zameniteli_moloka/brand/9341",},
//         {name: "Nestle",link: "https://www.detmir.ru/catalog/index/name/suhie_smesi_i_zameniteli_moloka/brand/861",},
//         {name: "Nestogen",link: "https://www.detmir.ru/catalog/index/name/suhie_smesi_i_zameniteli_moloka/brand/9351",},
//         {name: "Nutrika",link: "https://www.detmir.ru/catalog/index/name/suhie_smesi_i_zameniteli_moloka/brand/1061",},
//         {name: "Nutrilak",link: "https://www.detmir.ru/catalog/index/name/suhie_smesi_i_zameniteli_moloka/brand/4052",},
//         {name: "Nutrilon",link: "https://www.detmir.ru/catalog/index/name/suhie_smesi_i_zameniteli_moloka/brand/8931",},
//         {name: "Малоежка",link: "https://www.detmir.ru/catalog/index/name/suhie_smesi_i_zameniteli_moloka/brand/18385",},
//         {name: "Shaer",link: "https://www.detmir.ru/catalog/index/name/suhie_smesi_i_zameniteli_moloka/brand/23359",},
//         {name: "Semper",link: "https://www.detmir.ru/catalog/index/name/suhie_smesi_i_zameniteli_moloka/brand/971",},
//         {name: "Similac",link: "https://www.detmir.ru/catalog/index/name/suhie_smesi_i_zameniteli_moloka/brand/3211",},
//         {name: "Агуша",link: "https://www.detmir.ru/catalog/index/name/suhie_smesi_i_zameniteli_moloka/brand/1092",},
//         {name: "Беллакт",link: "https://www.detmir.ru/catalog/index/name/suhie_smesi_i_zameniteli_moloka/brand/5891",},
//         {name: "Бибиколь",link: "https://www.detmir.ru/catalog/index/name/suhie_smesi_i_zameniteli_moloka/brand/1002",},
//         {name: "Иван-поле",link: "https://www.detmir.ru/catalog/index/name/suhie_smesi_i_zameniteli_moloka/brand/26167",},
//         {name: "Малыш Истринский",link: "https://www.detmir.ru/catalog/index/name/suhie_smesi_i_zameniteli_moloka/brand/8951",},
//         {name: "Малютка",link: "https://www.detmir.ru/catalog/index/name/suhie_smesi_i_zameniteli_moloka/brand/8941",},
//         {name: "Мамако",link: "https://www.detmir.ru/catalog/index/name/suhie_smesi_i_zameniteli_moloka/brand/5262",},
//         {name: "Полезная партия",link: "https://www.detmir.ru/catalog/index/name/suhie_smesi_i_zameniteli_moloka/brand/23903",},
//         {name: "Каши",link: "https://www.detmir.ru/catalog/index/name/kashi",},
//         {name: "Подгузники-трусики",link: "https://www.detmir.ru/catalog/index/name/diapers_pants",},
//         {name: "Ночные трусики",link: "https://www.detmir.ru/catalog/index/name/night_panties",},
//         {name: "Подгузники",link: "https://www.detmir.ru/catalog/index/name/podguzniki",},
//         {name: "Товары Gerber",link: "https://www.detmir.ru/catalog/index/name/sortforbrand/brand/3061", },
//         {name: "Товары ФрутоНяня",link: "https://www.detmir.ru/catalog/index/name/sortforbrand/brand/1041",},
//         {name: "Товары Бабушкино лукошко",link: "https://www.detmir.ru/catalog/index/name/sortforbrand/brand/1241",},
//         {name: "Товары Canpol Babies",link: "https://www.detmir.ru/catalog/index/name/sortforbrand/brand/1291",},
//         {name: "Товары Babyline",link: "https://www.detmir.ru/catalog/index/name/sortforbrand/brand/1292",},
//         {name: "Товары R.O.C.S.",link: "https://www.detmir.ru/catalog/index/name/sortforbrand/brand/1311",},
//         {name: "Товары Наша Мама",link: "https://www.detmir.ru/catalog/index/name/sortforbrand/brand/1321",},
//         {name: "Товары Мир детства",link: "https://www.detmir.ru/catalog/index/name/sortforbrand/brand/141",},
//         {name: "Товары Моё солнышко",link: "https://www.detmir.ru/catalog/index/name/sortforbrand/brand/1861",},
//         {name: "Товары Bubchen",link: "https://www.detmir.ru/catalog/index/name/sortforbrand/brand/2191",},
//         {name: "Товары Курносики",link: "https://www.detmir.ru/catalog/index/name/sortforbrand/brand/3647",},
//         {name: "Товары Nuk",link: "https://www.detmir.ru/catalog/index/name/sortforbrand/brand/3804",},
//         {name: "Товары Bebivita",link: "https://www.detmir.ru/catalog/index/name/sortforbrand/brand/4082",},
//         {name: "Товары Johnson's",link: "https://www.detmir.ru/catalog/index/name/sortforbrand/brand/531",},
//         {name: "Товары Heinz",link: "https://www.detmir.ru/catalog/index/name/sortforbrand/brand/941",},
//         {name: "Товары Friso",link: "https://www.detmir.ru/catalog/index/name/sortforbrand/brand/942",},
//         {name: "Товары Сады Придонья",link: "https://www.detmir.ru/catalog/index/name/sortforbrand/brand/981",},
//         {name: "Товары Playgro",link: "https://www.detmir.ru/catalog/index/name/sortforbrand/brand/1282",},
//         {name: "Товары Vulli",link: "https://www.detmir.ru/catalog/index/name/sortforbrand/brand/4352",},
//         {name: "Товары Medela",link: "https://www.detmir.ru/catalog/index/name/sortforbrand/brand/15261",}
//       );
//       return links;
//     });

//     console.log("Categories", categories);
//     await sleep(4);
//     for (const cat of categories) {
//       console.log("Start parse category", cat.name);
//       let page = 1;

//       while (true) {
//         const href = cat.link;
//         const link= href + "/page/" + page;
//         await tab.GoTo(link);
//         await sleep(10);
//         const text = await tab.Evaluate(async () => document.body.innerHTML);
//         const body = parse(text);
//         await sleep(5);
//         if((cat.name === "Каши" || cat.name === "Подгузники-трусики" || cat.name === "Ночные трусики" || cat.name === "Подгузники") && page === 1)
//         {
//           const propetries = body.querySelectorAll(
//             "main > div > div > div:nth-child(4) > div > div > div > div:nth-child(1) > div:nth-child(3) > div > div > section"
//           );
//           for (let r of propetries) {
//             const promo = r.querySelector("span:nth-child(3)");
//             if (promo) {
//               if (promo.innerHTML.includes("Промо")) {
//                 const name = r.querySelector("a > h3");
//                 const price = r.querySelector(
//                   "div:nth-child(4) > span:nth-child(1)"
//                 );
//                 const contextID = String(
//                   r.querySelector("a").getAttribute("href")
//                 ).replace(/[^0-9]/g, "");
//                 if (price && price.textContent) {
//                   const item = {
//                     name: name.textContent,
//                     price: price.textContent,
//                     contextID: contextID,
//                   };
//                   console.log("Add item", item);
//                   parser.AddItem(item);
//                 }
//               }
//             } else {
//               const name = r.querySelector("a > h3");
//               const price = r.querySelector(
//                 "div:nth-child(3) > span:nth-child(1)"
//               );
//               const contextID = String(
//                 r.querySelector("a").getAttribute("href")
//               ).replace(/[^0-9]/g, "");
//               if (price && price.textContent) {
//                 const item = {
//                   name: name.textContent,
//                   price: price.textContent,
//                   contextID: contextID,
//                 };
//                 console.log("Add item", item);
//                 parser.AddItem(item);
//               }
//             }
//           }
//         }
//         else {
//           const propetries = body.querySelectorAll(
//             "main > div > div > div:nth-child(3) > div > div > div > div:nth-child(1) > div:nth-child(3) > div > div > section"
//           );
//           for (let r of propetries) {
//             const promo = r.querySelector("span:nth-child(3)");
//             if (promo) {
//               if (promo.innerHTML.includes("Промо")) {
//                 const name = r.querySelector("a > h3");
//                 const price = r.querySelector(
//                   "div:nth-child(4) > span:nth-child(1)"
//                 );
//                 const contextID = String(
//                   r.querySelector("a").getAttribute("href")
//                 ).replace(/[^0-9]/g, "");
//                 if (price && price.textContent) {
//                   const item = {
//                     name: name.textContent,
//                     price: price.textContent,
//                     contextID: contextID,
//                   };
//                   console.log("Add item", item);
//                   parser.AddItem(item);
//                 }
//               }
//             } else {
//               const name = r.querySelector("a > h3");
//               const price = r.querySelector(
//                 "div:nth-child(3) > span:nth-child(1)"
//               );
//               const contextID = String(
//                 r.querySelector("a").getAttribute("href")
//               ).replace(/[^0-9]/g, "");
//               if (price && price.textContent) {
//                 const item = {
//                   name: name.textContent,
//                   price: price.textContent,
//                   contextID: contextID,
//                 };
//                 console.log("Add item", item);
//                 parser.AddItem(item);
//               }
//             }
//           }
//         }

//         if (page > 15 || body.querySelector("main > div > div > div:nth-child(3) > div > div > div > div:nth-child(1) > div:nth-child(2)> img")) {
//           break;
//         }
//         page++;
//       }

//       await sleep(5);
//     }
//   },
// });

// export default config;
