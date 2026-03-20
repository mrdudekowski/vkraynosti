export const UI = {
  hero: {
    /** Основной h1 главной страницы (SEO и скринридеры). */
    documentTitle: 'Туры по дикой природе Приморского края',
    viewTour:      'Подробнее о туре',
    /** Интервал автосмены слайдов героя (мс). */
    autoplayIntervalMs: 7000,
  },
  breadcrumbs: {
    navLabel: 'Хлебные крошки',
    home:     'Главная',
  },
  team: {
    experienceSuffix: 'опыта',
  },
  teamModal: {
    specialtiesHeading: 'Специализации',
    experienceLabel:  'Опыт',
  },
  privacyPage: {
    metaTitle:   'Политика конфиденциальности | Вкрайности',
    metaDescription:
      'Как компания «Вкрайности» обрабатывает персональные данные пользователей сайта.',
    title:       'Политика конфиденциальности',
    intro:
      'Настоящая политика описывает общие принципы обработки данных при использовании сайта «Вкрайности». Актуальная юридическая редакция может быть предоставлена по запросу.',
    paragraphs: [
      'Мы собираем только те данные, которые вы добровольно передаёте при обращении через формы обратной связи, мессенджеры или по телефону (например, имя и контакт для связи).',
      'Персональные данные используются для ответа на запросы о турах, бронировании и информирования об услугах. Мы не продаём данные третьим лицам.',
      'Технические данные (cookies, IP-адрес в обезличенном виде) могут обрабатываться для стабильной работы сайта и аналитики в объёме, предусмотренном законодательством.',
      'Вы вправе запросить уточнение или удаление своих данных, направив обращение через контакты, указанные на сайте.',
    ] as const,
    backLink: 'На главную',
  },
  nav: {
    brand: 'Вкрайности',
    links: [
      { label: 'Туры',         hash: 'tours' },
      { label: 'Команда',      hash: 'team' },
      { label: 'Безопасность', hash: 'safety' },
      { label: 'Контакты',     hash: 'contact' },
    ],
    cta: 'Выбрать тур',
  },
  sections: {
    tours:        'Туры по сезонам',
    toursSub:     'Четыре сезона — четыре разных приключения',
    toursTitleBySeason: {
      winter: 'Туры зимой',
      spring: 'Туры весной',
      summer: 'Туры летом',
      fall:   'Туры осенью',
    },
    otherSeasons:  'Другие сезоны',
    switchSeason:  'В другой сезон',
    team:         'Команда Вкрайности',
    teamSub:      'Опытные гиды и эксперты',
    safety:       'Безопасность в наших походах',
    safetySub:    'Ваша безопасность — наш приоритет',
    safety_cta:   'Подробнее о безопасности',
    contact:      'Связаться с нами',
  },
  contact: {
    subtitle: 'Готовы ответить на любые вопросы о наших турах',
    phone:    'Позвонить',
    telegram: 'Написать в Telegram',
    max:      'Написать в Max',
  },
  seasons: {
    winter: { label: 'Зима',  emoji: '❄️', description: 'Байкал подо льдом, Хибины, полярное сияние' },
    spring: { label: 'Весна', emoji: '🌿', description: 'Цветение Алтая, таяние Байкала, Камчатка' },
    summer: { label: 'Лето',  emoji: '☀️', description: 'Вулканы, тропы, сплавы и белые ночи' },
    fall:   { label: 'Осень', emoji: '🍂', description: 'Золотой Алтай, карельский лес, горные сёла' },
  },
  footer: {
    tagline:        'Открываем дикую природу России',
    privacy:        'Политика конфиденциальности',
    rights:         '© 2025 Вкрайности. Все права защищены.',
    navHeading:     'Навигация',
    contactHeading: 'Контакты',
  },
  modal: {
    close: 'Закрыть',
  },
  difficulty: {
    labels: {
      Easy:   'Лёгкий',
      Medium: 'Средний',
      Hard:   'Сложный',
      Expert: 'Эксперт',
    },
    styles: {
      Easy:   'bg-difficulty-easy-bg text-difficulty-easy-fg',
      Medium: 'bg-difficulty-medium-bg text-difficulty-medium-fg',
      Hard:   'bg-difficulty-hard-bg text-difficulty-hard-fg',
      Expert: 'bg-difficulty-expert-bg text-difficulty-expert-fg',
    },
  },
  tourDetail: {
    about:      'Об этом туре',
    gallery:    'Фотогалерея',
    highlights: 'Что вас ждёт',
    notFound:        'Тур не найден',
    notFoundWithId:  'Тур с ID «{id}» не существует.',
    homeLink:   'На главную',
  },
  errorFallback: {
    title:       'Что-то пошло не так',
    message:     'Произошла ошибка. Попробуйте обновить страницу.',
    retryButton: 'Обновить страницу',
  },
  notFoundPage: {
    metaTitle:   'Страница не найдена | Вкрайности',
    heading:     'Страница не найдена',
    description: 'Такой страницы нет. Возможно, ссылка устарела или вы перешли по неверному адресу.',
    homeLink:    'На главную',
  },
} as const;
