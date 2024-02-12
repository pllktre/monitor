import Knex from "knex";
import type { PreparedStatement, ISqlType, IRecordSet } from "mssql";

type KVStringNumber = KV<string | number>;
type KVSqlTypes<T> = { [k in keyof T]: ISqlType };

const WEEK = 7 * 24 * 60 * 60 * 1000;
const KNEX = require("../../../upp.config.js").KNEX;

const knex = Knex(KNEX);

// Utils

const parse_db = (data: any[], jsonKeys: string[], dateKeys: string[]) => {
  for (const row of data) {
    for (const key of jsonKeys) {
      row[key] = JSON.parse(row[key]);
    }

    for (const key of dateKeys) {
      row[key] = Number(row[key]);
    }
  }

  return data;
};

const delete_duplicates = async (parserID: string) => {
  await knex.raw(
    `
		with CTE as
			(
			select *, ROW_NUMBER() over ( partition by name order by price asc) AS rn
			FROM parsers_temp_items where parserID = ?
		)
		delete from CTE where rn <> 1
	`,
    [parserID]
  );
};

const delete_duplicates_bd = async (parserID: string) => {
  await knex.raw(
    ` exec monitor.dbo.Delete_Duplicates ?`,
    [parserID]
  );
};

export const db_items_from_temp = async (
  parserID: string,
  idType: number,
  clear?: boolean
): Promise<string> => {
  const [inserted] = await knex("zagruzki").insert(
    { id_tip: idType, checked: 0 },
    "id"
  );

  console.log("items_from_temp", inserted);

  await knex("parsers_uploads").insert({
    parserID: parserID,
    uploadID: inserted,
    date: Date.now(),
  });
  await delete_duplicates(parserID);
  await delete_duplicates_bd(parserID);
  await knex.raw(
    `
		insert into zagruzki_sostav (
			id_zagruz, name_good, nom, name_pro, name_apt, cena, name_gorod, cena1, cena2
		) select 
			?, name, contextID, brand, seller, price, city, price1, price2
		 from parsers_temp_items where parserID = ?
	`,
    [inserted, parserID]
  );

  if (clear) {
    //await knex("parsers_temp_items").where({ parserID: parserID }).delete();
  }

  return inserted;
};

export const send_db_email = async (
  recipient: string,
  sub: string,
  msg: string
) => {
  await knex.raw(
    `
		EXEC msdb.dbo.sp_send_dbmail
			@recipients = ?,
			@subject = ?,
			@body = ?,
			@body_format = 'TEXT',
			@profile_name = 'SQL Agent Results Profile';
	`,
    [recipient, sub, msg]
  );
};

// Updates

export const update_db_parser_storage = async (
  id: string,
  storage: ParserStorage
) =>
  await knex("parsers")
    .where({ id: id })
    .update({ storage: JSON.stringify(storage) });

export const update_db_parser_state = async (id: string, state: ParserState) =>
  await knex("parsers").where({ id: id }).update({ state: state });

export const update_db_parser_date = async (
  id: string,
  activedate: string,
  state: ParserState
) =>
  await knex("parsers")
    .where({ id: id, state: "active" })
    .update({ activedate: Date.now() });

export const delete_db_timetable = async (id: string) => {
  await knex("parsers_timetable").delete().where({ id: id });
};

export const update_db_timetable_last_launch_date = async (
  id: string,
  date: number
) => {
  await knex("parsers_timetable")
    .where({ id: id })
    .update({ lastLaunchDate: date });
};

// Inserts

export const insert_db_parser = async (params: KV<string, string>) => {
  const [id] = await knex("parsers").insert(
    {
      params: JSON.stringify(params),
      state: "sequence",
      storage: "{}",
      creationDate: Date.now(),
    },
    "id"
  );

  return id.toString();
};

export const insert_db_cache = async (
  pn: string,
  cn: string,
  ck: string,
  cv: string
) => {
  await knex.raw(
    `
		with temp( pn, cn, ck, cv ) as ( select ?, ?, ?, ? )
		merge into parsers_cache as cur
			using temp
				on cur.parserName = temp.pn
				and cur.cacheName = temp.cn
				and cur.cacheKey = temp.ck
			when matched then
				update set cur.cache_value = temp.cv
			when not matched then
				insert (
					parserName,
					cacheName,
					cacheKey,
					cacheValue
				) values ( temp.pn, temp.cn, temp.ck, temp.cv )
		;
	`,
    [pn, cn, ck, cv]
  );
};

export const insert_db_temp_items = async (
  id: string,
  city: string | undefined,
  items: ItemRow[]
): Promise<void> =>
  await knex("parsers_temp_items").insert(
    items.map((item) => {
      const row: KV<string | number | undefined> = {
        parserID: id,
      };

      for (const k in item) {
        row[k] = item[k as keyof ItemRow];
      }

      if (!row.city && city) {
        row.city = city;
      }

      return row;
    })
  );

export const insert_db_timetable = async (
  params: ParserParams,
  wdm: WeekDaysMode,
  priority?: number,
  avgItems?:string
) => {
  const [id] = await knex("parsers_timetable").insert(
    {
      params: JSON.stringify(params),
      priority: priority || 1000,
      lastLaunchDate: 0,
      weekDaysMode: JSON.stringify(wdm),
      avgItems: avgItems || " ", 
    },
    "id"
  );

  return id.toString();
};

// Gets

export const get_db_parsers = async (): Promise<ParsersDBRow[]> =>
  parse_db(
    await knex("parsers")
      .select()
      .where("creationDate", ">", Date.now() - 24 * 60 * 60 * 1000)
      .orderBy("id"),
    ["params", "storage"],
    ["creationDate"]
  );

export const get_db_cache = async (pn: string, cn: string) => {
  const kv: KV<string, string> = {};
  const cache: ParsersCacheDBRow[] = await knex("parsers_cache")
    .select("cacheKey", "cacheValue")
    .where({ parserName: pn, cacheName: cn });

  cache.forEach((x) => (kv[x.cacheKey] = x.cacheValue));

  return kv;
};

export const get_db_parsers_scheme = async (): Promise<ParsersSchemeDBRow[]> =>
  parse_db(
    await knex("parsers_scheme").select().orderBy("parserName"),
    ["params"],
    []
  );

export const get_db_timetable = async (): Promise<ParsersTimetableDBRow[]> =>
  parse_db(
    await knex("parsers_timetable").select().orderBy("priority","desc"),
    ["params", "weekDaysMode"],
    ["lastLaunchDate"]
  );

export const get_db_uploads = async (): Promise<ParsersUploadsDBRow[]> =>
  await knex("parsers_uploads").select();
