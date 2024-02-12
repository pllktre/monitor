import requests
import sys
import io
import re

from bs4 import BeautifulSoup

headers = {
	'host': 'perm.zhivika.ru',
	'connection': 'keep-alive',
	'sec-ch-ua': '"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"',
	'sec-ch-ua-mobile': '?0',
	'upgrade-insecure-requests': '1',
	'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
	'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
	'sec-fetch-site': 'none',
	'sec-fetch-mode': 'navigate',
	'sec-fetch-user': '?1',
	'sec-fetch-dest': 'document',
	'accept-encoding': 'gzip, deflate, br',
	'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'
}

#with open( "../zhivika.csv", "w", encoding="utf-8" ) as file:
#	file.write( r.text )
#
#print( r.text )

FILE_HEAD = "id_tip\tname_good\tnom\tname_pro\tname_gorod\tname_apt\tcena\tcena1\tcena2"
parserID = "406"
params = [
	"name",
	"contextID",
	"brand",
	"city",
	"seller",
	"price",
	"price1",
	"price2"
]

def item_string( item ):
	t = parserID

	for p in params:
		t = t + "\t"
		v = item.get( p )

		if v:
			t = t + v

	return t

notFoundSelector = "#search-page > h3"
itemSelector = "div.product-list-table table > tbody > tr"
itemNameSelector = "td.products-table__product-name > a > span"
itemPriceSelector = "td.products-table__price > strong"
items = []

def parse_url( city, search ):
	i = 1

	while True:
		data = requests.get( "https://" + city + ".zhivika.ru/search/resultPage?searchString=" + search + "&page=" + str( i ), headers=headers ).text
		soup = BeautifulSoup( data, "html.parser" )
	
		if soup.select_one( notFoundSelector ):
			break
	
		for ie in soup.select( itemSelector ):
			name = ie.select_one( itemNameSelector )
			price = ie.select_one( itemPriceSelector )
	
			if not name or not price or price.get_text().strip() == "нет":
				continue
	
			item = {
				"city": "Пермь",
				"name": name.get_text().strip(),
				"price": re.sub( r"\s*", "", price.get_text().strip() )
			}
	
			print( item )
	
			items.append( item )
	
		i = i + 1

parse_url( "perm", "VICHY" )
parse_url( "perm", "LA+ROCHE-POSAY" )

with open( "../zhivika.csv", "w", encoding="utf-8" ) as file:
	t = FILE_HEAD

	for item in items:
		t = t + "\n" + item_string( item )

	file.write( t )