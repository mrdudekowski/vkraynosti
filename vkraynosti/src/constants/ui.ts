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
    winter: { label: 'Зима',  emoji: '❄️', color: 'season-winter' },
    spring: { label: 'Весна', emoji: '🌿', color: 'season-spring' },
    summer: { label: 'Лето',  emoji: '☀️', color: 'season-summer' },
    fall:   { label: 'Осень', emoji: '🍂', color: 'season-fall' },
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
