export const UI = {
  /**
   * Десять букв баннера «В другой сезон» (главная): порядок = индекс колонки 0…9.
   * См. `getHomeSeasonBannerClips` и `HomeSeasonBanner`.
   */
  homeSeasonBannerWordmark: 'Вкрайности' as const,
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
      { label: 'Безопасность', hash: 'safety' },
      { label: 'Команда',      hash: 'team' },
      { label: 'Контакты',     hash: 'contact' },
    ],
    cta: 'Выбрать тур',
    /** Свёрнутый выбор сезона под навбаром (&lt;500px): раскрыть панель. */
    seasonDockExpand: 'Показать сезоны',
    /** Кнопка-стрелка у dock (aria-label). */
    seasonDockToggleArrow: 'Раскрыть или свернуть выбор сезона',
    /** Свёрнутая панель раскрыта: переход к списку туров активного сезона. */
    seasonDockGoToList: 'Список туров этого сезона',
    /** Кнопка сезона в navbar (&lt;500px): панель открыта. */
    seasonNavMenuToggleCollapse: 'Свернуть выбор сезона',
    /** Статичный значок сезона в navbar (&lt;500px): группа с иконкой и стрелкой. */
    seasonNavCurrentSeasonGroup: 'Текущий сезон',
    /** Затемнение за выезжающим меню: закрыть по нажатию. */
    mobileMenuCloseOverlay: 'Закрыть меню',
    /** Выезжающая панель навигации (мобильный бургер), `aria-label` для `role="dialog"`. */
    mobileMenuDialog: 'Меню навигации',
  },
  sections: {
    /** `id` секции туров на главной (якорь из навигации, hash «Туры»). */
    homeToursSectionElementId: 'tours' as const,
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
    /** У ворот главной: только слово, без видео и таймлайна (см. `HomeSeasonBanner`). */
    homeGateSeasonBannerStaticPresentation: true as const,
    /** При статичном баннере: по hover на колонку — fade-in и loop-видео (если есть `videoSrc`). */
    homeGateSeasonBannerLetterHoverVideo: true as const,
    /** `aria-label` региона баннера с колонками «Вкрайности» на главной. */
    homeSeasonBannerRegion: 'Баннер с названием Вкрайности по колонкам сезона',
    /**
     * Кнопка-стрелка внизу стартового экрана: тот же переход, что у ссылок навбара на секции
     * (`Link` + `hash`, скролл через `ScrollToTopOnNavigate` и `NAVBAR_SCROLL_OFFSET_PX`).
     */
    homeGateScrollToHeroAriaLabel: 'Перейти к обзору туров' as const,
    team:         'Команда Вкрайности',
    teamSub:      'Опытные гиды и эксперты',
    safety:       'Безопасность в наших походах',
    safetySub:    'Ваша безопасность — наш приоритет',
    /** Текст на герое секции (поверх фото), короткий смысловой акцент. */
    safetyHeroHighlight:
      'Готовим маршрут, следим за погодой и остаёмся на связи — на каждом шаге.',
    /** Alt героя секции «Безопасность» на главной. */
    safetyHeroImageAlt:
      'Инструктаж и проверка снаряжения перед выходом группы на маршрут',
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
    /** Пока подгружается ленивый чанк модалки (`Layout` + `Suspense`): `aria-label` полноэкранного плейсхолдера. */
    lazyChunkLoadingLabel: 'Загрузка окна',
  },
  tourRequestModal: {
    title: 'Заявка на тур',
    nameLabel: 'Имя',
    nameHint: 'Как к вам обращаться?',
    emailLabel: 'Email',
    emailHint: 'Необязательно',
    phoneLabel: 'Телефон',
    /** Плейсхолдер-маска без привязки к коду страны. */
    phonePlaceholder: '+7 (___) ___-__-__',
    tourLabel: 'Выбранный тур',
    questionLabel: 'Ваш вопрос',
    questionHint: 'С каким вопросом мы можем вам помочь?',
    messengerLabel: 'В каком мессенджере вам удобнее общаться?',
    messengerWhatsappAria: 'WhatsApp',
    messengerTelegramAria: 'Telegram',
    messengerMaxAria: 'MAX',
    privacyPrefix: 'Я согласен с ',
    privacyLink: 'политикой конфиденциальности',
    privacySuffix: ' и обработкой персональных данных',
    submit: 'Отправить заявку',
    sending: 'Отправка…',
    success: 'Заявка отправлена. Мы свяжемся с вами.',
    errors: {
      nameRequired: 'Укажите имя',
      emailInvalid: 'Некорректный email',
      phoneRequired: 'Укажите телефон',
      questionRequired: 'Напишите вопрос',
      messengerRequired: 'Выберите мессенджер',
      privacyRequired: 'Нужно согласие с политикой',
    },
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
  tourCard: {
    /** Чип на карточке, когда у тура задан `metaAudienceLabel`. */
    audienceChipClasses: 'bg-brand-accent text-brand-primary',
    /** Карточка тура на главной (сезон «зима»): основная строка цены; ниже — зачёркнутая ранее указанная сумма. */
    winterPriceLead: 'Уточняйте стоимость',
    /** Значение `Tour.price`, когда вместо суммы — заглушка; на карточке не дублируем её в зачёркнутой строке. */
    winterPricePlaceholderNoListing: 'БЕЗ ЦЕНЫ',
    /** Карточка в гриде главной: раскрыть полный список туров активного сезона. */
    showMoreCta: 'Показать все туры',
    /** Карточка в гриде главной: вернуть сокращённый список туров (3 карточки). */
    showLessCta: 'Свернуть туры',
    /** Теневая карточка-переход к следующему сезону при свободной ячейке сетки. */
    nextSeasonCloneCta: 'Отправиться Вкрайности',
    /** Alt префикс фонового превью в теневой карточке следующего сезона. */
    nextSeasonCloneImageAltPrefix: 'Превью следующего сезона',
  },
  tourDetail: {
    about:      'Об этом туре',
    gallery:    'Наши Подвиги',
    programHeading: 'Программа тура',
    programTimeDisclaimer:
      '*Время указано примерно и может меняться из-за погодных или иных условий',
    includedHeading: 'Что включено в стоимость тура',
    tourMetaFactsAriaLabel: 'Срок и сведения о туре',
    metaLabelDuration: 'Срок',
    metaLabelDifficulty: 'Сложность',
    /** Над значением длительности в `TourDetailMetaFacts` (полупрозрачная подпись). */
    metaDurationTitleAbove: 'Длительность',
    /** Над значением сложности в `TourDetailMetaFacts` (полупрозрачная подпись). */
    metaDifficultyTitleAbove: 'Уровень сложности',
    /** Подпись и `aria-label` для блока аудитории, если задан `Tour.metaAudienceLabel`. */
    metaAudienceTitleAbove: 'Для кого',
    metaLabelPrice: 'Стоимость',
    /** Блок цены под галереей (десктоп) или под программой (мобильные). */
    priceHighlightLead: 'Стоимость участия',
    priceHighlightNote: 'Указана на одного участника, в рублях.',
    priceHighlightAriaLabel: 'Стоимость тура',
    requestTourCta:  'Оставить заявку на тур',
    /** Подпись при наведении на CTA заявки (буквы + стрелка в `.btn-cta-tour--dual`). */
    requestTourCtaHoverWordmark: 'Вкрайности',
    /** Нижний CTA страницы тура: стиль `btn-primary`, модальное окно заявки на тур. */
    askQuestionCta: 'Уточнить про тур',
    /** Текст перед нижним CTA «Уточнить про тур». */
    askQuestionFooterLead:
      'Остались вопросы по маршруту, датам или условиям — напишите, ответим.',
    notFound:        'Тур не найден',
    notFoundWithId:  'Тур с ID «{id}» не существует.',
    homeLink:   'На главную',
    /** Полноэкранный просмотр фото: клик по затемнению вне кадра закрывает просмотр. */
    galleryPhoto: {
      openHeroAria: 'Открыть первое фото тура',
      /** Подставить `{n}` — номер фото по порядку на странице. */
      openPhotoAria: 'Открыть фото {n}',
      viewerDialogAria: 'Просмотр фотографии тура',
      viewerPrevAria: 'Предыдущее фото',
      viewerNextAria: 'Следующее фото',
      /** Подставить `{current}` и `{total}`. */
      viewerCounter: 'Фото {current} из {total}',
    },
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
