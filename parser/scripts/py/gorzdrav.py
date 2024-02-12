import requests
import re
import time
import random
import sys

triesToConnect = 10
session = requests.Session()
itemStrings = []

def safe_get( url, tries=1 ):
	try:
		return session.get( url )
	except Exception:
		if tries < triesToConnect:
			time.sleep( 60 )
			return safe_get( url, tries + 1 )
		else:
			file.close()
			raise Exception( "Invalid request" )
		
mainBody = safe_get( "https://gorzdrav.org/category/gigiena-i-kosmetika/" ).text
cityUrl = ""
cityName = ""

with open( "debug.txt", "w", encoding="utf-8" ) as debugFile:
	debugFile.write( mainBody )

cityExp = r'<a class="c-base-stores__item c-base-stores__item__city js-base-stores__item__city " href="/_s/city\?urlcode=(.*)" data-uid="\d*-gz" data-name="(.*)">'
cities = {}

for x in re.findall( cityExp, mainBody ):
	url, name = x
	
	cities[name] = url

while True:
	city = None

	if len( sys.argv ) >= 2:
		cityName = sys.argv[1]
		city = cities.get( sys.argv[1] )

	if city == None:
		print( "Список городов" )
		print( cities )
		for k in cities:
			print( k )
		print( "" )
		selected = input( "Выберите один из списка городов: " )
		city = cities.get( selected )
		cityName = selected
	
	if city != None:
		if len( city ) > 0:
			city = city + "/"
		cityUrl = city
		break

def concate_regex( *a ):
	b = ""
	
	for x in a:
		b = b + x
	
	return b

categoryExp = concate_regex(
	'<a class="  js-catalog-menu__cat" href="/category/(.*)"\s*target="_self"\s*(data-active\s*)?data-val="box-(.*)"\s*',
	'>([^<]*)(<div class="c-catalog-body__item-arrow"></div>)?\s*</a>'
)
itemExp = 'data-gtm-id="(\d*)"\s*data-gtm-name="(.*)"\s*data-gtm-brand="(.*)"\s*data-gtm-price="(\d*|\.)"\s*data-gtm-category=".*"'

file = file = open( cityName + ".csv", "w", encoding="utf-8" )
file.write( "id_tip\tname_good\tnom	name_pro\tname_gorod\tname_apt\tcena\tcena1\tcena2" )

def parse_pages( url, cb ):
	i = 1
	lastBody = ""
	
	while True:
		pageUrl = url + str(i)
		pageRes = safe_get( pageUrl )

		if not pageRes:
			print( "Not page body:", url + str(i) )
			break
		
		print( "Page: ", i )
		
		if pageRes.url != pageUrl:
			print( "Redirected" )
			break

		pageBody = pageRes.text
		
		if len( pageBody ) == len( lastBody ):
			break
					
		lastBody = pageBody

		cb( pageBody )
		
		#time.sleep( random.random() * 5 )

		i = i + 1

def find_items( reg, body ):
	all = re.findall( reg, body )
	
	print( "Item count", len( all ) )
	
	for x in all:
		#print( x )
		itemID, itemName, itemBrand, itemPrice = x # = x
		
		itemPrice = itemPrice.replace( "&nbsp;", "" )
		itemPrice = re.sub( r"\s", "", itemPrice )
		
		print( "Item ID:", itemID, "Item name:", itemName, "Item price:", itemPrice )
		string = "\n404\t" + itemName.strip() + "\t" + itemID.strip() + "\t" + itemBrand.strip() + "\t" + cityName + "\t\t" + itemPrice.strip() + "\t\t"
		
		if not string in itemStrings:
			file.write( string )
			itemStrings.append( string )

def find_categories( cat, body ):
	cats = re.findall( cat, body )
	
	print( "Categories count:", len( cats ) )

	for y in cats:
		#print( y )
		url, _a, cat, _b, _c = y

		print( "Category name:", cat, "url:", url )
		
		parse_pages( "https://gorzdrav.org/" + cityUrl + "category/" + url + "?page=", lambda page: find_items( itemExp, page ) )

try:
	find_categories( categoryExp, mainBody )
except Exception:
	pass

file.close()

exec( 'py -m wdd.parsing.norm_prices "' + cityName + '.csv" -u --copy' )