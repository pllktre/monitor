import type { InitParserConfig } from "../components/parsing";
import { sleep } from "../components/utils";
import { create_tab } from "../extension/background";
import { parse } from "node-html-parser";

const config: InitParserConfig<UniqueParserConfig> = (parser) => ({
  type: "unique",
  id: 454,
  params: ["city"],
  itemSelector: "div.x-grid-item-container > table",
  itemParams: {
    name: ["tbody > tr > td:nth-child(4)"],
    price: ["tbody > tr > td:nth-child(8)"],
    brand: ["tbody > tr > td:nth-child(9)"],
    contextID: ["tbody > tr > td:nth-child(2)"],
    price1: ["tbody > tr > td:nth-child(3)"],
    price2: ["tbody > tr > td:nth-child(1)"],
    // name: ["tbody > tr > td:nth-child(2)"],
    // price: ["tbody > tr > td:nth-child(4)"],
    // contextID: ["tbody > tr > td:nth-child(1)"],
    // price1: ["tbody > tr > td:nth-child(3)"],
    // price2: ["tbody > tr > td:nth-child(5)"],
    // brand: ["#displayfield-1300-bodyEl > #displayfield-1300-inputEl"]
  },
  itemFunc: async (item, ie) => {
    if(!item.price) return;
    item.price = String(item.price).trim().replace("RSD","");
    parser.AddItem(item);
    },
  func: async () => {
    console.log("farmlend");
    const tab = await create_tab("https://online.phoenixpharma.rs/srb/build/production/Shop/");

    if (!tab) return;

    parser.exit.Add(() => tab.Close());

    await sleep(20);
    await tab.Click("div.x-grid-item-container > table:nth-child(6)> tbody > tr > td");
    await sleep(6);
    for(let i=0;i<643;i++)
    {
        const text = await tab.Evaluate(async () => document.body.innerHTML);
        parser.ParseItems(text);
        await tab.Click("span#button-1204-btnEl > span#button-1204-btnIconEl");
        await sleep(5);
    }
    await tab.WaitSelector(".bcd");
    // for(let i=0;i<12;i++) {
    //     for(let j=1;j<=15;j++) {
    //         const div = "div.x-component > div.allproms-item-outer:nth-child(" + j + ") > div:nth-child(1) > div:nth-child(3) > div > div > a";
    //         await tab.Click(div);
    //         await sleep(5);
    //         const text = await tab.Evaluate(async () => document.body.innerHTML);
    //         const body = parse(text);
    //         await sleep(10);
    //         const properties = body.querySelectorAll("div.x-window > div.x-window-bodyWrap > div > div > div > div > div > div > div.x-panel.x-box-item.verticalAlignCellGrid > div > div.x-panel-body.x-grid-with-row-lines > div > div.x-grid-item-container > table");
            
    //         console.log(properties);
    //         for (let r of properties) { 
    //         const name = r.querySelector("tbody > tr > td:nth-child(2)");
    //         const price= r.querySelector("tbody > tr > td:nth-child(4)");
    //         const contextID = r.querySelector("tbody > tr > td:nth-child(1)");
    //         const price1 = r.querySelector("tbody > tr > td:nth-child(3)");
    //         const price2 =r.querySelector("tbody > tr > td:nth-child(5)");
    //         const brand = body.querySelector("div.x-component > div.allproms-item-outer:nth-child(" + j + ") > div:nth-child(1) > div:nth-child(2) > div.period");
    //         console.log(name,price,contextID,price1, price2);
    //         if(name == null) {}
    //         else {
    //         const item = {
    //             name: name.textContent,
    //             price: price.textContent,
    //             price1: price1.textContent,
    //             price2: price2.textContent,
    //             brand: brand.textContent,
    //             ContextId: contextID.textContent,
    //           };
    //           console.log("Add item", item);
    //           parser.AddItem(item);
    //         }
    //     }
    //         await sleep(5);
    //         await tab.Click("div.x-window-header.x-header.x-header-draggable.x-docked.x-unselectable > div.x-box-inner > div.x-box-target > div.x-tool.x-box-item.x-tool-default.x-tool-after-title > div");
    //     }
    //     await tab.Click("div.x-toolbar.x-box-item.x-toolbar-item.x-toolbar-paging-toolbar-black > div.x-box-inner > div > a:nth-child(8)");
    //     await sleep(10);
    // }
    await sleep(40);
  },
});

export default config;