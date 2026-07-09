import type {
  DiningItemCategory,
  HotelRussianDiningItem,
} from "@/lib/types/hotel-russian-dining-item";

function img(thing: string): string {
  return `Flat vector illustration of ${thing}, hotel restaurant dining item, clean white background, soft teal and warm gold accent colors, centered single object, minimalist educational flashcard style, no text, no watermark`;
}

function di(
  id: string,
  category: DiningItemCategory,
  chinese: string,
  russian: string,
  transliteration: string,
  english: string,
  thingEn: string
): HotelRussianDiningItem {
  return {
    id,
    category,
    chinese,
    russian,
    transliteration,
    english,
    imagePrompt: img(thingEn),
  };
}

export const HOTEL_RUSSIAN_DINING_ITEMS: HotelRussianDiningItem[] = [
  // 餐具 Tableware (10)
  di("di-001", "tableware", "盘子", "тарелка", "tarelka", "plate", "a dinner plate"),
  di("di-002", "tableware", "汤碗", "суповая тарелка", "supovaya tarelka", "soup bowl", "a soup bowl"),
  di("di-003", "tableware", "深盘", "салатник", "salatnik", "deep bowl", "a deep serving bowl"),
  di("di-004", "tableware", "碟子", "блюдце", "blyudtse", "saucer", "a saucer under a cup"),
  di("di-005", "tableware", "餐盘", "обеденная тарелка", "obedennaya tarelka", "dinner plate", "a large dinner plate"),
  di("di-006", "tableware", "面包盘", "тарелка для хлеба", "tarelka dlya khleba", "bread plate", "a small bread plate"),
  di("di-007", "tableware", "鱼盘", "рыбная тарелка", "rybnaya tarelka", "fish plate", "an oval fish plate"),
  di("di-008", "tableware", "分餐盘", "тарелка для закусок", "tarelka dlya zakusok", "appetizer plate", "a small appetizer plate"),
  di("di-009", "tableware", "保温盘", "подогреваемая тарелка", "podogrevaemaya tarelka", "warming plate", "a plate warmer"),
  di("di-010", "tableware", "儿童餐盘", "детская тарелка", "detskaya tarelka", "children plate", "a divided children plate"),

  // 刀叉 Cutlery (10)
  di("di-011", "cutlery", "餐刀", "нож", "nozh", "knife", "a dinner knife"),
  di("di-012", "cutlery", "叉子", "вилка", "vilka", "fork", "a dining fork"),
  di("di-013", "cutlery", "汤匙", "столовая ложка", "stolovaya lozhka", "tablespoon", "a tablespoon"),
  di("di-014", "cutlery", "茶匙", "чайная ложка", "chainaya lozhka", "teaspoon", "a teaspoon"),
  di("di-015", "cutlery", "甜品勺", "десертная ложка", "desertnaya lozhka", "dessert spoon", "a dessert spoon"),
  di("di-016", "cutlery", "筷子", "палочки для еды", "palochki dlya edy", "chopsticks", "a pair of chopsticks"),
  di("di-017", "cutlery", "牛排刀", "столовый нож для стейка", "stolovyy nozh dlya steyka", "steak knife", "a steak knife"),
  di("di-018", "cutlery", "鱼刀", "рыбный нож", "rybnyy nozh", "fish knife", "a fish knife"),
  di("di-019", "cutlery", "甜品叉", "десертная вилка", "desertnaya vilka", "dessert fork", "a dessert fork"),
  di("di-020", "cutlery", "开壳器", "орехокол", "orekhokol", "seafood cracker", "a seafood cracker tool"),

  // 杯具 Glassware (10)
  di("di-021", "glassware", "水杯", "стакан для воды", "stakan dlya vody", "water glass", "a water glass"),
  di("di-022", "glassware", "红酒杯", "бокал для красного вина", "bokal dlya krasnogo vina", "red wine glass", "a red wine glass"),
  di("di-023", "glassware", "香槟杯", "бокал для шампанского", "bokal dlya shampanskogo", "champagne flute", "a champagne flute"),
  di("di-024", "glassware", "啤酒杯", "пивная кружка", "pivnaya kruzhka", "beer mug", "a beer mug"),
  di("di-025", "glassware", "咖啡杯", "чашка для кофе", "chashka dlya kofe", "coffee cup", "a coffee cup"),
  di("di-026", "glassware", "茶杯", "чайная чашка", "chaynaya chashka", "teacup", "a teacup with saucer"),
  di("di-027", "glassware", "烈酒杯", "рюмка", "ryumka", "shot glass", "a shot glass"),
  di("di-028", "glassware", "鸡尾酒杯", "бокал для коктейля", "bokal dlya kokteilya", "cocktail glass", "a cocktail glass"),
  di("di-029", "glassware", "扎壶", "графин", "grafin", "pitcher", "a glass water pitcher"),
  di("di-030", "glassware", "醒酒器", "декanter", "dekanter", "decanter", "a wine decanter"),

  // 餐巾桌布 Linen (10)
  di("di-031", "linen", "餐巾", "салфетка", "salfetka", "napkin", "a cloth napkin"),
  di("di-032", "linen", "桌布", "скатерть", "skatert", "tablecloth", "a white tablecloth"),
  di("di-033", "linen", "餐垫", "салфетка под тарелку", "salfetka pod tarelku", "placemat", "a placemat"),
  di("di-034", "linen", "杯垫", "подставка под стакан", "podstavka pod stakan", "coaster", "a drink coaster"),
  di("di-035", "linen", "桌旗", "дорожка для стола", "dorozhka dlya stola", "table runner", "a table runner"),
  di("di-036", "linen", "围兜", "нагрудник", "nagrudnik", "bib", "a dining bib"),
  di("di-037", "linen", "围裙", "фартук", "fartuk", "apron", "a server apron"),
  di("di-038", "linen", "托盘布", "салфетка на поднос", "salfetka na podnos", "tray cloth", "a tray liner cloth"),
  di("di-039", "linen", "自助餐裙边", "юбка для шведского стола", "yubka dlya shvedskogo stola", "buffet skirt", "a buffet table skirt"),
  di("di-040", "linen", "椅套", "чехол на стул", "chekhol na stul", "chair cover", "a dining chair cover"),

  // 上菜用具 Serving (10)
  di("di-041", "serving", "托盘", "поднос", "podnos", "serving tray", "a silver serving tray"),
  di("di-042", "serving", "公勺", "половник", "polovnik", "ladle", "a serving ladle"),
  di("di-043", "serving", "夹子", "щипцы для еды", "shchiptsy dlya edy", "food tongs", "serving tongs"),
  di("di-044", "serving", "大盘", "блюдо", "blyudo", "serving platter", "a large serving platter"),
  di("di-045", "serving", "保温餐炉", "чафинг-диш", "chafing-dish", "chafing dish", "a chafing dish warmer"),
  di("di-046", "serving", "菜肴罩", "колпак для блюда", "kolpak dlya blyuda", "cloche", "a food cloche cover"),
  di("di-047", "serving", "自助餐架", "подставка для шведского стола", "podstavka dlya shvedskogo stola", "buffet stand", "a buffet display stand"),
  di("di-048", "serving", "蛋糕架", "подставка для торта", "podstavka dlya torta", "cake stand", "a tiered cake stand"),
  di("di-049", "serving", "面包篮", "корзина для хлеба", "korzina dlya khleba", "bread basket", "a woven bread basket"),
  di("di-050", "serving", "分菜勺", "сервировочная ложка", "servirovochnaya lozhka", "serving spoon", "a large serving spoon"),

  // 调味品 Condiments (10)
  di("di-051", "condiments", "盐", "соль", "sol", "salt", "salt in a shaker"),
  di("di-052", "condiments", "胡椒", "перец", "perec", "pepper", "a pepper shaker"),
  di("di-053", "condiments", "糖", "сахар", "sakhar", "sugar", "a sugar bowl"),
  di("di-054", "condiments", "酱油", "соевый соус", "soevyy sous", "soy sauce", "a soy sauce bottle"),
  di("di-055", "condiments", "油", "масло", "maslo", "oil", "an olive oil bottle"),
  di("di-056", "condiments", "醋", "уксус", "uksus", "vinegar", "a vinegar bottle"),
  di("di-057", "condiments", "芥末", "горчица", "gorchitsa", "mustard", "a mustard jar"),
  di("di-058", "condiments", "番茄酱", "кетчуп", "ketchup", "ketchup", "a ketchup bottle"),
  di("di-059", "condiments", "黄油", "сливочное масло", "slivochnoye maslo", "butter", "butter on a small dish"),
  di("di-060", "condiments", "果酱", "джем", "dzhem", "jam", "jam in a small jar"),

  // 饮品 Beverages (10)
  di("di-061", "beverages", "水", "вода", "voda", "water", "a glass of water"),
  di("di-062", "beverages", "咖啡", "кофе", "kofe", "coffee", "a cup of hot coffee"),
  di("di-063", "beverages", "茶", "чай", "chay", "tea", "a cup of tea"),
  di("di-064", "beverages", "红酒", "красное вино", "krasnoye vino", "red wine", "a glass of red wine"),
  di("di-065", "beverages", "啤酒", "пиво", "pivo", "beer", "a glass of beer"),
  di("di-066", "beverages", "果汁", "сок", "sok", "juice", "a glass of fruit juice"),
  di("di-067", "beverages", "牛奶", "молоко", "moloko", "milk", "a glass of milk"),
  di("di-068", "beverages", "汽水", "газировка", "gazirovka", "soda", "a carbonated soft drink"),
  di("di-069", "beverages", "鸡尾酒", "коктейль", "kokteyl", "cocktail", "a colorful cocktail"),
  di("di-070", "beverages", "矿泉水", "минеральная вода", "mineralnaya voda", "mineral water", "bottled mineral water"),

  // 常见食物 Food (10)
  di("di-071", "food", "面包", "хлеб", "khleb", "bread", "a loaf of bread"),
  di("di-072", "food", "汤", "суп", "sup", "soup", "a bowl of soup"),
  di("di-073", "food", "沙拉", "салат", "salat", "salad", "a green salad"),
  di("di-074", "food", "牛排", "стейк", "steyk", "steak", "a grilled steak"),
  di("di-075", "food", "鱼", "рыба", "ryba", "fish", "a cooked fish fillet"),
  di("di-076", "food", "甜点", "десерт", "desert", "dessert", "a sweet dessert plate"),
  di("di-077", "food", "水果", "фрукты", "frukty", "fruit", "fresh fruit on a plate"),
  di("di-078", "food", "鸡蛋", "яйцо", "yaytso", "egg", "a fried egg"),
  di("di-079", "food", "米饭", "рис", "ris", "rice", "a bowl of white rice"),
  di("di-080", "food", "意面", "паста", "pasta", "pasta", "a plate of pasta"),

  // 服务 Service (10)
  di("di-081", "service", "菜单", "меню", "menyu", "menu", "a restaurant menu"),
  di("di-082", "service", "账单", "счёт", "schet", "bill", "a restaurant bill"),
  di("di-083", "service", "收据", "чек", "chek", "receipt", "a payment receipt"),
  di("di-084", "service", "预订本", "книга бронирования", "kniga bronirovaniya", "reservation book", "a reservation book"),
  di("di-085", "service", "点菜单", "бланк заказа", "blank zakaza", "order pad", "an order notepad"),
  di("di-086", "service", "小费盘", "блюдце для чаевых", "blyudtse dlya chaevykh", "tip tray", "a tip tray"),
  di("di-087", "service", "账单夹", "папка для счёта", "papka dlya scheta", "bill folder", "a leather bill presenter"),
  di("di-088", "service", "酒单", "винная карта", "vinnaya karta", "wine list", "a wine list booklet"),
  di("di-089", "service", "意见卡", "карточка отзыва", "kartochka otzyva", "comment card", "a guest feedback card"),
  di("di-090", "service", "送餐牌", "табличка доставки еды", "tablichka dostavki edy", "room service tag", "a room service door tag"),

  // 餐饮设备 Equipment (10)
  di("di-091", "equipment", "收银机", "касса", "kassa", "POS terminal", "a restaurant POS terminal"),
  di("di-092", "equipment", "咖啡机", "кофемашина", "kofemashina", "coffee machine", "an espresso coffee machine"),
  di("di-093", "equipment", "制冰机", "льдогенератор", "ldogenerator", "ice machine", "a commercial ice machine"),
  di("di-094", "equipment", "搅拌机", "блендер", "blender", "blender", "a kitchen blender"),
  di("di-095", "equipment", "烤面包机", "тостер", "toaster", "toaster", "a bread toaster"),
  di("di-096", "equipment", "微波炉", "микроволновка", "mikrovolnovka", "microwave", "a microwave oven"),
  di("di-097", "equipment", "洗碗机", "посудомоечная машина", "posudomoechnaya mashina", "dishwasher", "a commercial dishwasher"),
  di("di-098", "equipment", "烤箱", "духовка", "duhovka", "oven", "a kitchen oven"),
  di("di-099", "equipment", "冰箱", "холодильник", "kholodilnik", "refrigerator", "a restaurant refrigerator"),
  di("di-100", "equipment", "保温灯", "лампа для подогрева", "lampa dlya podogreva", "heat lamp", "a food warming heat lamp"),
];

export function getDiningItemById(id: string): HotelRussianDiningItem | undefined {
  return HOTEL_RUSSIAN_DINING_ITEMS.find((item) => item.id === id);
}

export function getDiningItemsByCategory(
  category: DiningItemCategory
): HotelRussianDiningItem[] {
  return HOTEL_RUSSIAN_DINING_ITEMS.filter((item) => item.category === category);
}
