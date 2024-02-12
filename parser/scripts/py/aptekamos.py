import requests
import sys
import io
import re

from bs4 import BeautifulSoup

headers = {
	'host': 'https://zdorov.ru/',
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
cookie = {
	"_ym_uid": "1628491892717635599",
	"_ym_d": "1628491971",
	"_ym_isad": "2",
	"_ym_visorc": "w",
	"is-converted-basket": "true",
	"is-converted-liked": "true",
	"storage-shipment": "%7B%22stockId%22%3A0%2C%22cityId%22%3A1%2C%22shipAddressId%22%3A0%2C%22shipAddressTitle%22%3A%22%22%2C%22stockTitle%22%3A%22%22%7D"
}

#with open( "../zhivika.csv", "w", encoding="utf-8" ) as file:
#	file.write( r.text )
#
#print( r.text )

session = requests.Session()
for k in cookie:
	print( "cook", k, cookie[k] )
	session.cookies.set( k, cookie[k], path='/', domain='aptekamos.ru')

print( session.get( "https://aptekamos.ru/https://zdorov.ru/catalog/344/354", headers=headers ).text )