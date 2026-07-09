import type { RussianScenario } from "@/lib/types/hotel-russian";

export const HOTEL_RUSSIAN_SCENARIOS: RussianScenario[] = [
  {
    id: "check-in",
    title: "办理入住",
    subtitle: "Регистрация · Check-in",
    description: "从迎宾问候、核对预订到发放房卡，掌握前厅接待俄罗斯宾客的核心表达。",
    icon: "reception",
    words: [
      {
        id: "ci-w1",
        russian: "ресепшен",
        transliteration: "reception",
        chinese: "前台",
        english: "front desk / reception",
        example: "Пожалуйста, подойдите к ресепшен.",
      },
      {
        id: "ci-w2",
        russian: "бронирование",
        transliteration: "bronirovaniye",
        chinese: "预订",
        english: "reservation",
        example: "У меня есть бронирование.",
      },
      {
        id: "ci-w3",
        russian: "паспорт",
        transliteration: "pasport",
        chinese: "护照",
        english: "passport",
        example: "Покажите ваш паспорт, пожалуйста.",
      },
      {
        id: "ci-w4",
        russian: "ключ-карта",
        transliteration: "klyuch-karta",
        chinese: "房卡",
        english: "key card",
        example: "Вот ваша ключ-карта.",
      },
      {
        id: "ci-w5",
        russian: "номер",
        transliteration: "nomer",
        chinese: "房间",
        english: "room",
        example: "Ваш номер на восьмом этаже.",
      },
      {
        id: "ci-w6",
        russian: "завтрак",
        transliteration: "zavtrak",
        chinese: "早餐",
        english: "breakfast",
        example: "Завтрак с семи до десяти.",
      },
    ],
    sentences: [
      {
        id: "ci-s1",
        russian: "Добро пожаловать в наш отель!",
        transliteration: "Dobro pozhalovat' v nash otel'!",
        chinese: "欢迎光临本酒店！",
        english: "Welcome to our hotel!",
        context: "迎宾问候",
      },
      {
        id: "ci-s2",
        russian: "У вас есть бронирование?",
        transliteration: "U vas yest' bronirovaniye?",
        chinese: "请问您有预订吗？",
        english: "Do you have a reservation?",
        context: "核对预订",
      },
      {
        id: "ci-s3",
        russian: "Покажите, пожалуйста, ваш паспорт.",
        transliteration: "Pokazhite, pozhaluysta, vash pasport.",
        chinese: "请出示您的护照。",
        english: "May I see your passport, please?",
        context: "登记证件",
      },
      {
        id: "ci-s4",
        russian: "Ваш номер готов на восьмом этаже.",
        transliteration: "Vash nomer gotov na vosmom etazhe.",
        chinese: "您的房间已准备好，在八楼。",
        english: "Your room is ready on the eighth floor.",
        context: "告知房号",
      },
      {
        id: "ci-s5",
        russian: "Завтрак подаётся с семи до десяти утра.",
        transliteration: "Zavtrak podayotsya s semi do desyati utra.",
        chinese: "早餐供应时间为早上七点到十点。",
        english: "Breakfast is served from 7 to 10 a.m.",
        context: "介绍设施",
      },
    ],
    dialogues: [
      {
        id: "ci-d1",
        title: "标准入住",
        subtitle: "Standard Check-in",
        lines: [
          {
            speaker: "staff",
            russian: "Добро пожаловать! Чем могу помочь?",
            transliteration: "Dobro pozhalovat'! Chem mogu pomoch'?",
            chinese: "欢迎光临！请问有什么可以帮您？",
          },
          {
            speaker: "guest",
            russian: "Здравствуйте. У меня есть бронирование на имя Ivanov.",
            transliteration: "Zdravstvuyte. U menya yest' bronirovaniye na imya Ivanov.",
            chinese: "您好，我以 Ivanov 的名字预订了房间。",
          },
          {
            speaker: "staff",
            russian: "Хорошо. Покажите, пожалуйста, ваш паспорт.",
            transliteration: "Khorosho. Pokazhite, pozhaluysta, vash pasport.",
            chinese: "好的，请出示您的护照。",
          },
          {
            speaker: "guest",
            russian: "Конечно, вот, пожалуйста.",
            transliteration: "Konechno, vot, pozhaluysta.",
            chinese: "当然，给您。",
          },
          {
            speaker: "staff",
            russian: "Ваш номер 812 на восьмом этаже. Вот ключ-карта.",
            transliteration: "Vash nomer 812 na vosmom etazhe. Vot klyuch-karta.",
            chinese: "您的房间是 812，在八楼。这是您的房卡。",
          },
          {
            speaker: "guest",
            russian: "Спасибо! Во сколько завтрак?",
            transliteration: "Spasibo! Vo skol'ko zavtrak?",
            chinese: "谢谢！早餐几点开始？",
          },
          {
            speaker: "staff",
            russian: "Завтрак с семи до десяти. Приятного отдыха!",
            transliteration: "Zavtrak s semi do desyati. Priyatnogo otdykha!",
            chinese: "早餐从七点到十点。祝您入住愉快！",
          },
        ],
      },
    ],
    practice: [],
  },
  {
    id: "restaurant",
    title: "餐厅点餐",
    subtitle: "Ресторан · Restaurant",
    description: "引导就座、介绍菜单、确认过敏信息与结账，轻松应对俄语餐饮场景。",
    icon: "fnb",
    words: [
      {
        id: "rs-w1",
        russian: "меню",
        transliteration: "menyu",
        chinese: "菜单",
        english: "menu",
        example: "Вот наше меню.",
      },
      {
        id: "rs-w2",
        russian: "заказ",
        transliteration: "zakaz",
        chinese: "点餐 / 订单",
        english: "order",
        example: "Вы готовы сделать заказ?",
      },
      {
        id: "rs-w3",
        russian: "аллергия",
        transliteration: "allergiya",
        chinese: "过敏",
        english: "allergy",
        example: "У вас есть аллергия?",
      },
      {
        id: "rs-w4",
        russian: "счёт",
        transliteration: "schyot",
        chinese: "账单",
        english: "bill / check",
        example: "Можно счёт, пожалуйста?",
      },
      {
        id: "rs-w5",
        russian: "официант",
        transliteration: "ofitsiant",
        chinese: "服务员",
        english: "waiter",
        example: "Официант подойдёт через минуту.",
      },
    ],
    sentences: [
      {
        id: "rs-s1",
        russian: "Прошу, садитесь. Вот меню.",
        transliteration: "Proshu, sadites'. Vot menyu.",
        chinese: "请这边就座，这是菜单。",
        english: "Please have a seat. Here is the menu.",
        context: "引导就座",
      },
      {
        id: "rs-s2",
        russian: "Вы готовы сделать заказ?",
        transliteration: "Vy gotovy sdelat' zakaz?",
        chinese: "您准备好点餐了吗？",
        english: "Are you ready to order?",
        context: "开始点餐",
      },
      {
        id: "rs-s3",
        russian: "У вас есть аллергия на что-либо?",
        transliteration: "U vas yest' allergiya na chto-libo?",
        chinese: "您对什么食物过敏吗？",
        english: "Do you have any food allergies?",
        context: "确认饮食",
      },
      {
        id: "rs-s4",
        russian: "Приятного аппетита!",
        transliteration: "Priyatnogo appetita!",
        chinese: "祝您用餐愉快！",
        english: "Enjoy your meal!",
        context: "上菜祝福",
      },
    ],
    dialogues: [
      {
        id: "rs-d1",
        title: "晚餐点餐",
        subtitle: "Dinner Order",
        lines: [
          {
            speaker: "staff",
            russian: "Добрый вечер! Столик на двоих?",
            transliteration: "Dobryy vecher! Stolik na dvoikh?",
            chinese: "晚上好！两位用餐吗？",
          },
          {
            speaker: "guest",
            russian: "Да, пожалуйста. У нас бронь на 19:00.",
            transliteration: "Da, pozhaluysta. U nas bron' na 19:00.",
            chinese: "是的，我们预订了晚上 7 点的位子。",
          },
          {
            speaker: "staff",
            russian: "Конечно. Вот меню. Сегодня рекомендуем рыбу.",
            transliteration: "Konechno. Vot menyu. Segodnya rekomenduyem rybu.",
            chinese: "好的，这是菜单。今日推荐鱼料理。",
          },
          {
            speaker: "guest",
            russian: "У меня аллергия на орехи.",
            transliteration: "U menya allergiya na orekhi.",
            chinese: "我对坚果过敏。",
          },
          {
            speaker: "staff",
            russian: "Понял. Я сообщу на кухню. Готовы заказать?",
            transliteration: "Ponyal. Ya soobshchu na kukhnyu. Gotovy zakazat'?",
            chinese: "明白了，我会告知厨房。可以点餐了吗？",
          },
        ],
      },
    ],
    practice: [],
  },
  {
    id: "housekeeping",
    title: "客房服务",
    subtitle: "Хаускипинг · Housekeeping",
    description: "打扫请求、补充备品与「请勿打扰」，用简单俄语完成客房沟通。",
    icon: "housekeeping",
    words: [
      {
        id: "hk-w1",
        russian: "уборка",
        transliteration: "uborka",
        chinese: "打扫",
        english: "cleaning",
        example: "Могу я сейчас убрать номер?",
      },
      {
        id: "hk-w2",
        russian: "полотенце",
        transliteration: "polotentse",
        chinese: "毛巾",
        english: "towel",
        example: "Нужны чистые полотенца?",
      },
      {
        id: "hk-w3",
        russian: "не беспокоить",
        transliteration: "ne bespokoit'",
        chinese: "请勿打扰",
        english: "do not disturb",
        example: "На двери табличка «Не беспокоить».",
      },
      {
        id: "hk-w4",
        russian: "подушка",
        transliteration: "podushka",
        chinese: "枕头",
        english: "pillow",
        example: "Нужна дополнительная подушка?",
      },
      {
        id: "hk-w5",
        russian: "горничная",
        transliteration: "gornichnaya",
        chinese: "客房服务员",
        english: "housekeeper",
        example: "Горничная придёт через десять минут.",
      },
    ],
    sentences: [
      {
        id: "hk-s1",
        russian: "Могу я сейчас убрать ваш номер?",
        transliteration: "Mogu ya seychas ubrat' vash nomer?",
        chinese: "我现在可以打扫您的房间吗？",
        english: "May I clean your room now?",
        context: "敲门询问",
      },
      {
        id: "hk-s2",
        russian: "Вам нужны чистые полотенца?",
        transliteration: "Vam nuzhny chistyye polotentsa?",
        chinese: "需要更换干净毛巾吗？",
        english: "Would you like fresh towels?",
        context: "补充备品",
      },
      {
        id: "hk-s3",
        russian: "Пожалуйста, повесьте табличку «Не беспокоить».",
        transliteration: "Pozhaluysta, poves'te tablichku «Ne bespokoit'».",
        chinese: "请挂上「请勿打扰」牌。",
        english: "Please hang the Do Not Disturb sign.",
        context: "隐私说明",
      },
      {
        id: "hk-s4",
        russian: "Мы принесём дополнительную подушку.",
        transliteration: "My prinesem dopolnitel'nuyu podushku.",
        chinese: "我们会再送一个枕头来。",
        english: "We will bring an extra pillow.",
        context: "客人请求",
      },
    ],
    dialogues: [
      {
        id: "hk-d1",
        title: "客房打扫",
        subtitle: "Room Cleaning",
        lines: [
          {
            speaker: "staff",
            russian: "Здравствуйте! Это горничная. Могу убрать номер?",
            transliteration: "Zdravstvuyte! Eto gornichnaya. Mogu ubrat' nomer?",
            chinese: "您好！我是客房服务员，可以打扫房间吗？",
          },
          {
            speaker: "guest",
            russian: "Сейчас неудобно. Можно через час?",
            transliteration: "Seychas neudobno. Mozhno cherez chas?",
            chinese: "现在不太方便，可以一小时后再来吗？",
          },
          {
            speaker: "staff",
            russian: "Конечно. Нужны чистые полотенца?",
            transliteration: "Konechno. Nuzhny chistyye polotentsa?",
            chinese: "当然可以。需要干净毛巾吗？",
          },
          {
            speaker: "guest",
            russian: "Да, и ещё одну подушку, пожалуйста.",
            transliteration: "Da, i yeshchyo odnu podushku, pozhaluysta.",
            chinese: "要的，还请再给我一个枕头。",
          },
          {
            speaker: "staff",
            russian: "Хорошо, я вернусь через час. Спасибо!",
            transliteration: "Khorosho, ya vernus' cherez chas. Spasibo!",
            chinese: "好的，我一小时后再来。谢谢！",
          },
        ],
      },
    ],
    practice: [],
  },
];

export function getRussianScenarioById(id: string): RussianScenario | undefined {
  return HOTEL_RUSSIAN_SCENARIOS.find((s) => s.id === id);
}

export function getRussianCourseStats() {
  const words = HOTEL_RUSSIAN_SCENARIOS.reduce((n, s) => n + s.words.length, 0);
  const sentences = HOTEL_RUSSIAN_SCENARIOS.reduce((n, s) => n + s.sentences.length, 0);
  const dialogues = HOTEL_RUSSIAN_SCENARIOS.reduce((n, s) => n + s.dialogues.length, 0);
  return {
    scenarios: HOTEL_RUSSIAN_SCENARIOS.length,
    words,
    sentences,
    dialogues,
  };
}

/** 首页预览用：扁平化常用句 */
export function getRussianPreviewPhrases() {
  return HOTEL_RUSSIAN_SCENARIOS.flatMap((scenario) =>
    scenario.sentences.map((s) => ({
      id: s.id,
      category: scenario.icon,
      chinese: s.chinese,
      russian: s.russian,
      transliteration: s.transliteration,
      english: s.english,
    }))
  );
}
