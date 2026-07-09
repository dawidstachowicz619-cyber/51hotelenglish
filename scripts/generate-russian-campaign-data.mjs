#!/usr/bin/env node
/**
 * 生成酒店俄语必修闯关数据：客房/餐饮各 30 关 ×（5 句 + 5 词）
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { HOTEL_RUSSIAN_ROOM_ITEMS } from "../lib/data/hotel-russian-room-items.ts";
import { HOTEL_RUSSIAN_DINING_ITEMS } from "../lib/data/hotel-russian-dining-items.ts";
import { ROOM_ITEM_CATEGORY_LABELS } from "../lib/types/hotel-russian-room-item.ts";
import { DINING_ITEM_CATEGORY_LABELS } from "../lib/types/hotel-russian-dining-item.ts";

const SENTENCES_PER_LEVEL = 5;
const WORDS_PER_LEVEL = 5;

const __dirname = dirname(fileURLToPath(import.meta.url));

const ROOM_THEMES = [
  ["入门篇", "客房问候与迎接", "迎宾、问候、自我介绍"],
  ["入门篇", "房间介绍与引导", "介绍房间、指引方向"],
  ["入门篇", "基本礼貌用语", "请、谢谢、不客气"],
  ["入门篇", "客人身份确认", "姓名、护照、预订"],
  ["入门篇", "服务时间说明", "入住退房时间、服务时段"],
  ["入住篇", "办理入住对话", "入住登记、核对信息"],
  ["入住篇", "房卡与钥匙", "房卡、钥匙、门禁"],
  ["入住篇", "行李与搬运", "行李、搬运、寄存"],
  ["入住篇", "楼层与房间号", "楼层、房间号、方向"],
  ["入住篇", "特殊需求登记", "无烟房、高楼层、连通房"],
  ["床品浴室篇", "枕头与被褥", "枕头、床单、被子"],
  ["床品浴室篇", "毛巾与浴巾", "毛巾、浴巾、地巾"],
  ["床品浴室篇", "洗漱用品", "牙刷、洗发水、浴帽"],
  ["床品浴室篇", "浴室设施", "淋浴、马桶、吹风机"],
  ["床品浴室篇", "额外床品请求", "加枕头、换床单"],
  ["设施篇", "迷你吧与饮品", "迷你吧、瓶装水、咖啡"],
  ["设施篇", "电视与遥控", "电视、频道、遥控"],
  ["设施篇", "空调与灯光", "空调、温度、灯光"],
  ["设施篇", "保险箱与网络", "保险箱、Wi-Fi、密码"],
  ["设施篇", "窗帘与安静", "窗帘、噪音、安静"],
  ["服务篇", "打扫与清洁", "打扫、请勿打扰、请即打扫"],
  ["服务篇", "洗衣服务", "洗衣、熨烫、洗衣袋"],
  ["服务篇", "送餐与物品", "送餐、借物品、补货"],
  ["服务篇", "维修与问题", "维修、故障、工程师"],
  ["服务篇", "投诉处理", "道歉、补偿、跟进"],
  ["退房篇", "退房手续", "退房、查房、钥匙"],
  ["退房篇", "账单与付款", "账单、付款、发票"],
  ["退房篇", "遗留物品", "遗留、失物招领"],
  ["退房篇", "VIP与延伸", "会员、升级、延住"],
  ["退房篇", "综合应用", "综合场景对话"],
];

const DINING_THEMES = [
  ["入门篇", "餐厅问候与引位", "问候、引位、就座"],
  ["入门篇", "预订与等位", "预订、等位、叫号"],
  ["入门篇", "菜单与介绍", "菜单、今日特选"],
  ["入门篇", "倒水与餐巾", "倒水、餐巾、餐具"],
  ["入门篇", "基本点餐用语", "点餐、推荐、等待"],
  ["点餐篇", "开胃菜与汤", "前菜、汤、沙拉"],
  ["点餐篇", "主菜与扒类", "牛排、鱼、意面"],
  ["点餐篇", "饮品点单", "水、果汁、软饮"],
  ["点餐篇", "甜品与咖啡", "甜品、咖啡、茶"],
  ["点餐篇", "特殊饮食需求", "过敏、素食、无麸质"],
  ["餐桌服务篇", "上菜与介绍", "上菜、报菜名"],
  ["餐桌服务篇", "换碟与撤盘", "换碟、撤盘、清理"],
  ["餐桌服务篇", "斟酒服务", "红酒、白酒、倒酒"],
  ["餐桌服务篇", "加餐与分餐", "加餐、分餐、公筷"],
  ["餐桌服务篇", "速度与时效", "催菜、稍等、即上"],
  ["饮品篇", "咖啡与茶", "浓缩、卡布、红茶"],
  ["饮品篇", "葡萄酒服务", "红酒、醒酒、品鉴"],
  ["饮品篇", "啤酒与软饮", "啤酒、可乐、苏打"],
  ["饮品篇", "鸡尾酒与酒吧", "鸡尾酒、调酒、冰"],
  ["饮品篇", "水与矿泉水", "矿泉水、气泡水、常温"],
  ["自助餐篇", "自助餐引导", "取餐、餐台、介绍"],
  ["自助餐篇", "保温与补货", "补货、保温、新鲜"],
  ["自助餐篇", "收盘与整洁", "收盘、换盘、整洁"],
  ["自助餐篇", "儿童与家庭", "儿童椅、儿童餐"],
  ["自助餐篇", "过敏与标识", "过敏原、标签、说明"],
  ["结账篇", "结账与付款", "买单、刷卡、现金"],
  ["结账篇", "小费与发票", "小费、发票、收据"],
  ["结账篇", "投诉与补救", "道歉、换菜、退菜"],
  ["结账篇", "宴会与客房送餐", "宴会、Room Service"],
  ["结账篇", "综合应用", "综合餐饮场景"],
];

const ROOM_PHRASES = [
  ["欢迎光临！", "Добро пожаловать!", "Dobro pozhalovat!", "Welcome!", "前台问候"],
  ["很高兴为您服务。", "Рад вас обслуживать.", "Rad vas obsluzhivat!", "Happy to serve you.", "服务承诺"],
  ["请问您的姓名？", "Как ваша фамилия?", "Kak vasha familiya?", "May I have your name?", "入住登记"],
  ["请出示您的护照。", "Покажите ваш паспорт, пожалуйста.", "Pokazhite vash pasport, pozhaluysta.", "Please show your passport.", "身份验证"],
  ["这是您的房卡。", "Вот ваша ключ-карта.", "Vot vasha klyuch-karta.", "Here is your key card.", "发放房卡"],
  ["您的房间在八楼。", "Ваш номер на восьмом этаже.", "Vash nomer na vosmom etazhe.", "Your room is on the 8th floor.", "指引楼层"],
  ["电梯在那边。", "Лифт там.", "Lift tam.", "The elevator is over there.", "指引方向"],
  ["需要帮您拿行李吗？", "Помочь с багажом?", "Pomoch s bagazhom?", "May I help with your luggage?", "行李服务"],
  ["入住时间是下午三点。", "Заезд в три часа дня.", "Zaezd v tri chasa dnya.", "Check-in is at 3 PM.", "政策说明"],
  ["退房时间是中午十二点。", "Выезд в двенадцать часов.", "Vyezd v dvenadtsat chasov.", "Check-out is at noon.", "政策说明"],
  ["请稍等，我查一下预订。", "Подождите, проверю бронирование.", "Podozhdite, proveryu bronirovanie.", "Please wait while I check your reservation.", "查预订"],
  ["您预订的是大床房。", "Вы забронировали номер с большой кроватью.", "Vy zabronirovali nomer s bolshoy krovatyu.", "You booked a king room.", "确认房型"],
  ["需要无烟房吗？", "Вам нужен номер для некурящих?", "Vam nuzhen nomer dlya nekuryashchikh?", "Do you need a non-smoking room?", "偏好询问"],
  ["早餐从七点到十点半。", "Завтрак с семи до половины одиннадцатого.", "Zavtrak s semi do poloviny odinnadtsatogo.", "Breakfast is from 7 to 10:30.", "餐饮信息"],
  ["Wi-Fi 密码在房间卡片上。", "Пароль Wi-Fi на карточке в номере.", "Parol Wi-Fi na kartochke v nomere.", "The Wi-Fi password is on the room card.", "网络说明"],
  ["需要加一条毛巾吗？", "Добавить полотенце?", "Dobavit polotentse?", "Would you like an extra towel?", "客房服务"],
  ["我派人去帮您修空调。", "Отправлю мастера по кондиционеру.", "Otpravlyu mastera po konditsioneru.", "I'll send someone to fix the AC.", "维修安排"],
  ["非常抱歉给您带来不便。", "Приношу извинения за неудобства.", "Prinoshu izvineniya za neudobstva.", "We apologize for the inconvenience.", "道歉"],
  ["请挂「请勿打扰」牌。", "Повесьте табличку «Не беспокоить».", "Poveshte tablichku Ne bespokoit.", "Please hang the Do Not Disturb sign.", "清洁说明"],
  ["需要现在打扫房间吗？", "Убрать номер сейчас?", "Ubrat nomer seychas?", "Would you like housekeeping now?", "打扫请求"],
  ["迷你吧里的商品需付费。", "Товары из мини-бара оплачиваются отдельно.", "Tovary iz mini-bara oplachivayutsya otdelno.", "Minibar items are charged separately.", "迷你吧"],
  ["保险箱在衣柜里。", "Сейф в шкафу.", "Seyf v shkafu.", "The safe is in the wardrobe.", "设施介绍"],
  ["需要婴儿床吗？", "Вам нужна детская кроватка?", "Vam nuzhna detskaya krovatka?", "Do you need a baby crib?", "特殊需求"],
  ["枕头偏软还是偏硬？", "Мягкая или жёсткая подушка?", "Myagkaya ili zhyostkaya podushka?", "Soft or firm pillow?", "枕头偏好"],
  ["请填写洗衣单。", "Заполните бланк прачечной.", "Zapolnite blank prachechnoy.", "Please fill out the laundry form.", "洗衣服务"],
  ["您的账单请核对。", "Проверьте ваш счёт, пожалуйста.", "Proverite vash schet, pozhaluysta.", "Please review your bill.", "退房结账"],
  ["可以开发票吗？", "Можно получить счёт-фактуру?", "Mozhno poluchit schet-fakturu?", "Can I get an invoice?", "发票"],
  ["欢迎再次光临。", "Ждём вас снова.", "Zhdem vas snova.", "We look forward to seeing you again.", "送别"],
  ["祝您旅途愉快！", "Хорошей поездки!", "Khoroshey poezdki!", "Have a pleasant trip!", "祝福"],
  ["如有问题请拨零联系前台。", "При проблемах наберите ноль.", "Pri problemakh naberite nol.", "Dial zero for the front desk.", "联系方式"],
];

const DINING_PHRASES = [
  ["欢迎光临餐厅！", "Добро пожаловать в ресторан!", "Dobro pozhalovat v restoran!", "Welcome to the restaurant!", "餐厅问候"],
  ["请问几位？", "Сколько человек?", "Skolko chelovek?", "How many guests?", "人数询问"],
  ["有预订吗？", "У вас есть бронь?", "U vas est bron?", "Do you have a reservation?", "预订确认"],
  ["请跟我来。", "Пройдите за мной, пожалуйста.", "Proydite za mnoy, pozhaluysta.", "Please follow me.", "引位"],
  ["这是菜单。", "Вот меню.", "Vot menyu.", "Here is the menu.", "递菜单"],
  ["今日特选在这里。", "Блюдо дня здесь.", "Blyudo dnya zdes.", "Today's special is here.", "推荐"],
  ["需要看酒单吗？", "Посмотреть винную карту?", "Posmotret vinnuyu kartu?", "Would you like the wine list?", "酒单"],
  ["请稍等，马上为您倒水。", "Сейчас принесу воду.", "Seychas prinesu vodu.", "I'll bring water shortly.", "倒水"],
  ["您准备好点餐了吗？", "Готовы сделать заказ?", "Gotovy sdelat zakaz?", "Ready to order?", "点餐"],
  ["推荐我们的招牌牛排。", "Рекомендую наш фирменный стейк.", "Rekomenduyu nash firmennyy steyk.", "I recommend our signature steak.", "推荐菜"],
  ["要几分熟？", "Как прожарить?", "Kak prozharit?", "How would you like it cooked?", "牛排熟度"],
  ["对什么过敏吗？", "Есть аллергия?", "Est allergiya?", "Any allergies?", "过敏询问"],
  ["这是素食选项。", "Это вегетарианское блюдо.", "Eto vegetarianское blyudo.", "This is a vegetarian option.", "素食"],
  ["汤有点烫，请小心。", "Суп горячий, будьте осторожны.", "Sup goryachiy, budte ostorozhny.", "The soup is hot, be careful.", "上菜提醒"],
  ["为您上主菜。", "Подаю основное блюдо.", "Podayu osnovnoye blyudo.", "Here is your main course.", "上主菜"],
  ["需要黑胡椒吗？", "Добавить чёрный перец?", "Dobavit chyornyy perets?", "Would you like black pepper?", "调料"],
  ["要续杯吗？", "Ещё налить?", "Eshche nalit?", "Would you like a refill?", "续杯"],
  ["甜点要现在上还是稍后？", "Десерт сейчас или позже?", "Desert seychas ili pozzhe?", "Dessert now or later?", "甜品时机"],
  ["咖啡要浓缩还是美式？", "Эспрессо или американо?", "Espresso ili amerikano?", "Espresso or Americano?", "咖啡"],
  ["红酒请先醒一下。", "Сначала декантируем вино.", "Snachala dekantiruem vino.", "Let the wine breathe first.", "斟酒"],
  ["请慢用。", "Приятного аппетита!", "Priatnogo appetita!", "Enjoy your meal!", "祝福语"],
  ["撤盘可以吗？", "Можно убрать тарелку?", "Mozhno ubrat tarelku?", "May I clear the plate?", "撤盘"],
  ["菜品稍等片刻。", "Блюдо будет через несколько минут.", "Blyudo budet cherez neskolko minut.", "Your dish will be ready shortly.", "催菜回复"],
  ["非常抱歉让您久等。", "Извините за ожидание.", "Izvinite za ozhidanie.", "Sorry for the wait.", "道歉"],
  ["可以为您打包吗？", "Упаковать с собой?", "Upakovat s soboy?", "Would you like a takeaway box?", "打包"],
  ["账单一共多少？", "Сколько с меня?", "Skolko s menya?", "What is the total?", "结账"],
  ["可以刷卡吗？", "Можно картой?", "Mozhno kartoy?", "Can I pay by card?", "付款"],
  ["需要收据吗？", "Нужен чек?", "Nuzhen chek?", "Do you need a receipt?", "收据"],
  ["谢谢光临，欢迎再来。", "Спасибо, ждём снова.", "Spasibo, zhdem snova.", "Thank you, come again.", "送别"],
  ["客房送餐已送到。", "Доставка в номер доставлена.", "Dostavka v nomer dostavlena.", "Room service has arrived.", "送餐"],
];

function expandPhrases(base, level, theme, dept, count = SENTENCES_PER_LEVEL) {
  const sentences = [];
  const start = ((level - 1) * count) % base.length;
  for (let i = 0; i < count; i++) {
    const src = base[(start + i) % base.length];
    const [chinese, russian, transliteration, english, context] = src;
    sentences.push({
      id: `${dept}-lv-${String(level).padStart(2, "0")}-s${String(i + 1).padStart(2, "0")}`,
      chinese,
      russian,
      transliteration,
      english,
      context: `${context} · ${theme}`,
    });
  }
  return sentences;
}

function pickWords(items, labels, level, theme, dept, count = WORDS_PER_LEVEL) {
  const words = [];
  const start = ((level - 1) * count) % items.length;
  for (let i = 0; i < count; i++) {
    const item = items[(start + i) % items.length];
    const category = labels[item.category]?.zh ?? item.category;
    words.push({
      id: `${dept}-lv-${String(level).padStart(2, "0")}-w${String(i + 1).padStart(2, "0")}`,
      chinese: item.chinese,
      russian: item.russian,
      transliteration: item.transliteration,
      english: item.english,
      category: `${category} · ${theme}`,
    });
  }
  return words;
}

function buildCampaign(dept, themes, basePhrases, itemPool, categoryLabels) {
  const levels = themes.map(([zone, title, subtitle], index) => {
    const level = index + 1;
    return {
      id: `${dept}-lv-${String(level).padStart(2, "0")}`,
      department: dept,
      level,
      zone,
      title,
      subtitle,
      sentences: expandPhrases(basePhrases, level, title, dept, SENTENCES_PER_LEVEL),
      words: pickWords(itemPool, categoryLabels, level, title, dept, WORDS_PER_LEVEL),
    };
  });
  const totalSentences = levels.length * SENTENCES_PER_LEVEL;
  const totalWords = levels.length * WORDS_PER_LEVEL;
  return {
    department: dept,
    titleZh: dept === "room" ? "客房部" : "餐饮部",
    titleEn: dept === "room" ? "Housekeeping" : "Food & Beverage",
    description:
      dept === "room"
        ? `酒店俄语必修 · 客房部 30 关 · 每关 ${SENTENCES_PER_LEVEL} 句 + ${WORDS_PER_LEVEL} 词`
        : `酒店俄语必修 · 餐饮部 30 关 · 每关 ${SENTENCES_PER_LEVEL} 句 + ${WORDS_PER_LEVEL} 词`,
    totalLevels: 30,
    totalSentences,
    totalWords,
    levels,
  };
}

const roomCampaign = buildCampaign(
  "room",
  ROOM_THEMES,
  ROOM_PHRASES,
  HOTEL_RUSSIAN_ROOM_ITEMS,
  ROOM_ITEM_CATEGORY_LABELS
);
const diningCampaign = buildCampaign(
  "dining",
  DINING_THEMES,
  DINING_PHRASES,
  HOTEL_RUSSIAN_DINING_ITEMS,
  DINING_ITEM_CATEGORY_LABELS
);

const out = `/* AUTO-GENERATED by scripts/generate-russian-campaign-data.mjs — do not edit manually */
import type { RussianCampaign } from "@/lib/types/hotel-russian-campaign";

export const HOTEL_RUSSIAN_ROOM_CAMPAIGN: RussianCampaign = ${JSON.stringify(roomCampaign, null, 2)};

export const HOTEL_RUSSIAN_DINING_CAMPAIGN: RussianCampaign = ${JSON.stringify(diningCampaign, null, 2)};

export function getRussianCampaign(department: "room" | "dining"): RussianCampaign {
  return department === "room" ? HOTEL_RUSSIAN_ROOM_CAMPAIGN : HOTEL_RUSSIAN_DINING_CAMPAIGN;
}

export function getCampaignLevel(department: "room" | "dining", level: number) {
  return getRussianCampaign(department).levels.find((l) => l.level === level);
}
`;

writeFileSync(join(__dirname, "../lib/data/hotel-russian-campaign-data.ts"), out);
console.log("Generated hotel-russian-campaign-data.ts");
console.log(
  `Room: ${roomCampaign.levels.length} levels, ${roomCampaign.totalSentences} sentences, ${roomCampaign.totalWords} words`
);
console.log(
  `Dining: ${diningCampaign.levels.length} levels, ${diningCampaign.totalSentences} sentences, ${diningCampaign.totalWords} words`
);
