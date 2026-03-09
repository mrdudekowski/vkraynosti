export const UI = {
  nav: {
    brand: 'Вкрайности',
    links: [
      { label: 'Туры',         href: '#tours' },
      { label: 'Команда',      href: '#team' },
      { label: 'Безопасность', href: '#safety' },
      { label: 'Контакты',     href: '#contact' },
    ],
    cta: 'Выбрать тур',
  },
  hero: {
    cta:      'Выбрать тур',
    subtitle: 'Откройте дикую природу России',
  },
  sections: {
    tours:      'Выберите сезон',
    toursSub:   'Четыре сезона — четыре разных приключения',
    team:       'Команда Вкрайности',
    teamSub:    'Опытные гиды и эксперты',
    safety:     'Безопасность в наших походах',
    safetySub:  'Ваша безопасность — наш приоритет',
    safety_cta: 'Подробнее о безопасности',
    contact:    'Связаться с нами',
  },
  contact: {
    phone:    'Позвонить',
    telegram: 'Написать в Telegram',
    max:      'Написать в Max',
    consult:  'Консультация по турам',
  },
  seasons: {
    winter: { label: 'Зима',  emoji: '❄️', color: 'season-winter', description: 'Байкал подо льдом, Хибины, полярное сияние' },
    spring: { label: 'Весна', emoji: '🌿', color: 'season-spring', description: 'Цветение Алтая, таяние Байкала, Камчатка' },
    summer: { label: 'Лето',  emoji: '☀️', color: 'season-summer', description: 'Вулканы, тропы, сплавы и белые ночи' },
    fall:   { label: 'Осень', emoji: '🍂', color: 'season-fall',   description: 'Золотой Алтай, карельский лес, горные сёла' },
  },
  footer: {
    tagline:  'Открываем дикую природу России',
    privacy:  'Политика конфиденциальности',
    rights:   '© 2025 Вкрайности. Все права защищены.',
  },
  modal: {
    consultTitle: 'Консультация по турам',
    consultSub:   'Выберите интересующий вас тур',
    close:        'Закрыть',
    selectSeason: 'Выберите сезон',
  },
} as const;
