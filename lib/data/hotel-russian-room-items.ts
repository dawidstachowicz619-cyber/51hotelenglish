import type {
  HotelRussianRoomItem,
  RoomItemCategory,
} from "@/lib/types/hotel-russian-room-item";

function img(thing: string): string {
  return `Flat vector illustration of ${thing}, hotel guest room item, clean white background, soft teal and warm gold accent colors, centered single object, minimalist educational flashcard style, no text, no watermark`;
}

function ri(
  id: string,
  category: RoomItemCategory,
  chinese: string,
  russian: string,
  transliteration: string,
  english: string,
  thingEn: string
): HotelRussianRoomItem {
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

export const HOTEL_RUSSIAN_ROOM_ITEMS: HotelRussianRoomItem[] = [
  // 床品 Bedding (10)
  ri("ri-001", "bedding", "枕头", "подушка", "podushka", "pillow", "a white hotel pillow"),
  ri("ri-002", "bedding", "床单", "простыня", "prostynya", "bed sheet", "a folded white bed sheet"),
  ri("ri-003", "bedding", "被套", "пододеяльник", "pododeyalnik", "duvet cover", "a white duvet cover"),
  ri("ri-004", "bedding", "被子", "одеяло", "odeyalo", "blanket", "a fluffy hotel blanket"),
  ri("ri-005", "bedding", "床垫", "матрас", "matras", "mattress", "a hotel bed mattress"),
  ri("ri-006", "bedding", "床", "кровать", "krovat", "bed", "a made hotel bed"),
  ri("ri-007", "bedding", "床头板", "изголовье", "izgolovie", "headboard", "a hotel bed headboard"),
  ri("ri-008", "bedding", "枕套", "наволочка", "navolochka", "pillowcase", "a white pillowcase"),
  ri("ri-009", "bedding", "床罩", "покрывало", "pokryvalo", "bedspread", "a decorative bedspread on hotel bed"),
  ri("ri-010", "bedding", "婴儿床", "детская кроватка", "detskaya krovatka", "baby crib", "a hotel baby crib"),

  // 浴室 Bathroom (10)
  ri("ri-011", "bathroom", "毛巾", "полотенце", "polotentse", "towel", "a folded white bath towel"),
  ri("ri-012", "bathroom", "浴巾", "банное полотенце", "bannoe polotentse", "bath towel", "a large white bath towel"),
  ri("ri-013", "bathroom", "手巾", "полотенце для рук", "polotentse dlya ruk", "hand towel", "a small hand towel"),
  ri("ri-014", "bathroom", "地巾", "коврик для ванной", "kovrik dlya vannoy", "bath mat", "a bathroom bath mat"),
  ri("ri-015", "bathroom", "浴袍", "халат", "khalat", "bathrobe", "a white hotel bathrobe"),
  ri("ri-016", "bathroom", "拖鞋", "тапочки", "tapochki", "slippers", "hotel disposable slippers"),
  ri("ri-017", "bathroom", "马桶", "унитаз", "unitaz", "toilet", "a modern hotel toilet"),
  ri("ri-018", "bathroom", "淋浴", "душ", "dush", "shower", "a hotel shower with glass door"),
  ri("ri-019", "bathroom", "浴缸", "ванна", "vanna", "bathtub", "a hotel bathtub"),
  ri("ri-020", "bathroom", "镜子", "зеркало", "zerkalo", "mirror", "a bathroom mirror"),

  // 洗漱用品 Toiletries (10)
  ri("ri-021", "toiletries", "洗发水", "шампунь", "shampun", "shampoo", "hotel shampoo bottle"),
  ri("ri-022", "toiletries", "护发素", "кондиционер", "konditsioner", "conditioner", "hotel conditioner bottle"),
  ri("ri-023", "toiletries", "沐浴露", "гель для душа", "gel dlya dusha", "shower gel", "hotel shower gel bottle"),
  ri("ri-024", "toiletries", "香皂", "мыло", "mylo", "soap", "a bar of hotel soap"),
  ri("ri-025", "toiletries", "牙刷", "зубная щётка", "zubnaya shchyotka", "toothbrush", "a toothbrush"),
  ri("ri-026", "toiletries", "牙膏", "зубная паста", "zubnaya pasta", "toothpaste", "a tube of toothpaste"),
  ri("ri-027", "toiletries", "梳子", "расчёска", "raschyoska", "comb", "a small comb"),
  ri("ri-028", "toiletries", "吹风机", "фен", "fen", "hair dryer", "a hotel hair dryer"),
  ri("ri-029", "toiletries", "卫生纸", "туалетная бумага", "tualetnaya bumaga", "toilet paper", "a roll of toilet paper"),
  ri("ri-030", "toiletries", "纸巾", "салфетки", "salfetki", "tissues", "a box of facial tissues"),

  // 家具 Furniture (10)
  ri("ri-031", "furniture", "桌子", "стол", "stol", "table", "a hotel room desk table"),
  ri("ri-032", "furniture", "椅子", "стул", "stul", "chair", "a hotel room chair"),
  ri("ri-033", "furniture", "沙发", "диван", "divan", "sofa", "a hotel room sofa"),
  ri("ri-034", "furniture", "茶几", "журнальный столик", "zhurnalnyy stolik", "coffee table", "a small coffee table"),
  ri("ri-035", "furniture", "衣柜", "шкаф", "shkaf", "wardrobe", "a hotel wardrobe closet"),
  ri("ri-036", "furniture", "衣架", "вешалка", "veshalka", "hanger", "a clothes hanger"),
  ri("ri-037", "furniture", "行李架", "багажная полка", "bagazhnaya polka", "luggage rack", "a hotel luggage rack"),
  ri("ri-038", "furniture", "床头柜", "тумбочка", "tumbochka", "nightstand", "a bedside nightstand"),
  ri("ri-039", "furniture", "窗帘", "шторы", "shtory", "curtains", "hotel window curtains"),
  ri("ri-040", "furniture", "地毯", "ковёр", "kover", "carpet", "a hotel room carpet"),

  // 电器 Electronics (10)
  ri("ri-041", "electronics", "电视", "телевизор", "televizor", "television", "a flat screen hotel TV"),
  ri("ri-042", "electronics", "遥控器", "пульт", "pult", "remote control", "a TV remote control"),
  ri("ri-043", "electronics", "电话", "телефон", "telefon", "telephone", "a hotel room telephone"),
  ri("ri-044", "electronics", "闹钟", "будильник", "budilnik", "alarm clock", "a digital alarm clock"),
  ri("ri-045", "electronics", "空调", "кондиционер", "konditsioner", "air conditioner", "a wall mounted air conditioner"),
  ri("ri-046", "electronics", "台灯", "настольная лампа", "nastolnaya lampa", "desk lamp", "a bedside desk lamp"),
  ri("ri-047", "electronics", "插座", "розетка", "rozetka", "power outlet", "a wall power socket"),
  ri("ri-048", "electronics", "充电线", "кабель для зарядки", "kabel dlya zaryadki", "charging cable", "a USB charging cable"),
  ri("ri-049", "electronics", "转换插头", "адаптер", "adapter", "travel adapter", "a universal travel plug adapter"),
  ri("ri-050", "electronics", "电水壶", "чайник", "chaynik", "electric kettle", "an electric kettle"),

  // 清洁 Cleaning (10)
  ri("ri-051", "cleaning", "垃圾桶", "мусорная корзина", "musornaya korzina", "trash bin", "a small room trash bin"),
  ri("ri-052", "cleaning", "垃圾袋", "мусорный пакет", "musornyy paket", "trash bag", "a plastic trash bag"),
  ri("ri-053", "cleaning", "清洁剂", "чистящее средство", "chistyashchee sredstvo", "cleaning spray", "a cleaning spray bottle"),
  ri("ri-054", "cleaning", "抹布", "тряпка", "tryapka", "cleaning cloth", "a cleaning rag cloth"),
  ri("ri-055", "cleaning", "熨斗", "утюг", "utyug", "iron", "a clothes iron"),
  ri("ri-056", "cleaning", "熨衣板", "гладильная доска", "gladilnaya doska", "ironing board", "a foldable ironing board"),
  ri("ri-057", "cleaning", "洗衣袋", "мешок для белья", "meshok dlya belya", "laundry bag", "a hotel laundry bag"),
  ri("ri-058", "cleaning", "衣架组", "набор вешалок", "nabor veshalok", "hanger set", "multiple clothes hangers"),
  ri("ri-059", "cleaning", "鞋拔", "рожок для обуви", "rozhok dlya obuvi", "shoe horn", "a shoe horn"),
  ri("ri-060", "cleaning", "衣刷", "щётка для одежды", "shchyotka dlya odezhdy", "clothes brush", "a clothes brush"),

  // 迷你吧 Minibar (10)
  ri("ri-061", "minibar", "迷你冰箱", "мини-холодильник", "mini-kholodilnik", "minibar fridge", "a hotel minibar refrigerator"),
  ri("ri-062", "minibar", "瓶装水", "бутылка воды", "butylka vody", "bottled water", "a bottle of mineral water"),
  ri("ri-063", "minibar", "咖啡", "кофе", "kofe", "coffee", "instant coffee sachet"),
  ri("ri-064", "minibar", "茶", "чай", "chay", "tea", "tea bags in wrapper"),
  ri("ri-065", "minibar", "杯子", "чашка", "chashka", "cup", "a ceramic cup"),
  ri("ri-066", "minibar", "马克杯", "кружка", "kruzhka", "mug", "a coffee mug"),
  ri("ri-067", "minibar", "酒杯", "бокал", "bokal", "wine glass", "a wine glass"),
  ri("ri-068", "minibar", "开瓶器", "открывалка", "otkryvalka", "bottle opener", "a bottle opener"),
  ri("ri-069", "minibar", "零食", "закуска", "zakuska", "snack", "a small snack pack"),
  ri("ri-070", "minibar", "糖包", "сахар", "sakhar", "sugar", "sugar packets"),

  // 文具 Desk (10)
  ri("ri-071", "desk", "笔", "ручка", "ruchka", "pen", "a hotel branded pen"),
  ri("ri-072", "desk", "便签本", "блокнот", "bloknot", "notepad", "a small notepad"),
  ri("ri-073", "desk", "信封", "конверт", "konvert", "envelope", "a paper envelope"),
  ri("ri-074", "desk", "房间指南", "путеводитель по номеру", "putevoditel po nomeru", "room guide", "a hotel room information booklet"),
  ri("ri-075", "desk", "欢迎信", "приветственное письмо", "privetstvennoye pismo", "welcome letter", "a welcome letter on desk"),
  ri("ri-076", "desk", "明信片", "открытка", "otkrytka", "postcard", "a hotel postcard"),
  ri("ri-077", "desk", "圆珠笔", "шариковая ручка", "sharikovaya ruchka", "ballpoint pen", "a ballpoint pen"),
  ri("ri-078", "desk", "文件夹", "папка", "papka", "folder", "a document folder"),
  ri("ri-079", "desk", "订书机", "степлер", "stepler", "stapler", "a small stapler"),
  ri("ri-080", "desk", "胶带", "скotch", "skotch", "tape", "a roll of adhesive tape"),

  // 房间设施 Room (10)
  ri("ri-081", "room", "门", "дверь", "dver", "door", "a hotel room door"),
  ri("ri-082", "room", "门锁", "замок", "zamok", "door lock", "a door lock handle"),
  ri("ri-083", "room", "门把手", "ручка двери", "ruchka dveri", "door handle", "a door handle"),
  ri("ri-084", "room", "窗户", "окно", "okno", "window", "a hotel room window"),
  ri("ri-085", "room", "阳台", "балкон", "balkon", "balcony", "a hotel balcony"),
  ri("ri-086", "room", "保险箱", "сейф", "seyf", "safe", "an in-room safe box"),
  ri("ri-087", "room", "房卡", "ключ-карта", "klyuch-karta", "key card", "a hotel key card"),
  ri("ri-088", "room", "请勿打扰牌", "табличка «Не беспокоить»", "tablichka Ne bespokoit", "do not disturb sign", "a do not disturb door hanger sign"),
  ri("ri-089", "room", "请即打扫牌", "табличка «Уберите номер»", "tablichka Uberite nomer", "please clean sign", "a please make up room door sign"),
  ri("ri-090", "room", "花瓶", "ваза с цветами", "vaza s tsvetami", "flower vase", "a vase with flowers in hotel room"),

  // 安全 Safety (10)
  ri("ri-091", "safety", "烟雾报警器", "датчик дыма", "datchik dyma", "smoke detector", "a ceiling smoke detector"),
  ri("ri-092", "safety", "灭火器", "огнетушитель", "ognetushitel", "fire extinguisher", "a fire extinguisher"),
  ri("ri-093", "safety", "紧急出口", "запасной выход", "zapasnoy vykhod", "emergency exit", "an emergency exit sign"),
  ri("ri-094", "safety", "逃生图", "план эвакуации", "plan evakuatsii", "evacuation plan", "a hotel evacuation map on door"),
  ri("ri-095", "safety", "急救箱", "аптечка", "aptechka", "first aid kit", "a first aid kit box"),
  ri("ri-096", "safety", "手电筒", "фонарик", "fonarik", "flashlight", "a small emergency flashlight"),
  ri("ri-097", "safety", "安全链", "цепочка на двери", "tsepochka na dveri", "door chain", "a hotel door security chain"),
  ri("ri-098", "safety", "窥视孔", "глазок", "glazok", "peephole", "a door peephole"),
  ri("ri-099", "safety", "洗衣单", "бланк прачечной", "blank prachechnoy", "laundry form", "a hotel laundry service form"),
  ri("ri-100", "safety", "客房服务菜单", "меню обслуживания номеров", "menyu obsluzhivaniya nomerov", "room service menu", "a room service menu booklet"),
];

export function getRoomItemById(id: string): HotelRussianRoomItem | undefined {
  return HOTEL_RUSSIAN_ROOM_ITEMS.find((item) => item.id === id);
}

export function getRoomItemsByCategory(category: RoomItemCategory): HotelRussianRoomItem[] {
  return HOTEL_RUSSIAN_ROOM_ITEMS.filter((item) => item.category === category);
}
