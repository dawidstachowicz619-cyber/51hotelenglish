import type { ScenarioItem, WorkScenario } from "@/lib/types/course";

import {
  attachSimulations,
  getLevelSimulations,
  SIMULATIONS_PER_LEVEL,
} from "./front-desk/simulation-generator";

export { getLevelSimulations, SIMULATIONS_PER_LEVEL };

/** 基础数据（含 legacy scenario 字段，由 attachSimulations 转为 scenarios[]） */
type WorkScenarioDraft = Omit<WorkScenario, "levels"> & {
  levels: (Omit<WorkScenario["levels"][number], "scenarios"> & {
    scenario: ScenarioItem;
  })[];
};

import { FRONT_DESK_DEPARTMENTS } from "@/lib/types/front-desk-department";

const frontDeskWorkScenariosBase: WorkScenarioDraft[] = [
  {
    id: "check-in",
    title: "办理入住",
    subtitle: "Check-in",
    description: "从迎宾问候、核对预订到发放房卡，完成标准入住全流程。",
    image: "photo-1564501049412-61c2a3083791",
    levels: [
      {
        level: "A2",
        words: [
          {
            id: "ci-a2-w1",
            english: "Check-in",
            phonetic: "/ˈtʃek ɪn/",
            chinese: "入住登记",
            example: "Check-in time is from 3:00 PM.",
          },
          {
            id: "ci-a2-w2",
            english: "Reservation",
            phonetic: "/ˌrezərˈveɪʃn/",
            chinese: "预订",
            example: "I have a reservation under the name Wang.",
          },
          {
            id: "ci-a2-w3",
            english: "Front desk",
            phonetic: "/frʌnt desk/",
            chinese: "前台",
            example: "Please contact the front desk for any assistance.",
          },
          {
            id: "ci-a2-w4",
            english: "Key card",
            phonetic: "/kiː kɑːrd/",
            chinese: "房卡",
            example: "Here is your key card for room 1208.",
          },
          {
            id: "ci-a2-w5",
            english: "Lobby",
            phonetic: "/ˈlɒbi/",
            chinese: "大堂",
            example: "Please wait in the lobby while we prepare your room.",
          },
        ],
        sentences: [
          {
            id: "ci-a2-s1",
            english: "Welcome to Grand Horizon Hotel. How may I assist you today?",
            chinese: "欢迎光临 Grand Horizon 酒店。请问有什么可以帮您？",
            context: "迎宾问候",
          },
          {
            id: "ci-a2-s2",
            english: "May I have your reservation name, please?",
            chinese: "请问您的预订姓名是？",
            context: "查找预订",
          },
          {
            id: "ci-a2-s3",
            english: "Could I see your passport or ID, please?",
            chinese: "请出示您的护照或身份证件。",
            context: "登记证件",
          },
          {
            id: "ci-a2-s4",
            english: "Your room is ready on the 15th floor.",
            chinese: "您的房间已准备好，位于 15 楼。",
            context: "告知房号",
          },
        ],
        dialogues: [
          {
            id: "ci-a2-d1",
            title: "基础入住",
            subtitle: "Basic Check-in",
            lines: [
              {
                speaker: "guest",
                english: "Hello. I have a reservation.",
                chinese: "你好，我有预订。",
              },
              {
                speaker: "staff",
                english: "Welcome. May I have your name, please?",
                chinese: "欢迎光临。请问您的姓名？",
              },
              {
                speaker: "guest",
                english: "Chen Wei.",
                chinese: "陈伟。",
              },
              {
                speaker: "staff",
                english: "Thank you, Mr. Chen. Here is your key card. Your room is on the 12th floor.",
                chinese: "谢谢您，陈先生。这是您的房卡。您的房间在 12 楼。",
              },
            ],
          },
        ],
        scenario: {
          id: "ci-a2-sc",
          title: "散客入住练习",
          setting: "Hotel front desk, afternoon arrival",
          description:
            "一位有预订的客人到达前台。你需要完成问候、核对姓名、收取证件并发放房卡。",
          objectives: [
            "用英语欢迎客人",
            "询问并确认预订姓名",
            "说明房号与房卡使用方式",
          ],
          keyPhrases: [
            {
              english: "Welcome to our hotel.",
              chinese: "欢迎光临本酒店。",
            },
            {
              english: "May I see your ID, please?",
              chinese: "请出示您的证件。",
            },
            {
              english: "Enjoy your stay!",
              chinese: "祝您入住愉快！",
            },
          ],
          sampleDialogue: [
            {
              speaker: "staff",
              english: "Good afternoon. Welcome to Grand Horizon Hotel.",
              chinese: "下午好。欢迎光临 Grand Horizon 酒店。",
            },
            {
              speaker: "guest",
              english: "I booked a room online.",
              chinese: "我在网上订了房间。",
            },
            {
              speaker: "staff",
              english: "Perfect. May I have your name and passport, please?",
              chinese: "好的。请提供您的姓名和护照。",
            },
          ],
        },
      },
      {
        level: "B1",
        words: [
          {
            id: "ci-b1-w1",
            english: "Twin room",
            phonetic: "/twɪn ruːm/",
            chinese: "双床房",
            example: "Your twin room is on the 8th floor.",
          },
          {
            id: "ci-b1-w2",
            english: "Complimentary",
            phonetic: "/ˌkɒmplɪˈmentri/",
            chinese: "免费的",
            example: "Breakfast is complimentary for all guests.",
          },
          {
            id: "ci-b1-w3",
            english: "Deposit",
            phonetic: "/dɪˈpɒzɪt/",
            chinese: "押金",
            example: "We require a deposit of 500 yuan.",
          },
          {
            id: "ci-b1-w4",
            english: "Suite",
            phonetic: "/swiːt/",
            chinese: "套房",
            example: "We have upgraded you to a deluxe suite.",
          },
        ],
        sentences: [
          {
            id: "ci-b1-s1",
            english: "Would you prefer a king-size bed or twin beds?",
            chinese: "您偏好大床还是双床？",
            context: "确认房型",
          },
          {
            id: "ci-b1-s2",
            english: "Breakfast is served from 6:30 AM to 10:30 AM on the 2nd floor.",
            chinese: "早餐供应时间为早上 6:30 至 10:30，位于 2 楼。",
            context: "介绍设施",
          },
          {
            id: "ci-b1-s3",
            english: "We have noted your preference for a high floor and a quiet room.",
            chinese: "我们已记录您偏好高楼层和安静房间的要求。",
            context: "确认偏好",
          },
          {
            id: "ci-b1-s4",
            english: "Your credit card will be pre-authorized for incidentals.",
            chinese: "您的信用卡将预授权用于杂费。",
            context: "预授权说明",
          },
        ],
        dialogues: [
          {
            id: "ci-b1-d1",
            title: "标准入住流程",
            subtitle: "Standard Check-in",
            lines: [
              {
                speaker: "guest",
                english: "Good evening. I have a reservation under the name Chen.",
                chinese: "晚上好，我以 Chen 的名字预订了房间。",
              },
              {
                speaker: "staff",
                english: "Good evening, Mr. Chen. Welcome to our hotel. May I see your passport, please?",
                chinese: "陈先生，晚上好。欢迎光临。请出示您的护照。",
              },
              {
                speaker: "guest",
                english: "Here you are. I'd like a non-smoking room, if possible.",
                chinese: "给您。如果可能的话，我想要无烟房。",
              },
              {
                speaker: "staff",
                english: "Certainly. I've assigned you a deluxe king room on the 18th floor. It's a non-smoking room with a panoramic view.",
                chinese: "好的。我为您安排了 18 楼豪华大床无烟房，享有全景视野。",
              },
              {
                speaker: "guest",
                english: "That sounds perfect. What time is breakfast?",
                chinese: "听起来很棒。早餐几点开始？",
              },
              {
                speaker: "staff",
                english: "Breakfast is from 6:30 to 10:30 at the All-Day Dining on the 2nd floor. Here is your key card. Enjoy your stay!",
                chinese: "早餐在 2 楼全日餐厅，6:30 至 10:30。这是您的房卡。祝您入住愉快！",
              },
            ],
          },
        ],
        scenario: {
          id: "ci-b1-sc",
          title: "偏好确认入住",
          setting: "Front desk, evening peak check-in",
          description:
            "客人有明确的房型与楼层偏好，并询问早餐与设施。你需要在登记过程中主动确认需求并介绍酒店信息。",
          objectives: [
            "确认无烟房/床型偏好",
            "说明预授权政策",
            "介绍早餐时间与地点",
          ],
          keyPhrases: [
            {
              english: "I've assigned you a non-smoking room on the 18th floor.",
              chinese: "我为您安排了 18 楼无烟房。",
            },
            {
              english: "Breakfast is complimentary and served on the 2nd floor.",
              chinese: "早餐免费，在 2 楼供应。",
            },
            {
              english: "Is there anything else I can help you with?",
              chinese: "还有什么我可以帮您的吗？",
            },
          ],
          sampleDialogue: [
            {
              speaker: "guest",
              english: "Do you have a quiet room available?",
              chinese: "有安静的房间吗？",
            },
            {
              speaker: "staff",
              english: "Yes, I've noted your preference. Your room faces the garden on the 18th floor.",
              chinese: "有的，我已记录您的偏好。您的房间在 18 楼，面向花园。",
            },
          ],
        },
      },
      {
        level: "B2",
        words: [
          {
            id: "ci-b2-w1",
            english: "Loyalty program",
            phonetic: "/ˈlɔɪəlti ˈprəʊɡræm/",
            chinese: "会员计划",
            example: "Would you like to join our loyalty program?",
          },
          {
            id: "ci-b2-w2",
            english: "Room upgrade",
            phonetic: "/ruːm ʌpˈɡreɪd/",
            chinese: "房型升级",
            example: "We are pleased to offer you a complimentary room upgrade.",
          },
          {
            id: "ci-b2-w3",
            english: "Guest profile",
            phonetic: "/ɡest ˈprəʊfaɪl/",
            chinese: "客人档案",
            example: "Your guest profile shows you are a returning VIP.",
          },
        ],
        sentences: [
          {
            id: "ci-b2-s1",
            english: "Is there anything else I can help you with before you head to your room?",
            chinese: "在您前往房间之前，还有什么我可以帮您的吗？",
            context: "结束服务",
          },
          {
            id: "ci-b2-s2",
            english: "Allow me to escort you to the elevator. A bellhop will bring your luggage shortly.",
            chinese: "请允许我送您到电梯。行李员马上会将您的行李送上去。",
            context: "送客上楼",
          },
        ],
        dialogues: [
          {
            id: "ci-b2-d1",
            title: "会员识别入住",
            subtitle: "Member Recognition Check-in",
            lines: [
              {
                speaker: "staff",
                english: "Welcome back, Mr. Chen. I see you're a Gold member of our loyalty program.",
                chinese: "陈先生，欢迎回来。我看到您是我们会员计划的金卡会员。",
              },
              {
                speaker: "staff",
                english: "As a valued member, we've upgraded you to a corner suite at no extra charge.",
                chinese: "作为尊贵会员，我们免费为您升级了角落套房。",
              },
              {
                speaker: "guest",
                english: "That's wonderful. Thank you for remembering my preferences.",
                chinese: "太棒了。感谢你们记得我的偏好。",
              },
              {
                speaker: "staff",
                english: "Your welcome amenity is in the room. A bellhop will escort you upstairs.",
                chinese: "欢迎礼遇已在房间内。行李员将送您上楼。",
              },
            ],
          },
        ],
        scenario: {
          id: "ci-b2-sc",
          title: "回头客 VIP 入住",
          setting: "Five-star lobby, returning guest arrival",
          description:
            "一位loyalty会员回头客抵达。系统显示其历史偏好，你需要提供个性化服务并安排升级礼遇。",
          objectives: [
            "识别会员身份并个性化问候",
            "主动告知房型升级",
            "安排行李员并高效完成登记",
          ],
          keyPhrases: [
            {
              english: "Welcome back. It's a pleasure to see you again.",
              chinese: "欢迎回来。很高兴再次见到您。",
            },
            {
              english: "We've upgraded you to a suite as a token of our appreciation.",
              chinese: "为表感谢，我们为您升级了套房。",
            },
            {
              english: "Your guest profile shows your preferred high-floor room.",
              chinese: "您的档案显示您偏好高楼层房间。",
            },
          ],
          sampleDialogue: [
            {
              speaker: "staff",
              english: "Good evening, Mr. Chen. Welcome back to Grand Horizon.",
              chinese: "陈先生，晚上好。欢迎再次光临 Grand Horizon。",
            },
            {
              speaker: "staff",
              english: "Your suite is ready. We've prepared your preferred pillow type.",
              chinese: "您的套房已准备好。我们已备好您偏好的枕头。",
            },
          ],
        },
      },
    ],
  },
  {
    id: "check-out",
    title: "办理退房",
    subtitle: "Check-out",
    description: "账单核对、延迟退房请求与送客离店的标准话术。",
    image: "photo-1556742049-0cfed4f6a45d",
    levels: [
      {
        level: "A2",
        words: [
          {
            id: "co-a2-w1",
            english: "Check-out",
            phonetic: "/ˈtʃek aʊt/",
            chinese: "退房",
            example: "Check-out is at 12:00 noon.",
          },
          {
            id: "co-a2-w2",
            english: "Express check-out",
            phonetic: "/ɪkˈspres ˈtʃek aʊt/",
            chinese: "快速退房",
            example: "You may use express check-out via the TV in your room.",
          },
          {
            id: "co-a2-w3",
            english: "Incidental charges",
            phonetic: "/ˌɪnsɪˈdentl ˈtʃɑːdʒɪz/",
            chinese: "杂费",
            example: "Incidental charges will be added to your bill.",
          },
        ],
        sentences: [
          {
            id: "co-a2-s1",
            english: "Your total bill is 1,280 yuan. How would you like to pay?",
            chinese: "您的账单总额为 1,280 元。您想如何支付？",
            context: "结账",
          },
          {
            id: "co-a2-s2",
            english: "Thank you for staying with us. We hope to see you again.",
            chinese: "感谢您的入住。期待再次光临。",
            context: "送别",
          },
        ],
        dialogues: [
          {
            id: "co-a2-d1",
            title: "标准退房",
            subtitle: "Standard Check-out",
            lines: [
              {
                speaker: "guest",
                english: "I'd like to check out, please.",
                chinese: "我想退房。",
              },
              {
                speaker: "staff",
                english: "Of course. May I have your room number?",
                chinese: "好的。请问您的房号？",
              },
              {
                speaker: "guest",
                english: "Room 1208.",
                chinese: "1208 房。",
              },
              {
                speaker: "staff",
                english: "Your bill is ready. The total is 980 yuan. Here is your receipt.",
                chinese: "您的账单已准备好。总计 980 元。这是您的收据。",
              },
            ],
          },
        ],
        scenario: {
          id: "co-a2-sc",
          title: "快速退房练习",
          setting: "Front desk, morning check-out rush",
          description: "客人在中午前到前台退房。你需要确认房号、出示账单并完成送别。",
          objectives: [
            "确认房号与账单",
            "说明杂费构成",
            "礼貌送别",
          ],
          keyPhrases: [
            {
              english: "May I have your room number, please?",
              chinese: "请问您的房号？",
            },
            {
              english: "Here is your receipt. Thank you for staying with us.",
              chinese: "这是您的收据。感谢您的入住。",
            },
          ],
          sampleDialogue: [
            {
              speaker: "guest",
              english: "I'm checking out. Room 1208.",
              chinese: "我退房，1208 房。",
            },
            {
              speaker: "staff",
              english: "Thank you, Mr. Wang. Your bill includes one minibar charge.",
              chinese: "谢谢您，王先生。您的账单包含一项迷你吧消费。",
            },
          ],
        },
      },
      {
        level: "B1",
        words: [
          {
            id: "co-b1-w1",
            english: "Late check-out",
            phonetic: "/leɪt ˈtʃek aʊt/",
            chinese: "延迟退房",
            example: "Late check-out until 2 PM is available upon request.",
          },
        ],
        sentences: [
          {
            id: "co-b1-s1",
            english: "Our standard check-out time is noon. Would you like a late check-out?",
            chinese: "标准退房时间为中午 12 点。您需要延迟退房吗？",
            context: "延迟退房",
          },
        ],
        dialogues: [
          {
            id: "co-b1-d1",
            title: "延迟退房请求",
            subtitle: "Late Check-out Request",
            lines: [
              {
                speaker: "guest",
                english: "Hi, my flight is at 9 PM. Is it possible to check out late?",
                chinese: "你好，我的航班是晚上 9 点。可以延迟退房吗？",
              },
              {
                speaker: "staff",
                english: "Of course. Our standard check-out is at noon. May I ask how late you would need the room?",
                chinese: "当然可以。标准退房时间是中午 12 点。请问您需要延迟到几点？",
              },
              {
                speaker: "guest",
                english: "Ideally until 4 PM.",
                chinese: "理想情况下到下午 4 点。",
              },
              {
                speaker: "staff",
                english: "Let me check availability... Good news, we can extend your check-out to 4 PM at no extra charge today.",
                chinese: "让我查一下... 好消息，今天我们可以免费为您延迟到下午 4 点退房。",
              },
              {
                speaker: "guest",
                english: "That's very kind. Thank you so much.",
                chinese: "太感谢了，非常感谢。",
              },
              {
                speaker: "staff",
                english: "You're most welcome. If you need any assistance before departure, please don't hesitate to contact us.",
                chinese: "不客气。如果您在离店前需要任何帮助，请随时联系我们。",
              },
            ],
          },
        ],
        scenario: {
          id: "co-b1-sc",
          title: "航班较晚延迟退房",
          setting: "Front desk, guest with evening flight",
          description:
            "客人因航班较晚希望延迟退房。你需要查询房态、说明政策并给出解决方案。",
          objectives: [
            "询问延迟退房时间需求",
            "查询房态并给出明确答复",
            "如有费用需提前说明",
          ],
          keyPhrases: [
            {
              english: "May I ask how late you would need the room?",
              chinese: "请问您需要延迟到几点？",
            },
            {
              english: "We can extend your check-out to 4 PM at no extra charge.",
              chinese: "我们可以免费为您延迟到下午 4 点退房。",
            },
          ],
          sampleDialogue: [
            {
              speaker: "guest",
              english: "Can I keep the room until 4 PM?",
              chinese: "我可以保留房间到下午 4 点吗？",
            },
            {
              speaker: "staff",
              english: "Let me check... Yes, that's possible today at no additional charge.",
              chinese: "让我查一下... 可以，今天不额外收费。",
            },
          ],
        },
      },
    ],
  },
  {
    id: "guest-inquiry",
    title: "问询与指引",
    subtitle: "Guest Inquiries",
    description: "回答客人关于设施、服务与时间安排的常见问题。",
    image: "photo-1566073771259-6a8506099945",
    levels: [
      {
        level: "A1",
        words: [
          {
            id: "gi-a1-w1",
            english: "Breakfast",
            phonetic: "/ˈbrekfəst/",
            chinese: "早餐",
            example: "Breakfast is on the 2nd floor.",
          },
          {
            id: "gi-a1-w2",
            english: "Elevator",
            phonetic: "/ˈelɪveɪtə/",
            chinese: "电梯",
            example: "The elevator is on your right.",
          },
          {
            id: "gi-a1-w3",
            english: "Wi-Fi",
            phonetic: "/ˈwaɪ faɪ/",
            chinese: "无线网络",
            example: "The Wi-Fi password is on the key card sleeve.",
          },
        ],
        sentences: [
          {
            id: "gi-a1-s1",
            english: "The restaurant is on the 2nd floor.",
            chinese: "餐厅在 2 楼。",
            context: "设施指引",
          },
          {
            id: "gi-a1-s2",
            english: "Breakfast starts at 7 o'clock.",
            chinese: "早餐 7 点开始。",
            context: "时间说明",
          },
        ],
        dialogues: [
          {
            id: "gi-a1-d1",
            title: "简单问询",
            subtitle: "Simple Inquiry",
            lines: [
              {
                speaker: "guest",
                english: "Where is breakfast?",
                chinese: "早餐在哪里？",
              },
              {
                speaker: "staff",
                english: "Breakfast is on the 2nd floor. It starts at 7 AM.",
                chinese: "早餐在 2 楼。7 点开始。",
              },
              {
                speaker: "guest",
                english: "Thank you.",
                chinese: "谢谢。",
              },
              {
                speaker: "staff",
                english: "You're welcome. Enjoy your stay!",
                chinese: "不客气。祝您入住愉快！",
              },
            ],
          },
        ],
        scenario: {
          id: "gi-a1-sc",
          title: "设施位置指引",
          setting: "Lobby, new guest asking for directions",
          description: "新到客人询问餐厅和电梯位置。用简单英语回答并确认客人理解。",
          objectives: [
            "用简单句说明位置",
            "告知基本时间信息",
            "礼貌结束对话",
          ],
          keyPhrases: [
            {
              english: "The restaurant is on the 2nd floor.",
              chinese: "餐厅在 2 楼。",
            },
            {
              english: "The elevator is over there.",
              chinese: "电梯在那边。",
            },
          ],
          sampleDialogue: [
            {
              speaker: "guest",
              english: "Excuse me, where is the gym?",
              chinese: "请问，健身房在哪里？",
            },
            {
              speaker: "staff",
              english: "The gym is on the 3rd floor. Take the elevator on your left.",
              chinese: "健身房在 3 楼。请走左边的电梯。",
            },
          ],
        },
      },
      {
        level: "A2",
        words: [
          {
            id: "gi-a2-w1",
            english: "Concierge",
            phonetic: "/ˈkɒnsi.eəʒ/",
            chinese: "礼宾部",
            example: "Our concierge can arrange restaurant bookings.",
          },
          {
            id: "gi-a2-w2",
            english: "Wake-up call",
            phonetic: "/weɪk ʌp kɔːl/",
            chinese: "叫醒服务",
            example: "Would you like a wake-up call tomorrow morning?",
          },
          {
            id: "gi-a2-w3",
            english: "Bellhop",
            phonetic: "/ˈbelhɒp/",
            chinese: "行李员",
            example: "The bellhop will assist you with your luggage.",
          },
        ],
        sentences: [
          {
            id: "gi-a2-s1",
            english: "Breakfast is served from 6:30 AM to 10:30 AM on the 2nd floor.",
            chinese: "早餐供应时间为早上 6:30 至 10:30，位于 2 楼。",
            context: "介绍设施",
          },
          {
            id: "gi-a2-s2",
            english: "Our concierge desk is open 24 hours. They can help with tours and transport.",
            chinese: "礼宾台 24 小时开放，可协助安排旅游和交通。",
            context: "礼宾服务",
          },
        ],
        dialogues: [
          {
            id: "gi-a2-d1",
            title: "服务咨询",
            subtitle: "Service Inquiry",
            lines: [
              {
                speaker: "guest",
                english: "Can you arrange a wake-up call for 6 AM tomorrow?",
                chinese: "能帮我安排明天早上 6 点的叫醒服务吗？",
              },
              {
                speaker: "staff",
                english: "Certainly. I've set a wake-up call for 6 AM in room 1502.",
                chinese: "好的。我已为 1502 房设置早上 6 点的叫醒。",
              },
              {
                speaker: "guest",
                english: "Also, can the concierge book a taxi to the airport?",
                chinese: "另外，礼宾部能帮忙订去机场的车吗？",
              },
              {
                speaker: "staff",
                english: "Of course. Please visit the concierge desk by the lobby entrance.",
                chinese: "当然可以。请到大堂入口处的礼宾台。",
              },
            ],
          },
        ],
        scenario: {
          id: "gi-a2-sc",
          title: "综合问询服务",
          setting: "Front desk, guest with multiple questions",
          description:
            "客人询问早餐时间、叫醒服务和交通安排。你需要准确回答并引导至相应服务台。",
          objectives: [
            "准确介绍设施开放时间与位置",
            "记录叫醒服务需求",
            "引导客人至礼宾部",
          ],
          keyPhrases: [
            {
              english: "Would you like a wake-up call?",
              chinese: "您需要叫醒服务吗？",
            },
            {
              english: "Our concierge can arrange transportation for you.",
              chinese: "礼宾部可以为您安排交通。",
            },
          ],
          sampleDialogue: [
            {
              speaker: "guest",
              english: "What time does the pool close?",
              chinese: "游泳池几点关门？",
            },
            {
              speaker: "staff",
              english: "The pool closes at 10 PM. Towels are provided at the entrance.",
              chinese: "游泳池晚上 10 点关闭。入口处提供毛巾。",
            },
          ],
        },
      },
    ],
  },
  {
    id: "reservation-walkin",
    title: "预订与散客",
    subtitle: "Reservations & Walk-in",
    description: "处理无预订散客、预订查询与房态说明。",
    image: "photo-1551882547-ff40c63fe580",
    levels: [
      {
        level: "A2",
        words: [
          {
            id: "rw-a2-w1",
            english: "Walk-in",
            phonetic: "/ˈwɔːk ɪn/",
            chinese: "无预订散客",
            example: "We have availability for walk-in guests tonight.",
          },
          {
            id: "rw-a2-w2",
            english: "Availability",
            phonetic: "/əˌveɪləˈbɪləti/",
            chinese: "空房情况",
            example: "Let me check availability for tonight.",
          },
        ],
        sentences: [
          {
            id: "rw-a2-s1",
            english: "Do you have a reservation with us?",
            chinese: "您有我们的预订吗？",
            context: "确认预订",
          },
          {
            id: "rw-a2-s2",
            english: "I'm afraid we're fully booked tonight, but I can recommend a partner hotel.",
            chinese: "抱歉，今晚已满房，但我可以推荐合作酒店。",
            context: "满房说明",
          },
        ],
        dialogues: [
          {
            id: "rw-a2-d1",
            title: "散客订房",
            subtitle: "Walk-in Booking",
            lines: [
              {
                speaker: "guest",
                english: "Do you have any rooms available tonight?",
                chinese: "今晚还有空房吗？",
              },
              {
                speaker: "staff",
                english: "Let me check... Yes, we have a standard twin room available.",
                chinese: "让我查一下... 有的，我们还有一间标准双床房。",
              },
              {
                speaker: "guest",
                english: "How much is it per night?",
                chinese: "多少钱一晚？",
              },
              {
                speaker: "staff",
                english: "It's 680 yuan per night, including breakfast.",
                chinese: "680 元一晚，含早餐。",
              },
            ],
          },
        ],
        scenario: {
          id: "rw-a2-sc",
          title: "Walk-in 散客接待",
          setting: "Front desk, evening walk-in guest",
          description: "一位无预订客人希望当晚入住。你需要查询房态、报价并完成登记。",
          objectives: [
            "查询并说明可用房型",
            "报价并说明含早政策",
            "完成基础登记",
          ],
          keyPhrases: [
            {
              english: "Let me check availability for you.",
              chinese: "让我为您查询空房。",
            },
            {
              english: "We have a standard room available at 680 yuan.",
              chinese: "我们有标准间，680 元。",
            },
          ],
          sampleDialogue: [
            {
              speaker: "guest",
              english: "I don't have a reservation. Any rooms tonight?",
              chinese: "我没有预订。今晚有房间吗？",
            },
            {
              speaker: "staff",
              english: "Yes, we have one twin room left. Would you like to check in?",
              chinese: "有的，还剩一间双床房。您要入住吗？",
            },
          ],
        },
      },
    ],
  },
  {
    id: "special-requests",
    title: "特殊请求",
    subtitle: "Special Requests",
    description: "提前入住、延迟退房、房型变更等特殊需求处理。",
    image: "photo-1611892440504-42a792e24d32",
    levels: [
      {
        level: "A1",
        words: [
          {
            id: "sr-a1-w1",
            english: "Luggage",
            phonetic: "/ˈlʌɡɪdʒ/",
            chinese: "行李",
            example: "May I help you with your luggage?",
          },
          {
            id: "sr-a1-w2",
            english: "Taxi",
            phonetic: "/ˈtæksi/",
            chinese: "出租车",
            example: "I can call a taxi for you.",
          },
          {
            id: "sr-a1-w3",
            english: "Bellboy",
            phonetic: "/ˈbelbɔɪ/",
            chinese: "行李员",
            example: "The bellboy will take your bags to your room.",
          },
        ],
        sentences: [
          {
            id: "sr-a1-s1",
            english: "May I help you with your luggage?",
            chinese: "需要帮您拿行李吗？",
            context: "行李服务",
          },
          {
            id: "sr-a1-s2",
            english: "I can call a taxi for you.",
            chinese: "我可以帮您叫出租车。",
            context: "叫车服务",
          },
        ],
        dialogues: [
          {
            id: "sr-a1-d1",
            title: "行李与叫车",
            subtitle: "Luggage & Taxi",
            lines: [
              {
                speaker: "guest",
                english: "I have two bags. Can you help?",
                chinese: "我有两件行李。能帮忙吗？",
              },
              {
                speaker: "staff",
                english: "Of course. May I help you with your luggage?",
                chinese: "当然。需要帮您拿行李吗？",
              },
              {
                speaker: "guest",
                english: "Also, I need a taxi to the airport.",
                chinese: "另外，我需要一辆去机场的出租车。",
              },
              {
                speaker: "staff",
                english: "No problem. I can call a taxi for you. It will arrive in five minutes.",
                chinese: "没问题。我可以帮您叫车，大约 5 分钟到。",
              },
            ],
          },
        ],
        scenario: {
          id: "sr-a1-sc",
          title: "行李寄存与叫车",
          setting: "Concierge desk, guest with luggage needs taxi",
          description: "客人带着行李来到礼宾台，需要寄存行李并叫车去机场。用简单英语完成服务。",
          objectives: [
            "主动提供行李帮助",
            "确认目的地并叫车",
            "告知等候时间",
          ],
          keyPhrases: [
            {
              english: "May I help you with your luggage?",
              chinese: "需要帮您拿行李吗？",
            },
            {
              english: "Your taxi will arrive in five minutes.",
              chinese: "您的出租车大约 5 分钟到。",
            },
          ],
          sampleDialogue: [
            {
              speaker: "guest",
              english: "Can you store my luggage?",
              chinese: "能帮我寄存行李吗？",
            },
            {
              speaker: "staff",
              english: "Yes. And I can call a taxi when you are ready.",
              chinese: "可以。您准备好时我可以帮您叫车。",
            },
          ],
        },
      },
      {
        level: "A2",
        words: [
          {
            id: "sr-a2-w1",
            english: "Restaurant",
            phonetic: "/ˈrestrɒnt/",
            chinese: "餐厅",
            example: "I can recommend a good restaurant nearby.",
          },
          {
            id: "sr-a2-w2",
            english: "Reservation",
            phonetic: "/ˌrezəˈveɪʃn/",
            chinese: "预订",
            example: "Would you like me to make a reservation?",
          },
          {
            id: "sr-a2-w3",
            english: "Recommendation",
            phonetic: "/ˌrekəmenˈdeɪʃn/",
            chinese: "推荐",
            example: "I have a great recommendation for local food.",
          },
        ],
        sentences: [
          {
            id: "sr-a2-s1",
            english: "Which type of cuisine would you prefer?",
            chinese: "您想吃什么类型的菜？",
            context: "餐厅推荐",
          },
          {
            id: "sr-a2-s2",
            english: "I can book a table for you at 7 PM.",
            chinese: "我可以帮您预订晚上 7 点的位子。",
            context: "餐厅预订",
          },
        ],
        dialogues: [
          {
            id: "sr-a2-d1",
            title: "餐厅预订",
            subtitle: "Restaurant Booking",
            lines: [
              {
                speaker: "guest",
                english: "Can you recommend a good restaurant?",
                chinese: "能推荐一家好餐厅吗？",
              },
              {
                speaker: "staff",
                english: "Certainly. Which type of cuisine would you prefer?",
                chinese: "当然。您想吃什么类型的菜？",
              },
              {
                speaker: "guest",
                english: "Something local, not too expensive.",
                chinese: "本地菜，不要太贵。",
              },
              {
                speaker: "staff",
                english: "I recommend Golden Lotus. I can book a table for you at 7 PM.",
                chinese: "我推荐金莲花餐厅。我可以帮您预订晚上 7 点的位子。",
              },
            ],
          },
        ],
        scenario: {
          id: "sr-a2-sc",
          title: "本地餐厅推荐",
          setting: "Concierge desk, guest asks for dinner recommendation",
          description: "客人想外出用餐，需要你推荐本地餐厅并完成电话预订。",
          objectives: [
            "了解客人饮食偏好",
            "推荐合适餐厅",
            "确认预订时间与人數",
          ],
          keyPhrases: [
            {
              english: "I have a great recommendation nearby.",
              chinese: "附近有一家我很推荐的餐厅。",
            },
            {
              english: "Shall I call to make a reservation?",
              chinese: "需要我打电话帮您预订吗？",
            },
          ],
          sampleDialogue: [
            {
              speaker: "guest",
              english: "Where can I get good local food?",
              chinese: "哪里能吃到好的本地菜？",
            },
            {
              speaker: "staff",
              english: "There's an excellent restaurant five minutes away. Would you like a reservation?",
              chinese: "步行 5 分钟有一家很棒的餐厅。需要帮您预订吗？",
            },
          ],
        },
      },
      {
        level: "B1",
        words: [
          {
            id: "sr-b1-w1",
            english: "Early check-in",
            phonetic: "/ˈɜːli ˈtʃek ɪn/",
            chinese: "提前入住",
            example: "Early check-in is subject to availability.",
          },
          {
            id: "sr-b1-w2",
            english: "Luggage storage",
            phonetic: "/ˈlʌɡɪdʒ ˈstɔːrɪdʒ/",
            chinese: "行李寄存",
            example: "We offer complimentary luggage storage.",
          },
          {
            id: "sr-b1-w3",
            english: "Late check-out",
            phonetic: "/leɪt ˈtʃek aʊt/",
            chinese: "延迟退房",
            example: "Late check-out until 2 PM is available upon request.",
          },
        ],
        sentences: [
          {
            id: "sr-b1-s1",
            english: "I'm afraid your room is not ready yet. May I offer you a complimentary drink at the lounge?",
            chinese: "抱歉，您的房间尚未准备好。我可以请您在休息室免费享用饮品吗？",
            context: "房间未就绪",
          },
          {
            id: "sr-b1-s2",
            english: "Check-in officially begins at 3 PM, but let me see what we can do.",
            chinese: "正式入住时间为下午 3 点，但让我看看能为您做些什么。",
            context: "提前入住",
          },
        ],
        dialogues: [
          {
            id: "sr-b1-d1",
            title: "早到客人",
            subtitle: "Early Arrival",
            lines: [
              {
                speaker: "guest",
                english: "I just arrived from an overnight flight. Is my room ready?",
                chinese: "我刚坐红眼航班到达。我的房间准备好了吗？",
              },
              {
                speaker: "staff",
                english: "Welcome. I understand you've had a long journey. Let me check early check-in availability for you.",
                chinese: "欢迎光临。我理解您旅途劳累。让我为您查询是否可以提前入住。",
              },
              {
                speaker: "staff",
                english: "A room will be ready in approximately 30 minutes. May I offer you a complimentary coffee while you wait?",
                chinese: "大约 30 分钟后房间即可准备好。等候期间，我可以为您提供免费咖啡吗？",
              },
            ],
          },
        ],
        scenario: {
          id: "sr-b1-sc",
          title: "早到客人等候",
          setting: "Lobby, 10:00 AM — guest arrives before check-in time",
          description:
            "客人早上 10 点抵达，标准入住时间为下午 3 点。你需要平衡房态与客人体验，提供等候方案。",
          objectives: [
            "表达欢迎，说明标准入住时间",
            "提供行李寄存与休息室选项",
            "主动查询提前入住可行性",
          ],
          keyPhrases: [
            {
              english: "You're welcome to store your luggage and relax in our lobby lounge.",
              chinese: "欢迎您寄存行李，在大堂休息室稍作休息。",
            },
            {
              english: "Good news — a room has just become available.",
              chinese: "好消息——刚有一间空房。",
            },
          ],
          sampleDialogue: [
            {
              speaker: "guest",
              english: "Can I check in now? I arrived early.",
              chinese: "我现在可以入住吗？我早到了。",
            },
            {
              speaker: "staff",
              english: "Let me check... A room on the 10th floor will be ready in 30 minutes.",
              chinese: "让我查一下... 10 楼的一间房 30 分钟后可准备好。",
            },
          ],
        },
      },
      {
        level: "B2",
        words: [
          {
            id: "sr-b2-w1",
            english: "Room upgrade",
            phonetic: "/ruːm ʌpˈɡreɪd/",
            chinese: "房型升级",
            example: "We are pleased to offer you a complimentary room upgrade.",
          },
          {
            id: "sr-b2-w2",
            english: "Executive lounge",
            phonetic: "/ɪɡˈzekjətɪv laʊndʒ/",
            chinese: "行政酒廊",
            example: "Executive lounge access is included with the upgrade.",
          },
          {
            id: "sr-b2-w3",
            english: "Connecting room",
            phonetic: "/kəˈnektɪŋ ruːm/",
            chinese: "连通房",
            example: "We can arrange connecting rooms for your family.",
          },
        ],
        sentences: [
          {
            id: "sr-b2-s1",
            english: "For just 200 yuan per night, we can upgrade you to our executive suite with lounge access.",
            chinese: "只需每晚 200 元，我们可以为您升级到行政套房，并享有酒廊权益。",
            context: "升级推销",
          },
        ],
        dialogues: [
          {
            id: "sr-b2-d1",
            title: "房间升级推销",
            subtitle: "Room Upgrade Offer",
            lines: [
              {
                speaker: "staff",
                english: "Mr. Liu, we notice you're a valued member of our loyalty program.",
                chinese: "刘先生，我们注意到您是我们会员计划的尊贵会员。",
              },
              {
                speaker: "staff",
                english: "For just 200 yuan per night, we can upgrade you to our executive suite with lounge access.",
                chinese: "只需每晚 200 元，我们可以为您升级到行政套房，并享有酒廊权益。",
              },
              {
                speaker: "guest",
                english: "What's included in the executive lounge?",
                chinese: "行政酒廊包含什么？",
              },
              {
                speaker: "staff",
                english: "You'll enjoy complimentary breakfast, afternoon tea, and evening cocktails, plus a dedicated concierge service.",
                chinese: "您将享有免费早餐、下午茶、晚间鸡尾酒，以及专属礼宾服务。",
              },
              {
                speaker: "guest",
                english: "That sounds worthwhile. I'll take the upgrade for two nights.",
                chinese: "听起来很划算。我升级两晚。",
              },
              {
                speaker: "staff",
                english: "Excellent choice. I've updated your reservation. Welcome to the executive floor experience.",
                chinese: "绝佳的选择。我已更新您的预订。欢迎体验行政楼层。",
              },
            ],
          },
        ],
        scenario: {
          id: "sr-b2-sc",
          title: "升级销售场景",
          setting: "Front desk, member check-in with upsell opportunity",
          description:
            "会员客人入住时，你有机会推销行政套房升级。需要清晰说明权益并完成预订更新。",
          objectives: [
            "识别会员身份",
            "清晰说明升级权益与价格",
            "尊重客人选择，不强行推销",
          ],
          keyPhrases: [
            {
              english: "Would you like to upgrade to our executive suite?",
              chinese: "您想升级到行政套房吗？",
            },
            {
              english: "The executive lounge includes complimentary breakfast and cocktails.",
              chinese: "行政酒廊含免费早餐和鸡尾酒。",
            },
          ],
          sampleDialogue: [
            {
              speaker: "staff",
              english: "As a Gold member, you're eligible for a special upgrade rate.",
              chinese: "作为金卡会员，您可享受特别升级价格。",
            },
            {
              speaker: "guest",
              english: "Tell me more about the executive lounge benefits.",
              chinese: "介绍一下行政酒廊的权益。",
            },
          ],
        },
      },
      {
        level: "C1",
        words: [
          {
            id: "sr-c1-w1",
            english: "Personalized service",
            phonetic: "/ˌpɜːsənəlaɪzd ˈsɜːvɪs/",
            chinese: "个性化服务",
            example: "We tailor personalized service for each guest's preferences.",
          },
          {
            id: "sr-c1-w2",
            english: "Dietary restriction",
            phonetic: "/ˈdaɪətəri rɪˈstrɪkʃn/",
            chinese: "饮食限制",
            example: "Please inform us of any dietary restrictions in advance.",
          },
          {
            id: "sr-c1-w3",
            english: "Special occasion",
            phonetic: "/ˈspeʃl əˈkeɪʒn/",
            chinese: "特殊场合",
            example: "We can arrange amenities for a special occasion.",
          },
        ],
        sentences: [
          {
            id: "sr-c1-s1",
            english: "I've noted your allergy in the guest profile and will coordinate with all departments.",
            chinese: "我已在客人档案中备注您的过敏信息，并将与各部门协调。",
            context: "过敏处理",
          },
          {
            id: "sr-c1-s2",
            english: "For your anniversary, we can arrange flowers, champagne, and a customized turndown service.",
            chinese: "为您的结婚纪念日，我们可以安排鲜花、香槟及定制夜床服务。",
            context: "纪念日安排",
          },
        ],
        dialogues: [
          {
            id: "sr-c1-d1",
            title: "纪念日惊喜安排",
            subtitle: "Anniversary Surprise",
            lines: [
              {
                speaker: "guest",
                english: "It's our 10th wedding anniversary. Do you have any special arrangements?",
                chinese: "今天是我们结婚 10 周年。你们有什么特别安排吗？",
              },
              {
                speaker: "staff",
                english: "Congratulations! We would be delighted to help make it memorable.",
                chinese: "恭喜！我们很乐意帮您制造难忘回忆。",
              },
              {
                speaker: "staff",
                english: "We can arrange flowers, champagne, and a customized turndown service in your suite.",
                chinese: "我们可以在套房安排鲜花、香槟及定制夜床服务。",
              },
              {
                speaker: "guest",
                english: "That would be perfect. Please keep it as a surprise for my wife.",
                chinese: "太完美了。请对我太太保密。",
              },
              {
                speaker: "staff",
                english: "Absolutely. I've noted everything in your profile and will coordinate discreetly with housekeeping.",
                chinese: "一定。我已在档案中备注，并将与客房部低调协调。",
              },
            ],
          },
        ],
        scenario: {
          id: "sr-c1-sc",
          title: "高端个性化请求",
          setting: "Concierge desk, VIP guest with complex special requests",
          description:
            "贵宾提出过敏限制与纪念日惊喜等复合需求。你需要跨部门协调，确保个性化服务无缝落地。",
          objectives: [
            "细致记录所有偏好与限制",
            "提出超出期望的方案",
            "确保跨部门执行一致",
          ],
          keyPhrases: [
            {
              english: "I've noted this in your guest profile for all departments.",
              chinese: "我已在客人档案中备注，通知各部门。",
            },
            {
              english: "We will coordinate everything discreetly.",
              chinese: "我们会低调协调所有安排。",
            },
          ],
          sampleDialogue: [
            {
              speaker: "guest",
              english: "My partner has a severe shellfish allergy. Can the restaurant accommodate?",
              chinese: "我伴侣对贝类严重过敏。餐厅能配合吗？",
            },
            {
              speaker: "staff",
              english: "I've flagged the allergy in your profile and will brief the chef personally.",
              chinese: "我已在档案中标注过敏信息，并将亲自告知主厨。",
            },
          ],
        },
      },
    ],
  },
  {
    id: "problem-solving",
    title: "问题处理",
    subtitle: "Problem Solving",
    description: "房卡遗失、房间未就绪、客诉等常见问题的应对话术。",
    image: "photo-1563013544-824ae1b704d3",
    levels: [
      {
        level: "B1",
        words: [
          {
            id: "ps-b1-w1",
            english: "Replacement fee",
            phonetic: "/rɪˈpleɪsmənt fiː/",
            chinese: "补卡费",
            example: "There is a replacement fee of 50 yuan for lost key cards.",
          },
        ],
        sentences: [
          {
            id: "ps-b1-s1",
            english: "I'm sorry to hear that. May I confirm your room number and name for security purposes?",
            chinese: "很抱歉听到这个消息。出于安全考虑，请确认您的房号和姓名。",
            context: "房卡遗失",
          },
        ],
        dialogues: [
          {
            id: "ps-b1-d1",
            title: "房卡遗失处理",
            subtitle: "Lost Key Card",
            lines: [
              {
                speaker: "guest",
                english: "Excuse me, I think I lost my key card somewhere in the city.",
                chinese: "不好意思，我想我在外面把房卡弄丢了。",
              },
              {
                speaker: "staff",
                english: "I'm sorry to hear that. May I confirm your room number and name for security purposes?",
                chinese: "很抱歉听到这个消息。出于安全考虑，请确认您的房号和姓名。",
              },
              {
                speaker: "guest",
                english: "Room 1520, Zhang Wei.",
                chinese: "1520 房，张伟。",
              },
              {
                speaker: "staff",
                english: "Thank you, Mr. Zhang. I'll deactivate your old card immediately and issue a new one.",
                chinese: "谢谢您，张先生。我会立即停用旧卡并为您制作新卡。",
              },
              {
                speaker: "staff",
                english: "There is a small replacement fee of 50 yuan. Here is your new key card for room 1520.",
                chinese: "补卡费用为 50 元。这是您 1520 房的新房卡。",
              },
              {
                speaker: "guest",
                english: "No problem. Thank you for handling this so quickly.",
                chinese: "没问题。感谢您这么快就处理好了。",
              },
            ],
          },
        ],
        scenario: {
          id: "ps-b1-sc",
          title: "房卡遗失补发",
          setting: "Front desk, guest returns without key card",
          description:
            "客人遗失房卡回到酒店。你需要核实身份、停用旧卡、收取补卡费并发放新卡。",
          objectives: [
            "核实房号与姓名",
            "说明安全流程与补卡费用",
            "快速完成补卡",
          ],
          keyPhrases: [
            {
              english: "I'll deactivate your old card immediately.",
              chinese: "我会立即停用您的旧卡。",
            },
            {
              english: "Here is your new key card.",
              chinese: "这是您的新房卡。",
            },
          ],
          sampleDialogue: [
            {
              speaker: "guest",
              english: "I lost my key card. Can you help?",
              chinese: "我把房卡弄丢了。能帮忙吗？",
            },
            {
              speaker: "staff",
              english: "Of course. May I confirm your room number and ID?",
              chinese: "当然。请确认您的房号和证件。",
            },
          ],
        },
      },
      {
        level: "B2",
        words: [
          {
            id: "ps-b2-w1",
            english: "Overbooking",
            phonetic: "/ˌəʊvərˈbʊkɪŋ/",
            chinese: "超订",
            example: "Due to overbooking, we will arrange alternative accommodation.",
          },
        ],
        sentences: [
          {
            id: "ps-b2-s1",
            english: "I sincerely apologize for the inconvenience. Let me resolve this for you immediately.",
            chinese: "对于给您带来的不便，我深表歉意。请允许我立即为您处理。",
            context: "投诉应对",
          },
        ],
        dialogues: [
          {
            id: "ps-b2-d1",
            title: "客诉应对",
            subtitle: "Complaint Handling",
            lines: [
              {
                speaker: "guest",
                english: "My room hasn't been cleaned yet. This is unacceptable.",
                chinese: "我的房间还没打扫。这无法接受。",
              },
              {
                speaker: "staff",
                english: "I sincerely apologize for the inconvenience. Let me resolve this for you immediately.",
                chinese: "对于给您带来的不便，我深表歉意。请允许我立即为您处理。",
              },
              {
                speaker: "staff",
                english: "I'll send housekeeping right away and offer you a complimentary drink at the lounge.",
                chinese: "我马上安排客房部，并请您在休息室免费享用饮品。",
              },
              {
                speaker: "guest",
                english: "Please make sure it's done within 30 minutes.",
                chinese: "请确保 30 分钟内完成。",
              },
              {
                speaker: "staff",
                english: "Absolutely. I'll personally follow up and call you within 30 minutes.",
                chinese: "一定。我会亲自跟进并在 30 分钟内致电您。",
              },
            ],
          },
        ],
        scenario: {
          id: "ps-b2-sc",
          title: "服务投诉处理",
          setting: "Front desk, guest complaint about room condition",
          description:
            "客人投诉房间清洁问题。你需要真诚道歉、立即采取行动并跟进反馈。",
          objectives: [
            "真诚道歉，不推卸责任",
            "提出具体解决方案与时间承诺",
            "主动跟进确保客人满意",
          ],
          keyPhrases: [
            {
              english: "I sincerely apologize for the inconvenience.",
              chinese: "对于不便，我深表歉意。",
            },
            {
              english: "I'll personally follow up to ensure it's resolved.",
              chinese: "我会亲自跟进确保问题解决。",
            },
          ],
          sampleDialogue: [
            {
              speaker: "guest",
              english: "The air conditioning in my room is not working.",
              chinese: "我房间的空调坏了。",
            },
            {
              speaker: "staff",
              english: "I'm very sorry. I'll send maintenance immediately and arrange a room move if needed.",
              chinese: "非常抱歉。我立即安排维修，如有需要可换房。",
            },
          ],
        },
      },
    ],
  },
  {
    id: "vip-group",
    title: "VIP与团体",
    subtitle: "VIP & Group",
    description: "VIP 贵宾接待、团体入住与大型活动协调。",
    image: "photo-1631049307264-da0ec9d70304",
    levels: [
      {
        level: "A1",
        words: [
          {
            id: "vg-a1-w1",
            english: "Welcome",
            phonetic: "/ˈwelkəm/",
            chinese: "欢迎",
            example: "Welcome to Grand Horizon Hotel.",
          },
          {
            id: "vg-a1-w2",
            english: "Guest",
            phonetic: "/ɡest/",
            chinese: "客人",
            example: "Our guest is arriving soon.",
          },
          {
            id: "vg-a1-w3",
            english: "Room",
            phonetic: "/ruːm/",
            chinese: "房间",
            example: "Your room is on the 8th floor.",
          },
        ],
        sentences: [
          {
            id: "vg-a1-s1",
            english: "Welcome to our hotel.",
            chinese: "欢迎光临本酒店。",
            context: "迎宾问候",
          },
          {
            id: "vg-a1-s2",
            english: "Your room is ready.",
            chinese: "您的房间已准备好。",
            context: "房间就绪",
          },
        ],
        dialogues: [
          {
            id: "vg-a1-d1",
            title: "贵宾迎宾",
            subtitle: "VIP Welcome",
            lines: [
              {
                speaker: "staff",
                english: "Welcome to Grand Horizon Hotel, Mr. Chen.",
                chinese: "陈先生，欢迎光临 Grand Horizon 酒店。",
              },
              {
                speaker: "guest",
                english: "Thank you. Is my room ready?",
                chinese: "谢谢。我的房间准备好了吗？",
              },
              {
                speaker: "staff",
                english: "Yes. Your room is ready on the 8th floor.",
                chinese: "是的。您的房间在 8 楼，已准备好。",
              },
              {
                speaker: "staff",
                english: "May I show you to the elevator?",
                chinese: "我带您去电梯好吗？",
              },
            ],
          },
        ],
        scenario: {
          id: "vg-a1-sc",
          title: "简单 VIP 迎宾",
          setting: "Hotel lobby, VIP guest arrival",
          description: "贵宾抵达大堂，你需要用简单英语问候并告知房间已就绪。",
          objectives: [
            "用客人姓氏问候",
            "确认房间状态",
            "引导至电梯",
          ],
          keyPhrases: [
            {
              english: "Welcome to Grand Horizon Hotel.",
              chinese: "欢迎光临 Grand Horizon 酒店。",
            },
            {
              english: "Your room is ready.",
              chinese: "您的房间已准备好。",
            },
          ],
          sampleDialogue: [
            {
              speaker: "staff",
              english: "Welcome, Ms. Wang. Your room is ready.",
              chinese: "王女士，欢迎。您的房间已准备好。",
            },
            {
              speaker: "guest",
              english: "Thank you very much.",
              chinese: "非常感谢。",
            },
          ],
        },
      },
      {
        level: "A2",
        words: [
          {
            id: "vg-a2-w1",
            english: "VIP",
            phonetic: "/ˌviː aɪ ˈpiː/",
            chinese: "贵宾",
            example: "We have a VIP guest arriving at 3 PM.",
          },
          {
            id: "vg-a2-w2",
            english: "Escort",
            phonetic: "/ɪˈskɔːt/",
            chinese: "引导/护送",
            example: "May I escort you to your room?",
          },
          {
            id: "vg-a2-w3",
            english: "Amenity",
            phonetic: "/əˈmiːnəti/",
            chinese: "礼遇/备品",
            example: "We have prepared a welcome amenity in your room.",
          },
        ],
        sentences: [
          {
            id: "vg-a2-s1",
            english: "May I escort you to your room?",
            chinese: "请允许我送您去房间好吗？",
            context: "引导服务",
          },
          {
            id: "vg-a2-s2",
            english: "We have prepared a welcome gift for you.",
            chinese: "我们为您准备了欢迎礼品。",
            context: "欢迎礼遇",
          },
        ],
        dialogues: [
          {
            id: "vg-a2-d1",
            title: "引导贵宾入房",
            subtitle: "Escort to Room",
            lines: [
              {
                speaker: "staff",
                english: "Good afternoon, Mr. Liu. Welcome back.",
                chinese: "刘先生，下午好。欢迎回来。",
              },
              {
                speaker: "staff",
                english: "We have prepared a welcome amenity in your room.",
                chinese: "我们已在您的房间准备了欢迎礼遇。",
              },
              {
                speaker: "guest",
                english: "That's very kind. Which floor?",
                chinese: "太贴心了。在几楼？",
              },
              {
                speaker: "staff",
                english: "The 12th floor. May I escort you to your room?",
                chinese: "12 楼。请允许我送您去房间好吗？",
              },
            ],
          },
        ],
        scenario: {
          id: "vg-a2-sc",
          title: "VIP 引导入房",
          setting: "Lobby, returning VIP guest",
          description: "回头 VIP 客人抵达，你需要问候、说明欢迎礼遇并引导至房间。",
          objectives: [
            "识别回头客并问候",
            "介绍欢迎礼遇",
            "提供引导服务",
          ],
          keyPhrases: [
            {
              english: "Welcome back. It's good to see you again.",
              chinese: "欢迎回来。很高兴再次见到您。",
            },
            {
              english: "May I escort you to your room?",
              chinese: "请允许我送您去房间好吗？",
            },
          ],
          sampleDialogue: [
            {
              speaker: "staff",
              english: "Your welcome amenity is in the room. May I escort you?",
              chinese: "欢迎礼遇已在房间。需要我送您上去吗？",
            },
            {
              speaker: "guest",
              english: "Yes, please.",
              chinese: "好的，谢谢。",
            },
          ],
        },
      },
      {
        level: "B1",
        words: [
          {
            id: "vg-b1-w1",
            english: "Loyalty member",
            phonetic: "/ˈlɔɪəlti ˈmembə/",
            chinese: "会员",
            example: "As a loyalty member, you enjoy priority service.",
          },
          {
            id: "vg-b1-w2",
            english: "Preference",
            phonetic: "/ˈprefərəns/",
            chinese: "偏好",
            example: "We have your room preferences on file.",
          },
          {
            id: "vg-b1-w3",
            english: "Complimentary",
            phonetic: "/ˌkɒmplɪˈmentəri/",
            chinese: "免费/赠送",
            example: "You'll receive a complimentary room upgrade.",
          },
        ],
        sentences: [
          {
            id: "vg-b1-s1",
            english: "As a Gold member, you are eligible for priority check-in.",
            chinese: "作为金卡会员，您可享受优先入住。",
            context: "会员权益",
          },
          {
            id: "vg-b1-s2",
            english: "We have noted your preference for a high floor and non-smoking room.",
            chinese: "我们已记录您的高楼层和无烟房偏好。",
            context: "偏好确认",
          },
        ],
        dialogues: [
          {
            id: "vg-b1-d1",
            title: "会员偏好确认",
            subtitle: "Member Preferences",
            lines: [
              {
                speaker: "staff",
                english: "Good evening, Ms. Zhang. Welcome back as our Gold member.",
                chinese: "张女士，晚上好。欢迎以金卡会员身份再次光临。",
              },
              {
                speaker: "staff",
                english: "We have your preference for a high floor and non-smoking room on file.",
                chinese: "我们已记录您的高楼层和无烟房偏好。",
              },
              {
                speaker: "guest",
                english: "Perfect. Any complimentary benefits tonight?",
                chinese: "很好。今晚有免费权益吗？",
              },
              {
                speaker: "staff",
                english: "Yes. You'll receive a complimentary fruit platter and late check-out until 2 PM.",
                chinese: "有的。您将获赠果盘，并可免费延迟退房至下午 2 点。",
              },
            ],
          },
        ],
        scenario: {
          id: "vg-b1-sc",
          title: "会员贵宾接待",
          setting: "Concierge desk, Gold member arrival",
          description:
            "金卡会员抵达。你需要确认其偏好、说明会员权益并完成高效接待。",
          objectives: [
            "识别会员等级",
            "确认房间偏好",
            "介绍 complimentary 权益",
          ],
          keyPhrases: [
            {
              english: "We have your preferences on file.",
              chinese: "我们已记录您的偏好。",
            },
            {
              english: "As a Gold member, you enjoy priority service.",
              chinese: "作为金卡会员，您享有优先服务。",
            },
          ],
          sampleDialogue: [
            {
              speaker: "guest",
              english: "I'm a Gold member. Is my usual room type available?",
              chinese: "我是金卡会员。我常用的房型有空吗？",
            },
            {
              speaker: "staff",
              english: "Yes. We've prepared a high-floor, non-smoking room with your preferred amenities.",
              chinese: "有的。我们已备好高楼层无烟房及您偏好的备品。",
            },
          ],
        },
      },
      {
        level: "B2",
        words: [
          {
            id: "vg-b2-w1",
            english: "Master account",
            phonetic: "/ˈmɑːstər əˈkaʊnt/",
            chinese: "主账户",
            example: "Room charges will go to the master account.",
          },
          {
            id: "vg-b2-w2",
            english: "Rooming list",
            phonetic: "/ˈruːmɪŋ lɪst/",
            chinese: "客房分配表",
            example: "I'll need the rooming list and authorization form.",
          },
          {
            id: "vg-b2-w3",
            english: "Group coordinator",
            phonetic: "/ɡruːp kəʊˈɔːdɪneɪtə/",
            chinese: "团体协调员",
            example: "Please ask for the group coordinator at the welcome desk.",
          },
        ],
        sentences: [
          {
            id: "vg-b2-s1",
            english: "Room charges will go to the master account; incidentals are individual.",
            chinese: "房费计入主账户；杂费由个人承担。",
            context: "团体结账",
          },
        ],
        dialogues: [
          {
            id: "vg-b2-d1",
            title: "团体会议入住",
            subtitle: "Group Check-in",
            lines: [
              {
                speaker: "guest",
                english: "I'm the event coordinator for the Tech Summit group. We have 20 rooms.",
                chinese: "我是 Tech Summit 团体的活动协调员。我们有 20 间房。",
              },
              {
                speaker: "staff",
                english: "Welcome. I've been expecting your group. Please proceed to the group check-in counter on the left.",
                chinese: "欢迎。我们一直在等候您的团队。请前往左侧的团体入住柜台。",
              },
              {
                speaker: "staff",
                english: "Your welcome briefing is scheduled at 4 PM in Meeting Room 3. Here is the group information pack.",
                chinese: "欢迎说明会定于下午 4 点在 3 号会议室举行。这是团体信息包。",
              },
            ],
          },
        ],
        scenario: {
          id: "vg-b2-sc",
          title: "团体会议入住",
          setting: "Conference group arrival, 20 rooms, single billing",
          description:
            "一个 20 间房的会议团体同时抵达。你需要协调 rooming list、房卡分发与欢迎说明。",
          objectives: [
            "核对 rooming list 与 master account 授权",
            "高效批量办理，减少排队",
            "向 coordinator 说明 billing 与设施安排",
          ],
          keyPhrases: [
            {
              english: "I'll need the rooming list and master account authorization form.",
              chinese: "我需要客房分配表和主账户授权表。",
            },
            {
              english: "We've prepared a welcome desk for your group.",
              chinese: "我们已为您的团队准备了欢迎接待台。",
            },
          ],
          sampleDialogue: [
            {
              speaker: "guest",
              english: "All room charges go to the company master account.",
              chinese: "所有房费计入公司主账户。",
            },
            {
              speaker: "staff",
              english: "Understood. Incidentals will be charged to individual guests.",
              chinese: "明白。杂费由各位客人自行承担。",
            },
          ],
        },
      },
      {
        level: "C1",
        words: [
          {
            id: "vg-c1-w1",
            english: "Seamless experience",
            phonetic: "/ˈsiːmləs ɪkˈspɪəriəns/",
            chinese: "无缝体验",
            example: "We aim to provide a seamless arrival experience for our VIP guests.",
          },
          {
            id: "vg-c1-w2",
            english: "White-glove service",
            phonetic: "/waɪt ɡlʌv ˈsɜːvɪs/",
            chinese: "顶级管家服务",
            example: "Our white-glove service ensures every detail is handled.",
          },
          {
            id: "vg-c1-w3",
            english: "Discreet handling",
            phonetic: "/dɪˈskriːt ˈhændlɪŋ/",
            chinese: "低调接待",
            example: "We provide discreet handling for high-profile guests.",
          },
        ],
        sentences: [
          {
            id: "vg-c1-s1",
            english: "We have prepared your preferred room on the club floor with personalized amenities.",
            chinese: "我们已在俱乐部楼层为您准备好偏好房间及个性化礼遇。",
            context: "VIP 接待",
          },
          {
            id: "vg-c1-s2",
            english: "For privacy, we will use a separate entrance and limit staff access to your floor.",
            chinese: "为保护隐私，我们将使用专用入口并限制员工进入您的楼层。",
            context: "低调接待",
          },
        ],
        dialogues: [
          {
            id: "vg-c1-d1",
            title: "VIP 贵宾接待",
            subtitle: "VIP Guest Arrival",
            lines: [
              {
                speaker: "staff",
                english: "Good evening, Mr. Anderson. Welcome back to Grand Horizon. It's a pleasure to see you again.",
                chinese: "Anderson 先生，晚上好。欢迎再次光临 Grand Horizon。很高兴再次见到您。",
              },
              {
                speaker: "staff",
                english: "Your corner suite is ready. We've upgraded you as a token of our appreciation for your loyalty.",
                chinese: "您的角落套房已准备好。为感谢您对酒店的忠诚，我们为您做了升级。",
              },
              {
                speaker: "guest",
                english: "That's wonderful. You always take good care of me.",
                chinese: "太棒了。你们总是把我照顾得很好。",
              },
              {
                speaker: "staff",
                english: "Your welcome amenity and preferred pillow have been placed in the room. May I escort you to the elevator?",
                chinese: "欢迎礼遇和您偏好的枕头已放在房间。请允许我送您到电梯？",
              },
            ],
          },
        ],
        scenario: {
          id: "vg-c1-sc",
          title: "VIP 贵宾抵达",
          setting: "Five-star hotel lobby, Platinum member arrival",
          description:
            "一位 Platinum 会员即将抵达。前台需在其到达前完成房间准备、欢迎礼遇安排，并提供 seamless 入住体验。",
          objectives: [
            "识别 VIP 身份并个性化问候",
            "主动告知房型升级或专属礼遇",
            "高效完成登记，避免让贵宾久等",
          ],
          keyPhrases: [
            {
              english: "Welcome back, Mr. Anderson. It's a pleasure to see you again.",
              chinese: "Anderson 先生，欢迎回来。很高兴再次见到您。",
            },
            {
              english: "We've prepared your preferred room on the club floor.",
              chinese: "我们已为您准备好俱乐部楼层的偏好房间。",
            },
            {
              english: "Your welcome amenity has been placed in the room.",
              chinese: "欢迎礼遇已放置在您的房间内。",
            },
          ],
          sampleDialogue: [
            {
              speaker: "staff",
              english: "Your suite is ready. We've upgraded you to our corner suite.",
              chinese: "您的套房已准备好。我们为您升级了角落套房。",
            },
            {
              speaker: "guest",
              english: "You always exceed my expectations.",
              chinese: "你们总是超出我的预期。",
            },
          ],
        },
      },
    ],
  },
  {
    id: "crisis-management",
    title: "危机处理",
    subtitle: "Crisis Management",
    description: "超订、重大投诉等高压情境下的专业应对。",
    image: "photo-1566073771259-6a8506099945",
    levels: [
      {
        level: "C1",
        words: [
          {
            id: "cm-c1-w1",
            english: "Alternative accommodation",
            phonetic: "/ɔːlˈtɜːnətɪv əˌkɒməˈdeɪʃn/",
            chinese: "替代住宿",
            example: "We will arrange alternative accommodation at our sister property.",
          },
        ],
        sentences: [
          {
            id: "cm-c1-s1",
            english: "You are absolutely right to be upset, and I take full responsibility.",
            chinese: "您完全有理由感到不满，我承担全部责任。",
            context: "危机应对",
          },
        ],
        dialogues: [
          {
            id: "cm-c1-d1",
            title: "超订危机处理",
            subtitle: "Overbooking Crisis",
            lines: [
              {
                speaker: "guest",
                english: "I confirmed this booking weeks ago. How can you not have a room?",
                chinese: "我几周前就确认了预订。你们怎么可能没有房间？",
              },
              {
                speaker: "staff",
                english: "You are absolutely right to be upset, and I take full responsibility. Let me explain what we can do immediately.",
                chinese: "您完全有理由感到不满，我承担全部责任。请允许我向您说明我们可以立即采取的措施。",
              },
              {
                speaker: "staff",
                english: "We've secured a suite at our partner hotel, five minutes away. All transportation costs will be covered, and tonight is complimentary.",
                chinese: "我们已在五分钟内车程的合作酒店为您 secured 一间套房。所有交通费用由我们承担，今晚住宿免费。",
              },
              {
                speaker: "guest",
                english: "I expect a written apology from your manager.",
                chinese: "我要求你们经理书面道歉。",
              },
              {
                speaker: "staff",
                english: "Absolutely. Our manager will personally follow up with a written apology and a future stay voucher.",
                chinese: "一定。我们的经理将亲自跟进，致书面歉意并提供未来住宿券。",
              },
            ],
          },
        ],
        scenario: {
          id: "cm-c1-sc",
          title: "超订危机处理",
          setting: "Front desk, fully booked night with one overbooking",
          description:
            "酒店超订导致一位已确认预订的客人无法入住。你需要在保持专业的同时，提供 alternative accommodation 并争取客人谅解。",
          objectives: [
            "诚恳道歉，不推卸责任",
            "立即提供同等或更高标准的替代方案",
            "说明补偿措施（交通、差价、未来优惠）",
          ],
          keyPhrases: [
            {
              english: "I sincerely apologize — we are fully committed to resolving this for you.",
              chinese: "我深表歉意——我们一定全力为您解决。",
            },
            {
              english: "We have arranged a room at our sister property, just five minutes away.",
              chinese: "我们已在五分钟内车程的姊妹酒店为您安排了房间。",
            },
            {
              english: "All transportation costs will be covered, and tonight is complimentary.",
              chinese: "所有交通费用由我们承担，今晚住宿免费。",
            },
          ],
          sampleDialogue: [
            {
              speaker: "guest",
              english: "This is completely unacceptable. I had a confirmed reservation.",
              chinese: "这完全无法接受。我有确认的预订。",
            },
            {
              speaker: "staff",
              english: "You are right, and I take full responsibility. Here is our immediate solution.",
              chinese: "您说得对，我承担全部责任。以下是我们立即的解决方案。",
            },
          ],
        },
      },
    ],
  },
];

export function getBaseFrontDeskScenarios(): WorkScenario[] {
  return frontDeskWorkScenariosBase as unknown as WorkScenario[];
}

export const frontDeskWorkScenarios = attachSimulations(
  frontDeskWorkScenariosBase as unknown as WorkScenario[]
);

/** @deprecated use frontDeskWorkScenarios */
export const frontDeskWords = frontDeskWorkScenarios.flatMap((s) =>
  s.levels.flatMap((l) => l.words)
);
/** @deprecated */
export const frontDeskSentences = frontDeskWorkScenarios.flatMap((s) =>
  s.levels.flatMap((l) => l.sentences)
);
/** @deprecated */
export const frontDeskDialogues = frontDeskWorkScenarios.flatMap((s) =>
  s.levels.flatMap((l) => l.dialogues)
);
/** @deprecated */
export const frontDeskScenarios = frontDeskWorkScenarios.flatMap((s) =>
  s.levels.flatMap((l) => l.scenarios)
);

export function getFrontDeskStats() {
  const scenarios = frontDeskWorkScenarios.length;
  const departments = FRONT_DESK_DEPARTMENTS.length;
  const levels = new Set(
    frontDeskWorkScenarios.flatMap((s) => s.levels.map((l) => l.level))
  ).size;
  const words = frontDeskWords.length;
  const sentences = frontDeskSentences.length;
  const simulationsPerLevel = SIMULATIONS_PER_LEVEL;
  return { scenarios, departments, levels, words, sentences, simulationsPerLevel };
}
