export const UI = {
  /**
   * Десять букв баннера «В другой сезон» (главная): порядок = индекс колонки 0…9.
   * См. `getHomeSeasonBannerClips` и `HomeSeasonBanner`.
   */
  homeSeasonBannerWordmark: 'Вкрайности' as const,
  hero: {
    /** Основной h1 главной страницы (SEO и скринридеры). */
    documentTitle: '',
    viewTour:      'Забронировать поездку',
    /** Интервал автосмены слайдов героя (мс). */
    autoplayIntervalMs: 7000,
    /** Кнопка «назад» карусели героя (desktop). */
    carouselPrevious: 'Предыдущий слайд',
    /** Кнопка «вперёд» карусели героя (desktop). */
    carouselNext: 'Следующий слайд',
    /**
     * Верхняя зона слайда (кроме блока с ссылкой): тот же эффект, что «вперёд».
     * Подставить `{title}` — название тура активного слайда для контекста.
     */
    carouselAdvanceImageArea: 'Следующий слайд. Сейчас: {title}',
    /** Точка пагинации: `{n}` — номер слайда (1-based). */
    carouselPaginationGoToSlide: 'Перейти к слайду {n}',
    /** Icon-only кнопка телефона в `HomeHeroContactRail`. */
    homeHeroContactPhoneAria: 'Позвонить',
  },
  breadcrumbs: {
    navLabel: 'Хлебные крошки',
    home:     'Главная',
  },
  team: {
    experienceSuffix: 'опыта',
    membersContainerId: 'team-hero-members',
    nextTeamPageLabel: 'Узнайте нас поближе',
  },
  privacyPage: {
    metaTitle:   'Политика конфиденциальности | Вкрайности',
    metaDescription:
      'Как «Вкрайности» обрабатывает персональные данные: цели, сроки хранения и ваши права по 152-ФЗ.',
    title:       'Политика конфиденциальности',
    intro:
      'Настоящая политика описывает общие принципы обработки данных при использовании сайта «Вкрайности». Актуальная юридическая редакция может быть предоставлена по запросу.',
    paragraphs: [
      'Мы собираем только те данные, которые вы добровольно передаёте при обращении через формы обратной связи, мессенджеры или по телефону (например, имя и контакт для связи).',
      'Персональные данные используются для ответа на запросы о поездках, бронировании и информирования об услугах. Мы не продаём данные третьим лицам.',
      'Технические данные (cookies, IP-адрес в обезличенном виде) могут обрабатываться для стабильной работы сайта и аналитики в объёме, предусмотренном законодательством.',
      'Для удобства навигации сайт может сохранять позицию прокрутки в sessionStorage браузера на время сессии — это необходимо для работы интерфейса и не используется для рекламы.',
      'Сервис веб-аналитики (Яндекс.Метрика) подключается только после вашего согласия в баннере cookies; без согласия счётчик не загружается.',
      'Вы можете в любой момент изменить выбор по cookies через ссылку «Настройки cookies» в подвале сайта.',
      'Вы вправе запросить уточнение или удаление своих данных, направив обращение через контакты, указанные на сайте.',
    ] as const,
    backLink: 'На главную',
  },
  nav: {
    brand: 'Вкрайности',
    links: [
      { label: 'Направления',  hash: 'tours' },
      { label: 'Календарь',    hash: 'kalendar' },
      { label: 'Безопасность', hash: 'safety' },
      { label: 'Команда',      hash: 'team' },
      { label: 'Контакты',     hash: 'contact' },
    ],
    cta: 'Выбрать поездку',
    /** Свёрнутый выбор сезона под навбаром (&lt;500px): раскрыть панель. */
    seasonDockExpand: 'Показать сезоны',
    /** Кнопка-стрелка у dock (aria-label). */
    seasonDockToggleArrow: 'Раскрыть или свернуть выбор сезона',
    /** Свёрнутая панель раскрыта: переход к списку туров активного сезона. */
    seasonDockGoToList: 'Список направлений этого сезона',
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
    /** `id` секции календаря на главной (якорь «Календарь»). */
    homeTourCalendarSectionElementId: 'kalendar' as const,
    tourCalendarTitle: 'Календарь поездок',
    tourCalendarLead:
      'Выберите дату — и посмотрите, какие выезды запланированы. Актуальное расписание по всем сезонам.',
    tours:        'Поездки по сезонам',
    toursSub:     'Четыре сезона — четыре разных приключения',
    toursTitleBySeason: {
      winter: 'Поездки зимой',
      spring: 'Поездки весной',
      summer: 'Поездки летом',
      fall:   'Поездки осенью',
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
    homeGateScrollToHeroAriaLabel: 'Перейти к обзору направлений' as const,
    teamHeadingPrefix: 'Команда ',
    teamSub:      'У кого в крови текут приключения',
    safety:       'Безопасность в наших походах',
    /** Заголовок на hero-карточке teaser #safety на главной. */
    safetyTeaserTitle: 'Безопасность в поездках',
    safetySub:    'Ваша безопасность — наш приоритет',
    /** Циклические статусы «подготовки» в teaser #safety на главной (Sims-style). */
    safetyStatusLines: [
      'Формируем маршрут',
      'Отслеживаем погоду',
      'Проверяем снаряжение',
      'Готовимся к "бездорожью"',
      'Ищем колышки от палатки',
      'Наполняем фляги водичкой',
    ] as const,
    /** Teaser на главной (#safety) и смысловой акцент; ранее — поверх hero-фото секции. */
    safetyHeroHighlight:
      'Готовим маршрут, следим за погодой и остаёмся на связи — на каждом шаге.',
    /** Alt героя секции «Безопасность» на главной. */
    safetyHeroImageAlt:
      'Инструктаж и проверка снаряжения перед выходом группы на маршрут',
    safety_cta:   'Узнать больше',
    contact:      'Связаться с нами',
  },
  contact: {
    subtitle: 'Готовы ответить на любые вопросы о наших поездках',
    phone:    'Позвонить',
    telegram: 'Написать в Telegram',
    max:      'Написать в Max',
  },
  seasons: {
    winter: { label: 'Зима',  emoji: '❄️', description: 'Байкал подо льдом, Хибины, полярное сияние' },
    spring: { label: 'Весна', emoji: '🌿', description: 'Цветение Алтая, таяние Байкала, Камчатка' },
    summer: {
      label: 'Лето',
      emoji: '☀️',
      description:
        'Тачингоуза, Краббе, Три границы, Ежовая, Сестра, релакс у моря, Неожиданный, Аскольд, Шкота, Гамова и другие маршруты Приморья',
    },
    fall:   { label: 'Осень', emoji: '🍂', description: 'Те же маршруты Приморья, что весной — в осеннем сезоне' },
  },
  cookieConsent: {
    bannerAriaLabel: 'Уведомление об использовании cookies',
    bannerMessage:
      'Мы используем cookies: необходимые — для работы сайта, аналитические — только с вашего согласия.',
    iconAlt: 'Печенье — символ cookies',
    acceptLabel: 'Принять',
    essentialOnlyLabel: 'Только необходимое',
    privacyLinkLabel: 'Подробнее',
  },
  safetyPage: {
    heroImageAlt: 'Горный пейзаж Приморья на фоне страницы правил безопасности',
    downloadPdfLabel: 'Скачать оферту и правила (PDF)',
    downloadPdfAriaLabel: 'Скачать оферту и правила безопасности в формате PDF',
  },
  footer: {
    tagline:        'Открываем дикую природу Приморья',
    legalHeading:   'Юридическая информация',
    /** Только `aria-label` списка документов в футере (без видимого заголовка). */
    documentsHeading: 'Документы',
    innLabel:       'ИНН',
    cookieSettings: 'Настройки cookies',
    rights:         '© 2025 Вкрайности. Все права защищены.',
    studioCreditPrefix: 'Создано дизайн-студией',
    studioCreditName: 'SILA',
    studioCreditLinkAriaLabel: 'SILA — дизайн-студия в Telegram',
    navHeading:     'Навигация',
    contactHeading: 'Контакты',
  },
  modal: {
    close: 'Закрыть',
    /** Пока подгружается ленивый чанк модалки (`Layout` + `Suspense`): `aria-label` полноэкранного плейсхолдера. */
    lazyChunkLoadingLabel: 'Загрузка окна',
  },
  tourRequestModal: {
    title: 'Заявка на поездку',
    dateStepTitle: 'Выберите дату выезда',
    dateStepHint: 'Нажмите на день с выездом в календаре',
    departureDateLabel: 'Дата выезда',
    changeDepartureDate: 'Изменить дату',
    selectedDepartureLive: (formatted: string) => `Выбрана дата выезда: ${formatted}`,
    nameLabel: 'Имя',
    nameHint: 'Как к вам обращаться?',
    emailLabel: 'Email',
    emailHint: 'Необязательно',
    phoneLabel: 'Телефон',
    /** Плейсхолдер-маска без привязки к коду страны. */
    phonePlaceholder: '+7 (___) ___-__-__',
    partySizeLabel: 'Количество человек',
    withChildrenLabel: 'С детьми',
    tourLabel: 'Выбранная поездка',
    questionLabel: 'Ваш вопрос',
    questionHint: 'С каким вопросом мы можем вам помочь?',
    messengerLabel: 'В каком мессенджере вам удобнее общаться?',
    messengerWhatsappAria: 'WhatsApp',
    messengerTelegramAria: 'Telegram',
    messengerMaxAria: 'MAX',
    privacyPrefix: 'Я ознакомлен(а) с ',
    privacyPolicyLink: 'политикой обработки персональных данных',
    privacyMiddle: ' и даю ',
    privacyConsentLink: 'согласие на обработку персональных данных',
    privacySuffix: '',
    submit: 'Отправить заявку',
    sending: 'Отправка…',
    success: 'Заявка отправлена. Мы свяжемся с вами.',
    submitError: 'Не получилось отправить заявку. Попробуйте ещё раз или напишите нам в Telegram.',
    errors: {
      departureDateRequired: 'Выберите дату выезда',
      nameRequired: 'Укажите имя',
      emailInvalid: 'Некорректный email',
      phoneRequired: 'Укажите телефон',
      partySizeRequired: 'Укажите количество человек',
      partySizeInvalid: 'Укажите число от 1 до 99',
      questionRequired: 'Напишите вопрос',
      questionTooLong: 'Вопрос слишком длинный (максимум 1200 символов)',
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
    /** Нестандартные подписи сложности (не совпадают с `labels`). Сборка диапазонов — `formatDifficultyRangeLabel`. */
    customLabels: {
      easyHiking: 'Лёгкий хайкинг',
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
    /**
     * Разделитель в подписи диапазона на чипе (как «Лёгкий / Средний» у Аскольда).
     * Диапазоны собирать через `formatDifficultyRangeLabel` в `src/utils/tourDifficultyLabel.ts`.
     */
    metaAudienceDifficultyRangeSeparator: ' / ',
    /** Карточка тура на главной (сезон «зима»): основная строка цены; ниже — зачёркнутая ранее указанная сумма. */
    winterPriceLead: 'Уточняйте стоимость',
    /** Значение `Tour.price`, когда вместо суммы — заглушка; на карточке не дублируем её в зачёркнутой строке. */
    winterPricePlaceholderNoListing: 'БЕЗ ЦЕНЫ',
    /** Карточка в гриде главной: раскрыть полный список туров активного сезона. */
    showMoreCta: 'Показать все направления',
    /** Карточка в гриде главной: вернуть сокращённый список туров (3 карточки). */
    showLessCta: 'Свернуть направления',
    /** Alt префикс фона кнопки «Показать все / Свернуть туры» на главной. */
    nextSeasonCloneImageAltPrefix: 'Постер сезона',
    /** Доступная подпись для скелетной сетки туров при lazy-загрузке маршрута. */
    loadingLabel: 'Загрузка направлений',
  },
  tourDetail: {
    about:      'О поездке',
    gallery:    'Наши Подвиги',
    programHeading: 'Программа поездки',
    programTimeDisclaimer:
      '*Время указано примерно и может меняться из-за погодных или иных условий',
    includedHeading: 'Что включено в стоимость участия',
    tourMetaFactsAriaLabel: 'Срок и сведения о поездке',
    metaLabelDuration: 'Срок',
    metaLabelDifficulty: 'Сложность',
    /** Над значением длительности в `TourDetailMetaFacts` (полупрозрачная подпись). */
    metaDurationTitleAbove: 'Длительность',
    /** Каталог Туры_* кол. D → блок «Длительность» и карточка тура. */
    durationDisplayOneDay: '1 день',
    durationDisplayMultiDay: '2 дня',
    /** Над значением сложности в `TourDetailMetaFacts` (полупрозрачная подпись). */
    metaDifficultyTitleAbove: 'Уровень сложности',
    /** Подпись и `aria-label` для блока аудитории, если задан `Tour.metaAudienceLabel`. */
    metaAudienceTitleAbove: 'Для кого',
    metaLabelPrice: 'Стоимость',
    /** Блок цены под галереей (десктоп) или под программой (мобильные). */
    priceHighlightLead: 'Стоимость участия',
    priceHighlightNote: 'Указана на одного участника, в рублях.',
    priceHighlightAriaLabel: 'Стоимость участия',
    departuresHeading: 'Даты выездов',
    departuresEmpty:
      'Следите за обновлениями, чтобы не упустить анонс этой поездки!',
    departuresLoadingAria: 'Загрузка дат выездов',
    inDevelopmentHeading: 'Поездка в разработке',
    programInDevelopment: 'В разработке',
    inDevelopmentPageAriaLabel: 'Поездка в разработке',
    requestTourCta:  'Оставить заявку на поездку',
    /** Нижний CTA страницы тура: `.btn-tour-detail-footer-cta`, модальное окно заявки на тур. */
    askQuestionCta: 'Уточнить про поездку',
    /** Текст перед нижним CTA «Уточнить про тур». */
    askQuestionFooterLead:
      'Остались вопросы по маршруту, датам или условиям — напишите, ответим.',
    backToToursCta: 'Ещё поездки',
    notFound:        'Поездка не найдена',
    notFoundWithId:  'Поездка с ID «{id}» не существует.',
    homeLink:   'На главную',
    loadingPublicationCatalog: 'Загрузка каталога поездок…',
    scheduleLoadError:
      'Не удалось загрузить каталог поездок. Проверьте подключение или повторите попытку.',
  },
  errorFallback: {
    title:       'Что-то пошло не так',
    message:     'Произошла ошибка. Попробуйте обновить страницу.',
    retryButton: 'Обновить страницу',
  },
  tourDepartureCalendar: {
    calendarAriaLabel: 'Календарь дат выездов поездки',
    emptyMonth: 'В этом месяце выездов нет',
    prevMonthAria: 'Предыдущий месяц с выездами',
    nextMonthAria: 'Следующий месяц с выездами',
    nextMonthDisabledTooltip: 'Других месяцев с выездами нет',
    departureDayAria: (formattedDate: string) => `Выезд: ${formattedDate}`,
    nonDepartureDayAria: (formattedDate: string) => `${formattedDate}, выезда нет`,
  },
  tourCalendar: {
    selectDateHint: 'Выберите дату в календаре',
    emptyDay: 'В этот день выездов нет',
    emptyMonth: 'В этом месяце выездов пока нет',
    emptyAll: 'Расписание скоро появится',
    prevMonthAria: 'Предыдущий месяц',
    nextMonthAria: 'Следующий месяц',
    nextMonthDisabledTooltip: 'Расписание на этот месяц ещё не опубликовано',
    retryLoad: 'Повторить',
    loadingAria: 'Загрузка расписания',
    dayPanelAriaLabel: 'Поездки на выбранную дату',
    status: {
      open: 'Набор открыт',
      planned: 'Скоро',
      full: 'Мест нет',
      completed: 'Завершился',
    },
    dayAriaLabel: (formattedDate: string, count: number) => {
      const mod10 = count % 10;
      const mod100 = count % 100;
      const word =
        mod10 === 1 && mod100 !== 11
          ? 'выезд'
          : mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)
            ? 'выезда'
            : 'выездов';
      return `${formattedDate}, ${count} ${word}`;
    },
  },
  notFoundPage: {
    metaTitle:   'Страница не найдена | Вкрайности',
    heading:     'Страница не найдена',
    description: 'Такой страницы нет. Возможно, ссылка устарела или вы перешли по неверному адресу.',
    homeLink:    'На главную',
  },
} as const;

/** Полный заголовок секции команды для aria и скринридеров. */
export const getTeamSectionHeading = () =>
  `${UI.sections.teamHeadingPrefix}${UI.nav.brand}`;
