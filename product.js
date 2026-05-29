'use strict';

require('dotenv').config();
const { Telegraf, Markup, Scenes, session } = require('telegraf');
const mongoose = require('mongoose');

// ─────────────────────────────────────────────
//  CONFIGURATION
// ─────────────────────────────────────────────
const BOT_TOKEN    = process.env.BOT_TOKEN    || "8820876470:AAF5EOl-gtjDTqQY02smLr7qh4KPB8kP_r0";
const MONGO_URI    = process.env.MONGO_URI    || 'mongodb+srv://akhmad12321312313:3kINAcgdXW0YdPj5@ahmad.y82yqis.mongodb.net/';
const ADMIN_ID     = process.env.ADMIN_ID ? parseInt(process.env.ADMIN_ID, 10) : 7553920926;
const EXNESS_LINK  = process.env.EXNESS_REF_LINK || 'https://one.exnessonelink.com/a/3a6rcif6lv';
const CHANNEL_LINK = process.env.CHANNEL_LINK || 'https://t.me/axmadostrade';

if (!BOT_TOKEN) { console.error('❌  BOT_TOKEN is missing in .env'); process.exit(1); }

// ─────────────────────────────────────────────
//  HELPER: escape MarkdownV2
// ─────────────────────────────────────────────
function escMD(text) {
  if (text === null || text === undefined) return '';
  return String(text).replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}

// ─────────────────────────────────────────────
//  100 ICT TRADING QUIZ QUESTIONS
// ─────────────────────────────────────────────
const QUIZ_QUESTIONS = [
  {
    id: 1, category: 'ICT Basics',
    question: 'Что означает аббревиатура ICT в трейдинге?',
    options: ['International Currency Trading', 'Inner Circle Trader', 'Institutional Chart Theory', 'Index Currency Trading'],
    correct: 1, xp: 5,
    explanation: 'ICT — Inner Circle Trader. Методология Майкла Хаддлстона, основанная на понимании действий крупных институциональных участников рынка.'
  },
  {
    id: 2, category: 'ICT Basics',
    question: 'Что такое Smart Money в контексте ICT?',
    options: ['Умные инвесторы в крипте', 'Институциональные деньги: банки, хедж-фонды, маркет-мейкеры', 'Стратегия торговли акциями', 'Робот-трейдер'],
    correct: 1, xp: 5,
    explanation: 'Smart Money — институциональные игроки (банки, хедж-фонды, центральные банки), которые двигают рынок. ICT учит торговать вместе с ними.'
  },
  {
    id: 3, category: 'ICT Basics',
    question: 'Что такое Liquidity в ICT?',
    options: ['Объём торгов на бирже', 'Скопление стоп-лоссов и ордеров, которые ищут институционалы', 'Скорость исполнения ордера', 'Спред между bid и ask'],
    correct: 1, xp: 5,
    explanation: 'Ликвидность в ICT — это скопление ордеров (стоп-лоссы розничных трейдеров), которые институционалы используют для входа в позиции.'
  },
  {
    id: 4, category: 'Structure',
    question: 'Что такое Market Structure Shift (MSS)?',
    options: ['Смена часового пояса биржи', 'Слом рыночной структуры — сигнал о смене тренда', 'Изменение объёма торгов', 'Новость, влияющая на рынок'],
    correct: 1, xp: 10,
    explanation: 'MSS (Market Structure Shift) — это пробой последнего значимого максимума/минимума, сигнализирующий о возможной смене тренда.'
  },
  {
    id: 5, category: 'Structure',
    question: 'Что такое Break of Structure (BOS)?',
    options: ['Закрытие биржи', 'Продолжение тренда через пробой предыдущего экстремума', 'Разворот тренда', 'Консолидация цены'],
    correct: 1, xp: 10,
    explanation: 'BOS — пробой структурного максимума (в бычьем тренде) или минимума (в медвежьем), подтверждающий продолжение тренда.'
  },
  {
    id: 100, category: 'Advanced ICT',
    question: 'Какой главный принцип ICT трейдинга?',
    options: ['Торговать часто и брать маленькую прибыль', 'Понимать намерения институционалов через ликвидность, структуру и время — торговать вместе с ними', 'Использовать много индикаторов', 'Следовать сигналам других'],
    correct: 1, xp: 20,
    explanation: 'Главный принцип ICT: не торговать против Smart Money, а понять куда они движутся, используя структуру рынка, зоны ликвидности и временные окна — и торговать вместе с ними.'
  },
];

// ─────────────────────────────────────────────
//  LOCALES
// ─────────────────────────────────────────────
const LOCALES = {
  ru: {
    welcome_title: '🚀 *TradePro Community*',
    welcome_desc: [
      '',
      '💎 Профессиональное трейдинг\\-сообщество нового уровня\\.',
      '',
      '📊 *Что вас ждёт:*',
      '├ 500–1000 pips сигналов ежедневно',
      '├ Бесплатные уроки по трейдингу',
      '├ Live Trade сессии',
      '├ Глубокая аналитика рынка',
      '├ Разбор реальных сделок',
      '├ Уникальная XP\\-система наград',
      '└ Возможность покупать контент за XP',
    ].join('\n'),
    btn_start_reg: '🚀 Начать регистрацию',
    ask_name: '👤 Введите ваше полное имя:',
    ask_phone: '📱 Поделитесь вашим номером телефона:',
    btn_share_phone: '📲 Поделиться номером',
    reg_success: '✅ Регистрация прошла успешно\\!',
    rules_title: '📜 *Правила вступления*',
    rules_text: [
      '',
      '1️⃣ Зарегистрируйтесь по нашей реферальной ссылке *Exness*',
      '2️⃣ После регистрации отправьте фото подтверждения',
      '3️⃣ После проверки администратором вы получите полный доступ',
    ].join('\n'),
    benefits_title: '🌟 *Что будет в канале*',
    benefits_text: [
      '',
      '📈 *500–1000 pips* сигналов в день',
      '🎓 Бесплатные уроки для новичков и профи',
      '🔴 Live Trade — торгуем вместе в прямом эфире',
      '📊 Ежедневная аналитика рынка',
      '🔍 Детальный разбор каждой сделки',
      '🏆 XP\\-система — зарабатывай очки за активность',
      '🛒 Покупай эксклюзивный контент за XP',
    ].join('\n'),
    exness_prompt: [
      '🔗 *Шаг 1: Регистрация в Exness*',
      '',
      'Перейдите по реферальной ссылке и зарегистрируйтесь:',
    ].join('\n'),
    btn_register_exness: '🔗 Зарегистрироваться в Exness',
    exness_photo_prompt: [
      '📸 *Шаг 2: Подтверждение регистрации*',
      '',
      'Отправьте скриншот вашего личного кабинета Exness',
      'с видимым именем аккаунта\\.',
    ].join('\n'),
    photo_received: [
      '✅ *Фото получено\\!*',
      '',
      '⏳ Ожидайте проверки администратора\\.',
      'Обычно это занимает до 24 часов\\.',
    ].join('\n'),
    approved: '🎉 *Поздравляем\\! Регистрация подтверждена\\.*\n\n✅ Добро пожаловать в *TradePro Community*\\!\nТеперь у вас есть полный доступ\\.',
    approved_channel: (link) => `📢 *Вступите в наш канал:*\n${escMD(link)}\n\n📜 *Правила канала:*\n\n1️⃣ Уважайте других участников\n2️⃣ Не спамьте в чате\n3️⃣ Следуйте сигналам ответственно\n4️⃣ Вопросы — через поддержку бота`,
    rejected: '❌ *Подтверждение отклонено\\.*\n\nПожалуйста, убедитесь, что скриншот чёткий и содержит видимое имя аккаунта\\.',
    rejected_steps: '📋 *Что нужно сделать для вступления:*\n\n1️⃣ Зарегистрируйтесь в *Exness* по нашей реферальной ссылке\n2️⃣ Сделайте чёткий скриншот личного кабинета \\(имя аккаунта должно быть видно\\)\n3️⃣ Отправьте скриншот боту для повторной проверки',
    main_menu: '🚀 *TradePro Community*\n\n💎 Профессиональное трейдинг\\-сообщество нового уровня\\.\n\n📈 *Что есть в канале:*\n├ 500–1000 pips сигналов в день\n├ Бесплатные уроки по трейдингу\n├ Live Trade — торгуем вместе в прямом эфире\n├ Ежедневная аналитика рынка\n├ Детальный разбор каждой сделки\n├ XP\\-система — зарабатывай очки за активность\n├ Покупай эксклюзивный контент за XP',
    btn_rules: '📖 Правила',
    btn_lessons: '📚 Уроки',
    btn_signals: '📈 Сигналы',
    btn_support: '🛠 Поддержка',
    btn_profile: '👤 Профиль',
    btn_channel: '📺 Канал',
    btn_quiz: '🧠 Опрос Trading',
    profile_title: '👤 Ваш профиль',
    profile_text: (u, date) => [
      '',
      `👤 Имя: ${u.fullname}`,
      `🔖 Username: @${u.username || 'нет'}`,
      `📱 Телефон: ${u.phone || '—'}`,
      `⭐ XP: ${u.xp}`,
      `🔑 Роль: ${u.role === 'admin' ? '👑 Админ' : '👤 Пользователь'}`,
      `✅ Exness: ${u.exness_verified ? 'Подтверждён' : '⏳ Ожидает'}`,
      `🌐 Язык: ${u.language === 'ru' ? '🇷🇺 Русский' : u.language === 'en' ? '🇺🇸 English' : '🇺🇿 O\'zbekcha'}`,
      `📅 Регистрация: ${date}`,
    ].join('\n'),
    btn_change_lang: '🌐 Сменить язык',
    btn_refresh: '🔄 Обновить',
    btn_back: '⬅️ Назад',
    lang_select: '🌐 Выберите язык:',
    lang_changed: '✅ Язык изменён!',
    support_ask: [
      '🛠 Служба поддержки',
      '',
      'Напишите ваш вопрос или проблему.',
      'Администратор ответит вам в ближайшее время.',
    ].join('\n'),
    support_sent: '✅ Ваше сообщение отправлено администратору.',
    support_cancel: 'Отменено.',
    btn_cancel: '❌ Отмена',
    lessons_title: '📚 Уроки',
    lesson_locked: '🔒 Урок заблокирован',
    lesson_buy: xp => `🛒 Купить за ${xp} XP`,
    not_enough_xp: '❌ Недостаточно XP.',
    lesson_bought: '✅ Урок разблокирован!',
    signals_title: '📈 Последние сигналы',
    no_signals: 'Сигналов пока нет.',
    need_verification: '⚠️ Пожалуйста, сначала пройдите верификацию Exness.',
    register_prompt_title: '🚀 Пройдите регистрацию',
    register_prompt_text: 'Чтобы получить доступ ко всем разделам, зарегистрируйтесь в Exness по кнопке ниже и отправьте подтверждение.',
    already_registered: '✅ Вы уже зарегистрированы. Используйте меню.',
    quiz_welcome: (total, done, xp) =>
      `🧠 *ICT Quiz — Тест по трейдингу*\n\n📊 Вопросов всего: ${total}\n✅ Пройдено: ${done}\n⭐ XP заработано: ${xp}\n\n_Правильный ответ \\= XP очки_\n_Начнём?_`,
    quiz_already_done: '✅ Вы уже ответили на этот вопрос!',
    quiz_correct: (xp) => `✅ *Правильно! +${xp} XP*`,
    quiz_wrong: '❌ *Неверно!*',
    quiz_explanation: 'ℹ️',
    quiz_progress: (done, total) => `📊 Прогресс: ${done}/${total} вопросов`,
    quiz_next: '➡️ Следующий вопрос',
    quiz_finish: '🏁 Завершить',
    quiz_results: (correct, total, xp) =>
      `🏆 *Результат квиза*\n\n✅ Правильных ответов: ${correct}/${total}\n⭐ Заработано XP: ${xp}\n\n${correct >= 80 ? '🎖 Мастер ICT!' : correct >= 60 ? '📈 Хороший результат!' : correct >= 40 ? '📚 Продолжайте учиться!' : '💪 Повторите материал ICT!'}`,
    btn_start_quiz: '▶️ Начать квиз',
    btn_continue_quiz: '▶️ Продолжить',
    btn_restart_quiz: '🔄 Пройти заново',
    quiz_category: (cat, num) => `📌 Категория: ${cat} | Вопрос #${num}`,
  },

  en: {
    welcome_title: '🚀 *TradePro Community*',
    welcome_desc: [
      '',
      '💎 Professional next\\-level trading community\\.',
      '',
      '📊 *What awaits you:*',
      '├ 500–1000 pips signals daily',
      '├ Free trading lessons',
      '├ Live Trade sessions',
      '├ Deep market analytics',
      '├ Trade breakdowns',
      '├ Unique XP reward system',
      '└ Buy exclusive content with XP',
    ].join('\n'),
    btn_start_reg: '🚀 Start Registration',
    ask_name: '👤 Enter your full name:',
    ask_phone: '📱 Share your phone number:',
    btn_share_phone: '📲 Share Number',
    reg_success: '✅ Registration successful\\!',
    rules_title: '📜 *Entry Rules*',
    rules_text: [
      '',
      '1️⃣ Register via our *Exness* referral link',
      '2️⃣ After registration, send a confirmation photo',
      '3️⃣ After admin verification you get full access',
    ].join('\n'),
    benefits_title: '🌟 *What\'s in the channel*',
    benefits_text: [
      '',
      '📈 *500–1000 pips* signals per day',
      '🎓 Free lessons for beginners and pros',
      '🔴 Live Trade — trade together live',
      '📊 Daily market analysis',
      '🔍 Detailed trade breakdown',
      '🏆 XP system — earn points for activity',
      '🛒 Buy exclusive content with XP',
    ].join('\n'),
    exness_prompt: [
      '🔗 *Step 1: Register on Exness*',
      '',
      'Click the referral link and sign up:',
    ].join('\n'),
    btn_register_exness: '🔗 Register on Exness',
    exness_photo_prompt: [
      '📸 *Step 2: Confirm registration*',
      '',
      'Send a screenshot of your Exness account',
      'with your account name visible\\.',
    ].join('\n'),
    photo_received: [
      '✅ *Photo received\\!*',
      '',
      '⏳ Awaiting admin verification\\.',
      'Usually takes up to 24 hours\\.',
    ].join('\n'),
    approved: '🎉 *Congratulations\\! Registration confirmed\\.*\n\n✅ Welcome to *TradePro Community*\\!\nYou now have full access\\.',
    approved_channel: (link) => `📢 *Join our channel:*\n${escMD(link)}\n\n📜 *Channel Rules:*\n\n1️⃣ Respect other members\n2️⃣ No spam\n3️⃣ Follow signals responsibly\n4️⃣ Questions — via bot support`,
    rejected: '❌ *Confirmation rejected\\.*\n\nPlease make sure the screenshot is clear and shows your account name\\.',
    rejected_steps: '📋 *Steps to join:*\n\n1️⃣ Register on *Exness* via our referral link\n2️⃣ Take a clear screenshot of your account \\(account name must be visible\\)\n3️⃣ Send the screenshot to the bot for re\\-verification',
    register_prompt_title: '🚀 Please register first',
    register_prompt_text: 'To access all sections, register on Exness via the button below and send your verification screenshot.',
    main_menu: '🚀 *TradePro Community*\n\n💎 Professional next\\-level trading community\\.\n\n📈 *What\'s in the channel:*\n├ 500–1000 pips signals daily\n├ Free trading lessons\n├ Live Trade sessions\n├ Daily market analysis\n├ Detailed trade breakdown\n├ XP system — earn points for activity\n├ Buy exclusive content with XP',
    btn_rules: '📖 Rules',
    btn_lessons: '📚 Lessons',
    btn_signals: '📈 Signals',
    btn_support: '🛠 Support',
    btn_profile: '👤 Profile',
    btn_channel: '📺 Channel',
    btn_quiz: '🧠 trading Quiz',
    profile_title: '👤 Your Profile',
    profile_text: (u, date) => [
      '',
      `👤 Name: ${u.fullname}`,
      `🔖 Username: @${u.username || 'none'}`,
      `📱 Phone: ${u.phone || '—'}`,
      `⭐ XP: ${u.xp}`,
      `🔑 Role: ${u.role === 'admin' ? '👑 Admin' : '👤 User'}`,
      `✅ Exness: ${u.exness_verified ? 'Verified' : '⏳ Pending'}`,
      `🌐 Language: ${u.language === 'ru' ? '🇷🇺 Russian' : u.language === 'en' ? '🇺🇸 English' : '🇺🇿 Uzbek'}`,
      `📅 Registered: ${date}`,
    ].join('\n'),
    btn_change_lang: '🌐 Change Language',
    btn_refresh: '🔄 Refresh',
    btn_back: '⬅️ Back',
    lang_select: '🌐 Select language:',
    lang_changed: '✅ Language changed!',
    support_ask: ['🛠 Support', '', 'Write your question or issue.', 'An admin will reply soon.'].join('\n'),
    support_sent: '✅ Your message has been sent to the admin.',
    support_cancel: 'Cancelled.',
    btn_cancel: '❌ Cancel',
    lessons_title: '📚 Lessons',
    lesson_locked: '🔒 Lesson locked',
    lesson_buy: xp => `🛒 Buy for ${xp} XP`,
    not_enough_xp: '❌ Not enough XP.',
    lesson_bought: '✅ Lesson unlocked!',
    signals_title: '📈 Latest Signals',
    no_signals: 'No signals yet.',
    need_verification: '⚠️ Please complete Exness verification first.',
    already_registered: '✅ You are already registered. Use the menu.',
    quiz_welcome: (total, done, xp) =>
      `🧠 *ICT Quiz*\n\n📊 Total questions: ${total}\n✅ Completed: ${done}\n⭐ XP earned: ${xp}\n\n_Correct answer \\= XP points_\n_Ready to start?_`,
    quiz_already_done: '✅ Already answered!',
    quiz_correct: (xp) => `✅ *Correct! +${xp} XP*`,
    quiz_wrong: '❌ *Wrong!*',
    quiz_explanation: 'ℹ️',
    quiz_progress: (done, total) => `📊 Progress: ${done}/${total}`,
    quiz_next: '➡️ Next question',
    quiz_finish: '🏁 Finish',
    quiz_results: (correct, total, xp) =>
      `🏆 *Quiz Results*\n\n✅ Correct: ${correct}/${total}\n⭐ XP earned: ${xp}\n\n${correct >= 80 ? '🎖 ICT Master!' : correct >= 60 ? '📈 Good result!' : correct >= 40 ? '📚 Keep learning!' : '💪 Review ICT material!'}`,
    btn_start_quiz: '▶️ Start Quiz',
    btn_continue_quiz: '▶️ Continue',
    btn_restart_quiz: '🔄 Restart',
    quiz_category: (cat, num) => `📌 Category: ${cat} | Q#${num}`,
  },

  uz: {
    welcome_title: '🚀 *TradePro Community*',
    welcome_desc: [
      '',
      '💎 Yangi darajadagi professional treyding hamjamiyati\\.',
      '',
      '📊 *Sizni nima kutmoqda:*',
      '├ Kuniga 500–1000 pips signallar',
      '├ Bepul treyding darslari',
      '├ Live Trade sessiyalari',
      '├ Chuqur bozor tahlili',
      '├ Bitimlarni tahlil qilish',
      '├ Noyob XP mukofot tizimi',
      '└ XP ga eksklyuziv kontent sotib olish',
    ].join('\n'),
    btn_start_reg: '🚀 Ro\'yxatdan o\'tish',
    ask_name: '👤 To\'liq ismingizni kiriting:',
    ask_phone: '📱 Telefon raqamingizni ulashing:',
    btn_share_phone: '📲 Raqamni ulashish',
    reg_success: '✅ Ro\'yxatdan o\'tish muvaffaqiyatli\\!',
    rules_title: '📜 *Kirish qoidalari*',
    rules_text: [
      '',
      '1️⃣ *Exness* referal havolasi orqali ro\'yxatdan o\'ting',
      '2️⃣ Ro\'yxatdan o\'tgandan so\'ng tasdiqlash rasmini yuboring',
      '3️⃣ Admin tekshiruvidan so\'ng to\'liq kirish imkoniyati beriladi',
    ].join('\n'),
    benefits_title: '🌟 *Kanalda nima bor*',
    benefits_text: [
      '',
      '📈 Kuniga *500–1000 pips* signal',
      '🎓 Yangi boshlovchilar va professionallar uchun bepul darslar',
      '🔴 Live Trade — birga jonli savdo',
      '📊 Kunlik bozor tahlili',
      '🔍 Har bir bitimni batafsil ko\'rib chiqish',
      '🏆 XP tizimi — faollik uchun ball to\'plang',
      '🛒 XP ga eksklyuziv kontent sotib oling',
    ].join('\n'),
    exness_prompt: ['🔗 *1\\-qadam: Exness\'da ro\'yxatdan o\'ting*', '', 'Referal havolani bosing va ro\'yxatdan o\'ting:'].join('\n'),
    btn_register_exness: '🔗 Exness\'da ro\'yxatdan o\'tish',
    exness_photo_prompt: ['📸 *2\\-qadam: Ro\'yxatdan o\'tishni tasdiqlash*', '', 'Exness shaxsiy kabinetingizning skrinshotini', 'hisob nomi ko\'rinadigan holda yuboring\\.'].join('\n'),
    photo_received: ['✅ *Rasm qabul qilindi\\!*', '', '⏳ Admin tekshiruvi kutilmoqda\\.', 'Odatda 24 soatgacha vaqt ketadi\\.'].join('\n'),
    approved: '🎉 *Tabriklaymiz\\! Ro\'yxat tasdiqlandi\\.*\n\n✅ *TradePro Community*ga xush kelibsiz\\!\nEndi sizda to\'liq kirish imkoni bor\\.',
    approved_channel: (link) => `📢 *Kanalimizga qo\'shiling:*\n${escMD(link)}\n\n📜 *Kanal qoidalari:*\n\n1️⃣ Boshqa a\'zolarga hurmat bilan muomala qiling\n2️⃣ Spam qilmang\n3️⃣ Signallarga mas\'uliyat bilan amal qiling\n4️⃣ Savollar — bot orqali`,
    rejected: '❌ *Tasdiq rad etildi\\.*\n\nSkrinshot aniq ekanligiga va hisob nomi ko\'rinishiga ishonch hosil qiling\\.',
    rejected_steps: '📋 *Qo\'shilish uchun nima qilish kerak:*\n\n1️⃣ Bizning referal havola orqali *Exness*da ro\'yxatdan o\'ting\n2️⃣ Shaxsiy kabinet skrinshotini oling \\(hisob nomi ko\'rinishi shart\\)\n3️⃣ Qayta tekshirish uchun skrinshotni botga yuboring',
    main_menu: '🚀 *TradePro Community*\n\n💎 Yangi darajadagi professional treyding hamjamiyati\\.\n\n📈 *Kanalda nima bor:*\n├ Kuniga 500–1000 pips signal\n├ Bepul treyding darslari\n├ Live Trade — birga jonli savdo\n├ Kunlik bozor tahlili\n├ Har bir bitimni batafsil ko\'rib chiqish\n├ XP tizimi — faollik uchun ball to\'plang\n├ XP ga eksklyuziv kontent sotib oling',
    btn_rules: '📖 Qoidalar',
    btn_lessons: '📚 Darsliklar',
    btn_signals: '✅ 500-2000pips signal 🚀',
    btn_support: '👨‍💻 Yordam',
    btn_profile: '👤 Profil',
    btn_channel: '📺 Kanal',
    btn_quiz: ' ✅ IQ test ball 🧠',
    profile_title: '👤 Sizning profilingiz',
    profile_text: (u, date) => [
      '',
      `👤 Ism: ${u.fullname}`,
      `🔖 Username: @${u.username || 'yo\'q'}`,
      `📱 Telefon: ${u.phone || '—'}`,
      `⭐ XP: ${u.xp}`,
      `🔑 Rol: ${u.role === 'admin' ? '👑 Admin' : '👤 Foydalanuvchi'}`,
      `✅ Exness: ${u.exness_verified ? 'Tasdiqlangan' : '⏳ Kutilmoqda'}`,
      `🌐 Til: ${u.language === 'ru' ? '🇷🇺 Ruscha' : u.language === 'en' ? '🇺🇸 Inglizcha' : '🇺🇿 O\'zbekcha'}`,
      `📅 Ro\'yxat sanasi: ${date}`,
    ].join('\n'),
    btn_change_lang: '🌐 Tilni o\'zgartirish',
    btn_refresh: '🔄 Yangilash',
    btn_back: '⬅️ Orqaga',
    register_prompt_title: '🚀 Avval ro\'yxatdan o\'ting',
    register_prompt_text: 'Barcha bo\'limlarga kirish uchun quyidagi tugma orqali Exnessda ro\'yxatdan o\'ting va tasdiqlash skrinshotini yuboring.',
    lang_select: '🌐 Tilni tanlang:',
    lang_changed: '✅ Til o\'zgartirildi!',
    support_ask: ['🛠 Yordam markazi', '', 'Savolingiz yoki muammoingizni yozing.', 'Admin tez orada javob beradi.'].join('\n'),
    support_sent: '✅ Xabaringiz adminga yuborildi.',
    support_cancel: 'Bekor qilindi.',
    btn_cancel: '❌ Bekor qilish',
    lessons_title: '📚 Darsliklar',
    lesson_locked: '🔒 Dars qulflangan',
    lesson_buy: xp => `🛒 ${xp} XP ga sotib olish`,
    not_enough_xp: '❌ Yetarli XP yo\'q.',
    lesson_bought: '✅ Dars ochildi!',
    signals_title: '📈 So\'nggi signallar',
    no_signals: 'Hali signal yo\'q.',
    need_verification: '⚠️ Avval Exness verifikatsiyasidan o\'ting.',
    already_registered: '✅ Siz allaqachon ro\'yxatdan o\'tgansiz. Menyudan foydalaning.',
    quiz_welcome: (total, done, xp) =>
      `🧠 *ICT Test*\n\n📊 Jami savollar: ${total}\n✅ Bajarildi: ${done}\n⭐ XP to'plandi: ${xp}\n\n_To'g'ri javob \\= XP ball_\n_Boshlaylikmi?_`,
    quiz_already_done: '✅ Bu savolga allaqachon javob berdingiz!',
    quiz_correct: (xp) => `✅ *To\'g\'ri! +${xp} XP*`,
    quiz_wrong: '❌ *Noto\'g\'ri!*',
    quiz_explanation: 'ℹ️',
    quiz_progress: (done, total) => `📊 Jarayon: ${done}/${total}`,
    quiz_next: '➡️ Keyingi savol',
    quiz_finish: '🏁 Tugatish',
    quiz_results: (correct, total, xp) =>
      `🏆 *Test natijalari*\n\n✅ To\'g\'ri javoblar: ${correct}/${total}\n⭐ XP to\'plandi: ${xp}\n\n${correct >= 80 ? '🎖 ICT Ustasi!' : correct >= 60 ? '📈 Yaxshi natija!' : correct >= 40 ? '📚 O\'rganishni davom ettiring!' : '💪 ICT materiallarini takrorlang!'}`,
    btn_start_quiz: '▶️ Testni boshlash',
    btn_continue_quiz: '▶️ Davom etish',
    btn_restart_quiz: '🔄 Qayta boshlash',
    quiz_category: (cat, num) => `📌 Kategoriya: ${cat} | Savol #${num}`,
  },
};

function t(lang, key, ...args) {
  const loc = LOCALES[lang] || LOCALES.ru;
  const val = loc[key];
  if (typeof val === 'function') return val(...args);
  return val || key;
}

// ─────────────────────────────────────────────
//  MONGOOSE SCHEMAS
// ─────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  telegram_id:      { type: Number, required: true, unique: true },
  fullname:         { type: String, default: '' },
  username:         { type: String, default: '' },
  phone:            { type: String, default: '' },
  language:         { type: String, default: 'ru', enum: ['ru', 'en', 'uz'] },
  xp:               { type: Number, default: 0 },
  role:             { type: String, default: 'user', enum: ['user', 'admin'] },
  exness_verified:  { type: Boolean, default: false },
  exness_photo_id:  { type: String, default: '' },
  unlocked_lessons: { type: [String], default: [] },
  quiz_answers:     { type: Map, of: Boolean, default: {} },
  quiz_xp_earned:   { type: Number, default: 0 },
  created_at:       { type: Date, default: Date.now },
});
const User = mongoose.model('UserTrading', UserSchema);

const SignalSchema = new mongoose.Schema({
  pair:       { type: String, required: true },
  direction:  { type: String, enum: ['BUY', 'SELL'], required: true },
  entry:      { type: String, required: true },
  tp:         { type: String, required: true },
  sl:         { type: String, required: true },
  pips:       { type: String, default: '' },
  status:     { type: String, default: 'active', enum: ['active', 'closed', 'cancelled'] },
  created_at: { type: Date, default: Date.now },
});
const Signal = mongoose.model('Signal', SignalSchema);

const LessonSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  content:    { type: String, required: true },
  xp_cost:    { type: Number, default: 0 },
  is_free:    { type: Boolean, default: false },
  order:      { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});
const Lesson = mongoose.model('LessonTrading', LessonSchema);

const SupportSchema = new mongoose.Schema({
  from_id:    { type: Number, required: true },
  from_name:  { type: String, default: '' },
  message:    { type: String, required: true },
  replied:    { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});
const SupportMsg = mongoose.model('SupportMsg', SupportSchema);

// ─────────────────────────────────────────────
//  DATABASE HELPERS
// ─────────────────────────────────────────────
async function getUser(telegram_id) {
  return User.findOne({ telegram_id });
}
async function getOrCreateUser(ctx) {
  const tid = ctx.from.id;
  let user = await User.findOne({ telegram_id: tid });
  if (!user) {
    user = await User.create({
      telegram_id: tid,
      username: ctx.from.username || '',
      role: tid === ADMIN_ID ? 'admin' : 'user',
    });
  }
  return user;
}

// ─────────────────────────────────────────────
//  KEYBOARDS
// ─────────────────────────────────────────────
function mainMenuKeyboard(lang) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t(lang, 'btn_rules'), 'menu:rules'), Markup.button.callback(t(lang, 'btn_lessons'), 'menu:lessons')],
    [Markup.button.callback(t(lang, 'btn_signals'), 'menu:signals'), Markup.button.callback(t(lang, 'btn_channel'), 'menu:channel')],
    [Markup.button.callback(t(lang, 'btn_support'), 'menu:support'), Markup.button.callback(t(lang, 'btn_profile'), 'menu:profile')],
    [Markup.button.callback(t(lang, 'btn_quiz'), 'menu:quiz')],
  ]);
}

function phoneKeyboard(lang) {
  return Markup.keyboard([
    [Markup.button.contactRequest(t(lang, 'btn_share_phone'))],
    [t(lang, 'btn_cancel')],
  ]).resize().oneTime();
}

function cancelKeyboard(lang) {
  return Markup.keyboard([[t(lang, 'btn_cancel')]]).resize().oneTime();
}

function langInlineKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🇷🇺 Русский',    'lang:ru')],
    [Markup.button.callback('🇺🇸 English',    'lang:en')],
    [Markup.button.callback('🇺🇿 O\'zbekcha', 'lang:uz')],
  ]);
}

async function requireRegistration(ctx, user) {
  const lang = user?.language || 'ru';
  if (user?.fullname) return true;
  await ctx.reply(
    `${t(lang, 'register_prompt_title')}\n\n${t(lang, 'register_prompt_text')}`,
    {
      parse_mode: 'MarkdownV2',
      ...Markup.inlineKeyboard([[Markup.button.url(t(lang, 'btn_register_exness'), EXNESS_LINK)]]),
    }
  );
  return false;
}


// button 

// ─────────────────────────────────────────────
//  QUIZ HELPERS
// ─────────────────────────────────────────────

function getQuizStats(user) {
  const answers = user.quiz_answers || new Map();
  const answered = answers instanceof Map ? answers.size : Object.keys(answers).length;
  const correct = answers instanceof Map
    ? [...answers.values()].filter(Boolean).length
    : Object.values(answers).filter(Boolean).length;
  return { answered, correct, xp: user.quiz_xp_earned || 0 };
}

function getNextQuestion(user) {
  const answers = user.quiz_answers || new Map();
  const answeredIds = new Set(
    answers instanceof Map ? [...answers.keys()].map(String) : Object.keys(answers).map(String)
  );
  return QUIZ_QUESTIONS.find(q => !answeredIds.has(String(q.id)));
}

function hasAnswered(user, questionId) {
  const answers = user.quiz_answers || new Map();
  if (answers instanceof Map) return answers.has(String(questionId));
  return String(questionId) in answers;
}

function buildQuizQuestion(q, lang, questionNumber) {
  const letters = ['A', 'B', 'C', 'D'];
  const optionsText = q.options.map((opt, i) => `${letters[i]}) ${opt}`).join('\n');

  const text = [
    t(lang, 'quiz_category', q.category, q.id),
    '',
    `❓ *Вопрос ${questionNumber} из ${QUIZ_QUESTIONS.length}*`,
    '',
    q.question,
    '',
    optionsText,
    '',
    `💰 Награда: *${q.xp} XP*`,
  ].join('\n');

  const buttons = q.options.map((opt, i) => [
    Markup.button.callback(`${letters[i]}) ${opt.substring(0, 30)}${opt.length > 30 ? '...' : ''}`, `quiz:answer:${q.id}:${i}`)
  ]);

  return { text, buttons };
}

// ─────────────────────────────────────────────
//  SCENES (FSM)
// ─────────────────────────────────────────────

const registrationScene = new Scenes.WizardScene(
  'registration',

  async (ctx) => {
    const user = await getOrCreateUser(ctx);
    if (user.fullname) {
      await ctx.reply(t(user.language, 'already_registered'), mainMenuKeyboard(user.language));
      return ctx.scene.leave();
    }
    ctx.wizard.state.lang = user.language;
    await ctx.reply(t(user.language, 'ask_name'));
    return ctx.wizard.next();
  },

  async (ctx) => {
    if (!ctx.message?.text) { await ctx.reply('❌ Введите текст.'); return; }
    ctx.wizard.state.fullname = ctx.message.text.trim();
    const lang = ctx.wizard.state.lang;
    await ctx.reply(t(lang, 'ask_phone'), phoneKeyboard(lang));
    return ctx.wizard.next();
  },

  async (ctx) => {
    const lang = ctx.wizard.state.lang;
    if (ctx.message?.text === t(lang, 'btn_cancel')) {
      await ctx.reply('❌', Markup.removeKeyboard());
      return ctx.scene.leave();
    }
    let phone = '';
    if (ctx.message?.contact) {
      phone = ctx.message.contact.phone_number;
    } else if (ctx.message?.text) {
      phone = ctx.message.text.trim();
    } else {
      await ctx.reply(t(lang, 'ask_phone'));
      return;
    }
    await User.findOneAndUpdate(
      { telegram_id: ctx.from.id },
      { fullname: ctx.wizard.state.fullname, username: ctx.from.username || '', phone }
    );
    await ctx.reply(t(lang, 'reg_success'), { parse_mode: 'MarkdownV2', ...Markup.removeKeyboard() });
    await new Promise(r => setTimeout(r, 600));
    await ctx.reply(`${t(lang, 'rules_title')}\n${t(lang, 'rules_text')}`, { parse_mode: 'MarkdownV2' });
    await new Promise(r => setTimeout(r, 800));
    await ctx.reply(`${t(lang, 'benefits_title')}\n${t(lang, 'benefits_text')}`, { parse_mode: 'MarkdownV2' });
    await new Promise(r => setTimeout(r, 800));
    await ctx.reply(t(lang, 'exness_prompt'), {
      parse_mode: 'MarkdownV2',
      ...Markup.inlineKeyboard([[Markup.button.url(t(lang, 'btn_register_exness'), EXNESS_LINK)]]),
    });
    await new Promise(r => setTimeout(r, 500));
    await ctx.reply(t(lang, 'exness_photo_prompt'), { parse_mode: 'MarkdownV2' });
    return ctx.scene.enter('exness_verification');
  }
);

const exnessScene = new Scenes.BaseScene('exness_verification');

exnessScene.enter(async (_ctx) => {});

exnessScene.on('photo', async (ctx) => {
  const user = await getUser(ctx.from.id);
  const lang = user?.language || 'ru';
  const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
  await User.findOneAndUpdate({ telegram_id: ctx.from.id }, { exness_photo_id: fileId });
  await ctx.reply(t(lang, 'photo_received'), { parse_mode: 'MarkdownV2' });
  try {
    await ctx.telegram.sendPhoto(ADMIN_ID, fileId, {
      caption: [
        `📋 Новая заявка на верификацию`,
        ``,
        `👤 Имя: ${user?.fullname || ctx.from.first_name}`,
        `Username: @${ctx.from.username || 'нет'}`,
        `ID: ${ctx.from.id}`,
        `Язык: ${lang}`,
      ].join('\n'),
      ...Markup.inlineKeyboard([[
        Markup.button.callback('✅ Approve', `approve:${ctx.from.id}`),
        Markup.button.callback('❌ Reject',  `reject:${ctx.from.id}`),
      ]]),
    });
  } catch (e) { console.error('Failed to notify admin:', e.message); }
  return ctx.scene.leave();
});

exnessScene.on('message', async (ctx) => {
  const user = await getUser(ctx.from.id);
  const lang = user?.language || 'ru';
  await ctx.reply(t(lang, 'exness_photo_prompt'), { parse_mode: 'MarkdownV2' });
});

const supportScene = new Scenes.BaseScene('support');

supportScene.enter(async (ctx) => {
  const user = await getUser(ctx.from.id);
  const lang = user?.language || 'ru';
  await ctx.reply(t(lang, 'support_ask'), cancelKeyboard(lang));
});

supportScene.on('text', async (ctx) => {
  const user = await getUser(ctx.from.id);
  const lang = user?.language || 'ru';
  if (ctx.message.text === t(lang, 'btn_cancel')) {
    await ctx.reply(t(lang, 'support_cancel'), Markup.removeKeyboard());
    await ctx.reply(t(lang, 'main_menu'), { parse_mode: 'MarkdownV2', ...mainMenuKeyboard(lang) });
    return ctx.scene.leave();
  }
  await SupportMsg.create({ from_id: ctx.from.id, from_name: user?.fullname || ctx.from.first_name, message: ctx.message.text });
  try {
    await ctx.telegram.sendMessage(ADMIN_ID,
      [`📩 Сообщение в поддержку`, ``, `Имя: ${user?.fullname || ctx.from.first_name}`, `Username: @${ctx.from.username || 'нет'}`, `ID: ${ctx.from.id}`, ``, `Сообщение: ${ctx.message.text}`].join('\n'),
      { ...Markup.inlineKeyboard([[Markup.button.callback('📨 Ответить', `reply:${ctx.from.id}`)]]) }
    );
  } catch (e) { console.error(e.message); }
  await ctx.reply(t(lang, 'support_sent'), Markup.removeKeyboard());
  await ctx.reply(t(lang, 'main_menu'), { parse_mode: 'MarkdownV2', ...mainMenuKeyboard(lang) });
  return ctx.scene.leave();
});

const adminReplySessions = {};
const adminReplyScene = new Scenes.BaseScene('admin_reply');
adminReplyScene.enter(async (ctx) => {
  await ctx.reply('✏️ Введите ваш ответ пользователю:', Markup.keyboard([['❌ Отмена']]).resize().oneTime());
});
adminReplyScene.on('text', async (ctx) => {
  if (ctx.message.text === '❌ Отмена') {
    await ctx.reply('Отменено.', Markup.removeKeyboard());
    return ctx.scene.leave();
  }
  const targetId = adminReplySessions[ctx.from.id];
  if (!targetId) { await ctx.reply('❌ Ошибка.'); return ctx.scene.leave(); }
  try {
    await ctx.telegram.sendMessage(targetId, `📨 Ответ от администратора:\n\n${ctx.message.text}`);
    await ctx.reply('✅ Ответ отправлен.', Markup.removeKeyboard());
  } catch {
    await ctx.reply('❌ Не удалось доставить сообщение.', Markup.removeKeyboard());
  }
  delete adminReplySessions[ctx.from.id];
  return ctx.scene.leave();
});

// ─────────────────────────────────────────────
//  BOT SETUP
// ─────────────────────────────────────────────
const bot = new Telegraf(BOT_TOKEN);
const stage = new Scenes.Stage([registrationScene, exnessScene, supportScene, adminReplyScene]);
bot.use(session());
bot.use(stage.middleware());

bot.use(async (ctx, next) => {
  if (ctx.from) {
    ctx.dbUser = await User.findOne({ telegram_id: ctx.from.id });
  }
  return next();
});

// ═══════════════════════════════════════════════════════════════
//  /START
// ═══════════════════════════════════════════════════════════════
bot.start(async (ctx) => {
  const user = ctx.dbUser;
  const lang = user?.language || 'ru';

  if (user?.fullname && user?.exness_verified) {
    await ctx.reply(t(lang, 'main_menu'), { parse_mode: 'MarkdownV2', ...mainMenuKeyboard(lang) });
    return;
  }

  const channelInfoText = [
    t(lang, 'welcome_title'),
    t(lang, 'welcome_desc'),
    t(lang, 'rules_title'),
    t(lang, 'rules_text'),
    t(lang, 'benefits_title'),
    t(lang, 'benefits_text'),
  ].join('\n\n');

  await ctx.reply(channelInfoText, {
    parse_mode: 'MarkdownV2',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('📖 Правила', 'menu:rules')],
      [Markup.button.callback('📚 Курсы', 'menu:lessons')],
      [Markup.button.callback('📈 Сигналы', 'menu:signals')],
      [Markup.button.callback('🧠 Опросы', 'menu:quiz')],
      [Markup.button.callback('👤 Профиль', 'menu:profile')],
      [Markup.button.callback('🛠 Поддержка', 'menu:support')],
      [Markup.button.callback('🚀 Начать регистрацию', 'start_registration')],
    ]),
  });

  if (!ADMIN_ID) {
    await ctx.reply(`⚠️ Добавьте этот ID в файл .env:\n\nADMIN_ID=${ctx.from.id}`);
  }
});

// ═══════════════════════════════════════════════════════════════
//  MENU HANDLERS
// ═══════════════════════════════════════════════════════════════

bot.action('menu:rules', async (ctx) => {
  await ctx.answerCbQuery();
  const user = ctx.dbUser;
  const lang = user?.language || 'ru';
  if (!(await requireRegistration(ctx, user))) return;
  await ctx.reply(
    `${t(lang, 'rules_title')}\n${t(lang, 'rules_text')}\n\n${t(lang, 'benefits_title')}\n${t(lang, 'benefits_text')}`,
    { parse_mode: 'MarkdownV2' }
  );
});

bot.action('menu:channel', async (ctx) => {
  await ctx.answerCbQuery();
  const user = ctx.dbUser;
  if (!(await requireRegistration(ctx, user))) return;
  await ctx.reply(`📺 Наш Telegram канал:\n\n${CHANNEL_LINK}`);
});

bot.action('menu:lessons', async (ctx) => {
  await ctx.answerCbQuery();
  const user = ctx.dbUser;
  const lang = user?.language || 'ru';

  if (!(await requireRegistration(ctx, user))) return;
  if (!user.exness_verified) {
    await ctx.reply(t(lang, 'need_verification'));
    return;
  }

  const lessons = await Lesson.find().sort({ order: 1 });
  if (!lessons.length) { await ctx.reply('📚 Уроков пока нет.'); return; }
  await ctx.reply(t(lang, 'lessons_title'));
  for (const lesson of lessons) {
    const isUnlocked = lesson.is_free || user.unlocked_lessons.includes(lesson._id.toString());
    const buttons = isUnlocked
      ? [[Markup.button.callback(`📖 ${lesson.title}`, `lesson:read:${lesson._id}`)]]
      : [[Markup.button.callback(`🔒 ${lesson.title} — ${t(lang, 'lesson_buy', lesson.xp_cost)}`, `lesson:buy:${lesson._id}`)]];
    await ctx.reply(
      [`${isUnlocked ? '✅' : '🔒'} ${lesson.title}`, `💰 Стоимость: ${lesson.is_free ? 'Бесплатно' : lesson.xp_cost + ' XP'}`].join('\n'),
      Markup.inlineKeyboard(buttons)
    );
  }
});

bot.action('menu:signals', async (ctx) => {
  await ctx.answerCbQuery();
  const user = ctx.dbUser;
  const lang = user?.language || 'ru';

  if (!(await requireRegistration(ctx, user))) return;
  if (!user.exness_verified) {
    await ctx.reply(t(lang, 'need_verification'));
    return;
  }

  const signals = await Signal.find({ status: 'active' }).sort({ created_at: -1 }).limit(10);
  await ctx.reply(t(lang, 'signals_title'));
  if (!signals.length) { await ctx.reply(t(lang, 'no_signals')); return; }
  for (const sig of signals) {
    const emoji = sig.direction === 'BUY' ? '📈' : '📉';
    const statusEmoji = { active: '🟢', closed: '⚪', cancelled: '🔴' }[sig.status];
    const date = new Date(sig.created_at).toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US');
    await ctx.reply(
      [`${emoji} ${sig.pair} — ${sig.direction}`, ``, `📌 Вход:  ${sig.entry}`, `🎯 TP:    ${sig.tp}`, `🛡 SL:    ${sig.sl}`, sig.pips ? `💰 Pips: ${sig.pips}` : '', ``, `${statusEmoji} Статус: ${sig.status.toUpperCase()}`, `⏰ ${date}`].filter(Boolean).join('\n')
    );
  }
});

bot.action('menu:quiz', async (ctx) => {
  await ctx.answerCbQuery();
  const user = ctx.dbUser;
  const lang = user?.language || 'ru';

  if (!(await requireRegistration(ctx, user))) return;
  if (!user.exness_verified) {
    await ctx.reply(t(lang, 'need_verification'));
    return;
  }

  await showQuizMenu(ctx, user);
});

bot.action('menu:profile', async (ctx) => {
  await ctx.answerCbQuery();
  const user = ctx.dbUser;
  const lang = user?.language || 'ru';

  if (!(await requireRegistration(ctx, user))) return;

  const dateStr = new Date(user.created_at).toLocaleDateString(
    lang === 'ru' ? 'ru-RU' : lang === 'uz' ? 'uz-UZ' : 'en-US'
  );
  await ctx.reply(
    `${t(lang, 'profile_title')}\n${t(lang, 'profile_text', user, dateStr)}`,
    {
      ...Markup.inlineKeyboard([
        [Markup.button.callback(t(lang, 'btn_change_lang'), 'open_lang')],
        [Markup.button.callback(t(lang, 'btn_refresh'),     'refresh_profile')],
      ]),
    }
  );
});

bot.action('menu:support', async (ctx) => {
  await ctx.answerCbQuery();
  const user = ctx.dbUser;
  const lang = user?.language || 'ru';

  if (!(await requireRegistration(ctx, user))) return;

  return ctx.scene.enter('support');
});

bot.action('start_registration', async (ctx) => {
  await ctx.answerCbQuery();
  const user = ctx.dbUser;
  if (user?.fullname) {
    const lang = user.language;
    if (user.exness_verified) {
      await ctx.reply(t(lang, 'already_registered'), mainMenuKeyboard(lang));
      return;
    }
    return ctx.scene.enter('exness_verification');
  }
  return ctx.scene.enter('registration');
});

// ─────────────────────────────────────────────
//  APPROVE / REJECT
// ─────────────────────────────────────────────
bot.action(/^approve:(\d+)$/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.answerCbQuery('⛔ No access');
  const userId = parseInt(ctx.match[1], 10);
  await User.findOneAndUpdate({ telegram_id: userId }, { exness_verified: true });
  const target = await User.findOne({ telegram_id: userId });
  const lang = target?.language || 'ru';
  try {
    await ctx.telegram.sendMessage(userId, t(lang, 'approved'), { parse_mode: 'MarkdownV2' });
    await new Promise(r => setTimeout(r, 400));
    await ctx.telegram.sendMessage(userId, t(lang, 'approved_channel', CHANNEL_LINK), { parse_mode: 'MarkdownV2' });
    await new Promise(r => setTimeout(r, 400));
    await ctx.telegram.sendMessage(userId, t(lang, 'main_menu'), { parse_mode: 'MarkdownV2', ...mainMenuKeyboard(lang) });
  } catch (e) { console.error('Approve send error:', e.message); }
  try { await ctx.editMessageCaption(`✅ Одобрено — ${target?.fullname || userId}`); } catch {}
  await ctx.answerCbQuery('✅ Approved');
});

bot.action(/^reject:(\d+)$/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.answerCbQuery('⛔ No access');
  const userId = parseInt(ctx.match[1], 10);
  const target = await User.findOne({ telegram_id: userId });
  const lang = target?.language || 'ru';
  try {
    await ctx.telegram.sendMessage(userId, t(lang, 'rejected'), { parse_mode: 'MarkdownV2' });
    await new Promise(r => setTimeout(r, 400));
    await ctx.telegram.sendMessage(userId, t(lang, 'rejected_steps'), { parse_mode: 'MarkdownV2' });
    await new Promise(r => setTimeout(r, 400));
    await ctx.telegram.sendMessage(userId, t(lang, 'exness_prompt'), {
      parse_mode: 'MarkdownV2',
      ...Markup.inlineKeyboard([[Markup.button.url(t(lang, 'btn_register_exness'), EXNESS_LINK)]]),
    });
    await new Promise(r => setTimeout(r, 300));
    await ctx.telegram.sendMessage(userId, t(lang, 'exness_photo_prompt'), { parse_mode: 'MarkdownV2' });
  } catch (e) { console.error('Reject send error:', e.message); }
  try { await ctx.editMessageCaption(`❌ Отклонено — ${target?.fullname || userId}`); } catch {}
  await ctx.answerCbQuery('❌ Rejected');
});

bot.action(/^reply:(\d+)$/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.answerCbQuery('⛔ No access');
  const userId = parseInt(ctx.match[1], 10);
  adminReplySessions[ctx.from.id] = userId;
  await ctx.answerCbQuery('✏️ Открываю редактор...');
  return ctx.scene.enter('admin_reply');
});

// ─────────────────────────────────────────────
//  LANGUAGE
// ─────────────────────────────────────────────
bot.action(/^lang:(.+)$/, async (ctx) => {
  const newLang = ctx.match[1];
  if (!['ru', 'en', 'uz'].includes(newLang)) return ctx.answerCbQuery('❌');
  await User.findOneAndUpdate({ telegram_id: ctx.from.id }, { language: newLang });
  await ctx.answerCbQuery(LOCALES[newLang].lang_changed);
  await ctx.editMessageText(LOCALES[newLang].lang_changed);
  await ctx.reply(t(newLang, 'main_menu'), { parse_mode: 'MarkdownV2', ...mainMenuKeyboard(newLang) });
});

// ─────────────────────────────────────────────
//  QUIZ ACTIONS
// ─────────────────────────────────────────────

async function showQuizMenu(ctx, user) {
  const lang = user.language || 'ru';
  const stats = getQuizStats(user);
  const total = QUIZ_QUESTIONS.length;

  const buttons = [];

  if (stats.answered < total) {
    buttons.push([Markup.button.callback(
      stats.answered === 0 ? t(lang, 'btn_start_quiz') : t(lang, 'btn_continue_quiz'),
      'quiz:next'
    )]);
  }

  if (stats.answered > 0) {
    buttons.push([Markup.button.callback(t(lang, 'btn_restart_quiz'), 'quiz:restart')]);
  }

  await ctx.reply(
    t(lang, 'quiz_welcome', total, stats.answered, stats.xp),
    { parse_mode: 'MarkdownV2', ...Markup.inlineKeyboard(buttons) }
  );
}

bot.action('quiz:next', async (ctx) => {
  await ctx.answerCbQuery();
  const user = await User.findOne({ telegram_id: ctx.from.id });
  if (!user) return;

  if (!user.exness_verified) {
    await ctx.reply(t(user.language, 'need_verification'));
    return;
  }

  const q = getNextQuestion(user);
  if (!q) {
    const stats = getQuizStats(user);
    await ctx.reply(
      t(user.language, 'quiz_results', stats.correct, QUIZ_QUESTIONS.length, stats.xp),
      { parse_mode: 'MarkdownV2' }
    );
    return;
  }

  const stats = getQuizStats(user);
  const questionNumber = stats.answered + 1;
  const { text, buttons } = buildQuizQuestion(q, user.language, questionNumber);

  await ctx.reply(text, { parse_mode: 'Markdown', ...Markup.inlineKeyboard(buttons) });
});

bot.action(/^quiz:answer:(\d+):(\d+)$/, async (ctx) => {
  await ctx.answerCbQuery();

  const questionId = parseInt(ctx.match[1], 10);
  const optionIndex = parseInt(ctx.match[2], 10);
  const user = await User.findOne({ telegram_id: ctx.from.id });
  if (!user) return;

  const lang = user.language || 'ru';

  if (hasAnswered(user, questionId)) {
    await ctx.answerCbQuery(t(lang, 'quiz_already_done'));
    return;
  }

  const q = QUIZ_QUESTIONS.find(q => q.id === questionId);
  if (!q) return;

  const isCorrect = optionIndex === q.correct;
  const letters = ['A', 'B', 'C', 'D'];

  if (isCorrect) {
    await User.findOneAndUpdate(
      { telegram_id: ctx.from.id },
      {
        $set: { [`quiz_answers.${questionId}`]: true },
        $inc: { xp: q.xp, quiz_xp_earned: q.xp },
      }
    );
  } else {
    await User.findOneAndUpdate(
      { telegram_id: ctx.from.id },
      { $set: { [`quiz_answers.${questionId}`]: false } }
    );
  }

  const correctAnswer = `${letters[q.correct]}) ${q.options[q.correct]}`;

  let resultText = isCorrect
    ? t(lang, 'quiz_correct', q.xp)
    : t(lang, 'quiz_wrong');

  resultText += `\n\n${t(lang, 'quiz_explanation')} ${q.explanation}`;

  if (!isCorrect) {
    resultText += `\n\n✅ Правильный ответ: *${correctAnswer}*`;
  }

  const opts = q.options.map((opt, i) => {
    if (i === q.correct) return `✅ ${letters[i]}) ${opt}`;
    if (i === optionIndex && !isCorrect) return `❌ ${letters[i]}) ${opt}`;
    return `${letters[i]}) ${opt}`;
  }).join('\n');

  const updatedText = [
    `📌 ${q.category} | Вопрос #${q.id}`,
    '',
    q.question,
    '',
    opts,
    '',
    resultText,
  ].join('\n');

  try {
    await ctx.editMessageText(updatedText, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([[
        Markup.button.callback(t(lang, 'quiz_next') + ` ➡️`, 'quiz:next'),
      ]]),
    });
  } catch (e) {
    await ctx.reply(updatedText, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([[Markup.button.callback(t(lang, 'quiz_next'), 'quiz:next')]]),
    });
  }
});

bot.action('quiz:restart', async (ctx) => {
  await ctx.answerCbQuery('🔄');
  await User.findOneAndUpdate(
    { telegram_id: ctx.from.id },
    { $set: { quiz_answers: {}, quiz_xp_earned: 0 } }
  );
  const user = await User.findOne({ telegram_id: ctx.from.id });
  if (user) await showQuizMenu(ctx, user);
});

// ─────────────────────────────────────────────
//  MAIN MENU TEXT HANDLERS
// ─────────────────────────────────────────────
function matchMenuButton(text, key) {
  return ['ru', 'en', 'uz'].some(l => LOCALES[l][key] === text);
}

bot.on('text', async (ctx, next) => {
  const user = ctx.dbUser;
  if (!user?.fullname) return next();

  const lang = user.language;
  const txt  = ctx.message.text;

  if (matchMenuButton(txt, 'btn_quiz')) {
    if (!user.exness_verified) {
      await ctx.reply(t(lang, 'need_verification'));
      return;
    }
    await showQuizMenu(ctx, user);
    return;
  }

  if (matchMenuButton(txt, 'btn_rules')) {
    await ctx.reply(
      `${t(lang, 'rules_title')}\n${t(lang, 'rules_text')}\n\n${t(lang, 'benefits_title')}\n${t(lang, 'benefits_text')}`,
      { parse_mode: 'MarkdownV2' }
    );
    return;
  }

  if (matchMenuButton(txt, 'btn_profile')) {
    const dateStr = new Date(user.created_at).toLocaleDateString(
      lang === 'ru' ? 'ru-RU' : lang === 'uz' ? 'uz-UZ' : 'en-US'
    );
    await ctx.reply(
      `${t(lang, 'profile_title')}\n${t(lang, 'profile_text', user, dateStr)}`,
      {
        ...Markup.inlineKeyboard([
          [Markup.button.callback(t(lang, 'btn_change_lang'), 'open_lang')],
          [Markup.button.callback(t(lang, 'btn_refresh'),     'refresh_profile')],
        ]),
      }
    );
    return;
  }

  if (matchMenuButton(txt, 'btn_support')) {
    if (!user.exness_verified) { await ctx.reply(t(lang, 'need_verification')); return; }
    return ctx.scene.enter('support');
  }

  if (matchMenuButton(txt, 'btn_channel')) {
    await ctx.reply(`📺 Наш Telegram канал:\n\n${CHANNEL_LINK}`);
    return;
  }

  if (matchMenuButton(txt, 'btn_lessons')) {
    if (!user.exness_verified) { await ctx.reply(t(lang, 'need_verification')); return; }
    const lessons = await Lesson.find().sort({ order: 1 });
    if (!lessons.length) { await ctx.reply('📚 Уроков пока нет.'); return; }
    await ctx.reply(t(lang, 'lessons_title'));
    for (const lesson of lessons) {
      const isUnlocked = lesson.is_free || user.unlocked_lessons.includes(lesson._id.toString());
      const buttons = isUnlocked
        ? [[Markup.button.callback(`📖 ${lesson.title}`, `lesson:read:${lesson._id}`)]]
        : [[Markup.button.callback(`🔒 ${lesson.title} — ${t(lang, 'lesson_buy', lesson.xp_cost)}`, `lesson:buy:${lesson._id}`)]];
      await ctx.reply(
        [`${isUnlocked ? '✅' : '🔒'} ${lesson.title}`, `💰 Стоимость: ${lesson.is_free ? 'Бесплатно' : lesson.xp_cost + ' XP'}`].join('\n'),
        Markup.inlineKeyboard(buttons)
      );
    }
    return;
  }

  if (matchMenuButton(txt, 'btn_signals')) {
    if (!user.exness_verified) { await ctx.reply(t(lang, 'need_verification')); return; }
    const signals = await Signal.find({ status: 'active' }).sort({ created_at: -1 }).limit(10);
    await ctx.reply(t(lang, 'signals_title'));
    if (!signals.length) { await ctx.reply(t(lang, 'no_signals')); return; }
    for (const sig of signals) {
      const emoji = sig.direction === 'BUY' ? '📈' : '📉';
      const statusEmoji = { active: '🟢', closed: '⚪', cancelled: '🔴' }[sig.status];
      const date = new Date(sig.created_at).toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-US');
      await ctx.reply(
        [`${emoji} ${sig.pair} — ${sig.direction}`, ``, `📌 Вход:  ${sig.entry}`, `🎯 TP:    ${sig.tp}`, `🛡 SL:    ${sig.sl}`, sig.pips ? `💰 Pips: ${sig.pips}` : '', ``, `${statusEmoji} Статус: ${sig.status.toUpperCase()}`, `⏰ ${date}`].filter(Boolean).join('\n')
      );
    }
    return;
  }

  return next();
});

bot.action(/^lesson:read:(.+)$/, async (ctx) => {
  const lessonId = ctx.match[1];
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) return ctx.answerCbQuery('❌ Урок не найден');
  await ctx.answerCbQuery();
  await ctx.reply([`📖 ${lesson.title}`, '', lesson.content].join('\n'));
});

bot.action(/^lesson:buy:(.+)$/, async (ctx) => {
  const user = ctx.dbUser;
  const lang = user?.language || 'ru';
  const lessonId = ctx.match[1];
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) return ctx.answerCbQuery('❌');
  if (user.xp < lesson.xp_cost) return ctx.answerCbQuery(t(lang, 'not_enough_xp'));
  await User.findOneAndUpdate(
    { telegram_id: ctx.from.id },
    { $inc: { xp: -lesson.xp_cost }, $push: { unlocked_lessons: lessonId } }
  );
  await ctx.answerCbQuery(t(lang, 'lesson_bought'));
  await ctx.editMessageText([`✅ ${lesson.title}`, '', lesson.content].join('\n'));
});

bot.action('open_lang', async (ctx) => {
  await ctx.answerCbQuery();
  const user = ctx.dbUser;
  const lang = user?.language || 'ru';
  await ctx.reply(t(lang, 'lang_select'), langInlineKeyboard());
});

bot.action('refresh_profile', async (ctx) => {
  await ctx.answerCbQuery('🔄');
  const user = await User.findOne({ telegram_id: ctx.from.id });
  const lang = user?.language || 'ru';
  const dateStr = new Date(user.created_at).toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'uz' ? 'uz-UZ' : 'en-US');
  await ctx.editMessageText(
    `${t(lang, 'profile_title')}\n${t(lang, 'profile_text', user, dateStr)}`,
    {
      ...Markup.inlineKeyboard([
        [Markup.button.callback(t(lang, 'btn_change_lang'), 'open_lang')],
        [Markup.button.callback(t(lang, 'btn_refresh'),     'refresh_profile')],
      ]),
    }
  );
});

// ─────────────────────────────────────────────
//  ADMIN COMMANDS
// ─────────────────────────────────────────────
function isAdmin(ctx) { return ctx.from?.id === ADMIN_ID; }

bot.command('admin', async (ctx) => {
  if (!isAdmin(ctx)) return;
  await ctx.reply(
    ['👑 Панель администратора', '', '📋 Доступные команды:', '/users — Список пользователей', '/stats — Статистика', '/broadcast <текст> — Рассылка всем', '/signal — Добавить сигнал', '/addlesson — Добавить урок', '/addxp <id> <amount> — Начислить XP'].join('\n')
  );
});

bot.command('users', async (ctx) => {
  if (!isAdmin(ctx)) return;
  const users = await User.find().sort({ created_at: -1 }).limit(20);
  if (!users.length) { await ctx.reply('Пользователей нет.'); return; }
  const lines = users.map((u, i) =>
    `${i + 1}. ${u.fullname || '—'} | @${u.username || '—'} | XP:${u.xp} | ${u.exness_verified ? '✅' : '⏳'}`
  );
  await ctx.reply(`👥 Пользователи (последние 20):\n\n${lines.join('\n')}`);
});

bot.command('stats', async (ctx) => {
  if (!isAdmin(ctx)) return;
  const total    = await User.countDocuments();
  const verified = await User.countDocuments({ exness_verified: true });
  const pending  = total - verified;
  const today    = new Date(); today.setHours(0, 0, 0, 0);
  const newToday = await User.countDocuments({ created_at: { $gte: today } });
  const signals  = await Signal.countDocuments();
  const lessons  = await Lesson.countDocuments();
  await ctx.reply(
    ['📊 Статистика бота', '', `👥 Всего пользователей: ${total}`, `✅ Верифицировано: ${verified}`, `⏳ Ожидают: ${pending}`, `🆕 Новых сегодня: ${newToday}`, '', `📈 Сигналов: ${signals}`, `📚 Уроков: ${lessons}`, `🧠 Вопросов в квизе: ${QUIZ_QUESTIONS.length}`].join('\n')
  );
});

bot.command('broadcast', async (ctx) => {
  if (!isAdmin(ctx)) return;
  const text = ctx.message.text.replace('/broadcast', '').trim();
  if (!text) { await ctx.reply('❌ Введите текст после /broadcast'); return; }
  const users = await User.find({ exness_verified: true });
  let sent = 0, failed = 0;
  await ctx.reply(`📡 Рассылка для ${users.length} пользователей...`);
  for (const u of users) {
    try {
      await ctx.telegram.sendMessage(u.telegram_id, `📢 Сообщение от TradePro:\n\n${text}`);
      sent++;
    } catch { failed++; }
    await new Promise(r => setTimeout(r, 50));
  }
  await ctx.reply(`✅ Отправлено: ${sent}\n❌ Ошибок: ${failed}`);
});

const signalWizard = new Scenes.WizardScene(
  'signal_wizard',
  async (ctx) => {
    if (!isAdmin(ctx)) return ctx.scene.leave();
    ctx.wizard.state.signal = {};
    await ctx.reply('📈 Пара (например: XAUUSD):');
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.signal.pair = ctx.message.text.toUpperCase();
    await ctx.reply('📊 Направление:', Markup.inlineKeyboard([
      [Markup.button.callback('📈 BUY', 'sig:BUY'), Markup.button.callback('📉 SELL', 'sig:SELL')],
    ]));
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (ctx.message) { await ctx.reply('Нажмите BUY или SELL.'); }
  },
  async (ctx) => {
    if (!ctx.message?.text) { return; }
    ctx.wizard.state.signal.entry = ctx.message.text;
    await ctx.reply('🎯 TP:');
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.signal.tp = ctx.message.text;
    await ctx.reply('🛡 SL:');
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.signal.sl = ctx.message.text;
    await ctx.reply('💰 Ожидаемые Pips: (или 0)');
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.signal.pips = ctx.message.text;
    const s = ctx.wizard.state.signal;
    const sig = await Signal.create(s);
    await ctx.reply('✅ Сигнал добавлен!', Markup.removeKeyboard());
    const emoji = sig.direction === 'BUY' ? '📈' : '📉';
    const msg = [`${emoji} ${sig.pair} — ${sig.direction}`, ``, `📌 Вход: ${sig.entry}`, `🎯 TP:   ${sig.tp}`, `🛡 SL:   ${sig.sl}`, sig.pips && sig.pips !== '0' ? `💰 Pips: ${sig.pips}` : ''].filter(Boolean).join('\n');
    const users = await User.find({ exness_verified: true });
    let sent = 0;
    for (const u of users) {
      try { await ctx.telegram.sendMessage(u.telegram_id, msg); sent++; } catch {}
      await new Promise(r => setTimeout(r, 50));
    }
    await ctx.reply(`📡 Сигнал отправлен ${sent} пользователям.`);
    return ctx.scene.leave();
  }
);

signalWizard.action(/^sig:(BUY|SELL)$/, async (ctx) => {
  ctx.wizard.state.signal.direction = ctx.match[1];
  await ctx.answerCbQuery(ctx.match[1]);
  await ctx.editMessageText(`✅ Направление: ${ctx.match[1]}`);
  await ctx.reply('📌 Цена входа:');
  ctx.wizard.selectStep(3);
});

stage.register(signalWizard);

bot.command('signal', async (ctx) => {
  if (!isAdmin(ctx)) return;
  return ctx.scene.enter('signal_wizard');
});

bot.command('addxp', async (ctx) => {
  if (!isAdmin(ctx)) return;
  const parts = ctx.message.text.split(' ');
  if (parts.length < 3) { await ctx.reply('Usage: /addxp <telegram_id> <amount>'); return; }
  const tid = parseInt(parts[1], 10);
  const amount = parseInt(parts[2], 10);
  if (isNaN(tid) || isNaN(amount)) { await ctx.reply('❌ Неверные параметры'); return; }
  const user = await User.findOneAndUpdate({ telegram_id: tid }, { $inc: { xp: amount } }, { new: true });
  if (!user) { await ctx.reply('❌ Пользователь не найден.'); return; }
  await ctx.reply(`✅ +${amount} XP -> ${user.fullname} (Итого: ${user.xp} XP)`);
  try { await ctx.telegram.sendMessage(tid, `🎉 +${amount} XP начислено!\n⭐ Ваш баланс: ${user.xp} XP`); } catch {}
});

const lessonWizard = new Scenes.WizardScene(
  'lesson_wizard',
  async (ctx) => {
    if (!isAdmin(ctx)) return ctx.scene.leave();
    await ctx.reply('📚 Название урока:');
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.title = ctx.message.text;
    await ctx.reply('📝 Содержание урока:');
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.content = ctx.message.text;
    await ctx.reply('💰 Стоимость в XP (0 = бесплатно):');
    return ctx.wizard.next();
  },
  async (ctx) => {
    const cost = parseInt(ctx.message.text, 10);
    const lesson = await Lesson.create({
      title:   ctx.wizard.state.title,
      content: ctx.wizard.state.content,
      xp_cost: isNaN(cost) ? 0 : cost,
      is_free: !cost || cost === 0,
      order:   await Lesson.countDocuments(),
    });
    await ctx.reply(`✅ Урок "${lesson.title}" добавлен!`);
    return ctx.scene.leave();
  }
);

stage.register(lessonWizard);

bot.command('addlesson', async (ctx) => {
  if (!isAdmin(ctx)) return;
  return ctx.scene.enter('lesson_wizard');
});

bot.on('message', async (ctx) => {
  const user = ctx.dbUser;
  if (!user?.fullname) {
    await ctx.reply('👋 Нажмите /start чтобы начать.');
  }
});

bot.catch((err, ctx) => {
  console.error(`[Bot Error] ${ctx?.updateType}:`, err.message || err);
});

// ─────────────────────────────────────────────
//  LAUNCH
// ─────────────────────────────────────────────
async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected:', MONGO_URI);
    await bot.launch();
    console.log('🚀 Bot launched successfully!');
    console.log(`👑 Admin ID: ${ADMIN_ID}`);
    console.log(`📢 Channel: ${CHANNEL_LINK}`);
    console.log(`🧠 Quiz questions loaded: ${QUIZ_QUESTIONS.length}`);
  } catch (err) {
    console.error('❌ Failed to start:', err.message);
    process.exit(1);
  }
}

process.once('SIGINT',  () => { bot.stop('SIGINT');  mongoose.disconnect(); });
process.once('SIGTERM', () => { bot.stop('SIGTERM'); mongoose.disconnect(); });

main();