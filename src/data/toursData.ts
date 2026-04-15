import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faBed } from '@fortawesome/free-solid-svg-icons/faBed';
import { faBinoculars } from '@fortawesome/free-solid-svg-icons/faBinoculars';
import { faBookOpen } from '@fortawesome/free-solid-svg-icons/faBookOpen';
import { faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons/faChalkboardTeacher';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { faDog } from '@fortawesome/free-solid-svg-icons/faDog';
import { faHelmetSafety } from '@fortawesome/free-solid-svg-icons/faHelmetSafety';
import { faHotTubPerson } from '@fortawesome/free-solid-svg-icons/faHotTubPerson';
import { faMugHot } from '@fortawesome/free-solid-svg-icons/faMugHot';
import { faMugSaucer } from '@fortawesome/free-solid-svg-icons/faMugSaucer';
import { faPersonHiking } from '@fortawesome/free-solid-svg-icons/faPersonHiking';
import { faPlane } from '@fortawesome/free-solid-svg-icons/faPlane';
import { faShuttleVan } from '@fortawesome/free-solid-svg-icons/faShuttleVan';
import { faSocks } from '@fortawesome/free-solid-svg-icons/faSocks';
import { faSnowboarding } from '@fortawesome/free-solid-svg-icons/faSnowboarding';
import { faTicket } from '@fortawesome/free-solid-svg-icons/faTicket';
import { faTruck } from '@fortawesome/free-solid-svg-icons/faTruck';
import { faUtensils } from '@fortawesome/free-solid-svg-icons/faUtensils';
import { faWind } from '@fortawesome/free-solid-svg-icons/faWind';
import { faHeart } from '@fortawesome/free-solid-svg-icons/faHeart';
import { faPaw } from '@fortawesome/free-solid-svg-icons/faPaw';
import { faUserTie } from '@fortawesome/free-solid-svg-icons/faUserTie';
import type { Tour, TourIncludedItem } from '../types';
import {
  IMAGES,
  SPRING_TOUR_COVERS,
  TOUR_WINTER_1_COVER,
  TOUR_WINTER_1_GALLERY_GRID,
  TOUR_WINTER_1_GALLERY_VIEWER,
  TOUR_WINTER_2_COVER,
  TOUR_WINTER_2_GALLERY_GRID,
  TOUR_WINTER_2_GALLERY_VIEWER,
  TOUR_WINTER_3_COVER,
  TOUR_WINTER_3_GALLERY_GRID,
  TOUR_WINTER_3_GALLERY_VIEWER,
  TOUR_WINTER_3_PREFACE_BACKGROUND,
  TOUR_WINTER_4_COVER,
  TOUR_WINTER_4_GALLERY_GRID,
  TOUR_WINTER_4_GALLERY_VIEWER,
  TOUR_WINTER_5_COVER,
  TOUR_WINTER_5_GALLERY_GRID,
  TOUR_WINTER_5_GALLERY_VIEWER,
  TOUR_SPRING_1_COVER,
  TOUR_SPRING_1_GALLERY_GRID,
  TOUR_SPRING_1_GALLERY_VIEWER,
  TOUR_SPRING_2_COVER,
  TOUR_SPRING_2_GALLERY_GRID,
  TOUR_SPRING_2_GALLERY_VIEWER,
  TOUR_SPRING_3_COVER,
  TOUR_SPRING_3_GALLERY_GRID,
  TOUR_SPRING_3_GALLERY_VIEWER,
} from '../constants/images';
import { UI } from '../constants/ui';

const inc = (text: string, icon: IconDefinition = faCheck): TourIncludedItem => ({
  text,
  icon,
});

export const TOURS: Tour[] = [
  // WINTER — 5 tours
  {
    id: 'winter-1',
    season: 'winter',
    title: 'Восхождение на Изюбриную',
    subtitle: 'Снежные покровы в тайге Сихоте-Алиня',
    heroPhrase: 'Сказочные заснеженные ели Изюбриной',
    duration: '16 часов',
    difficulty: 'Medium',
    price: '6 000 ₽',
    descriptionLeadBold: 'Гора Изюбриная (1433 м)',
    description:
      ' — живописная вершина в Чугуевском районе Приморского края на пересечении хребтов Белки и Лугового. «Самая снежная» вершина известна своими сказочными заснеженными елями и является местом притяжения зимнего туризма. Входит в список «Лунного медведя».',
    program: [
      { timeLabel: '04:30', description: 'Выезд из Владивостока навстречу приключениям!' },
      { timeLabel: '10:00', description: 'Прибытие к подножию самой зимней горы Приморья' },
      { timeLabel: '10:00–13:30', description: 'Бодрое восхождение' },
      { timeLabel: '13:30–14:00', description: 'Отдых на вершине, фото- и видео-фиксация нашего успеха!' },
      {
        timeLabel: '14:00–15:30',
        description:
          'Приятный спуск на своих двоих или экстремальный на ледянках или сноубордах.',
      },
      {
        timeLabel: '15:30–17:00',
        description: 'Горячий обед на костре и согревающий глинтвейн у подножья',
      },
      { timeLabel: '17:00–00:00', description: 'Возвращение в город' },
    ],
    includedInPrice: [
      inc('Трансфер от точки сбора и обратно во Владивосток', faShuttleVan),
      inc('Горячее питание и согревающий глинтвейн', faMugHot),
      inc('Ледоступы/кошки (при необходимости)', faPersonHiking),
      inc('Гид проводник и захватывающие истории о крае и местности.', faUserTie),
      inc('Ледянки/хобы для весёлой прокатки', faSnowboarding),
    ],
    imageUrl: TOUR_WINTER_1_COVER,
    galleryImages: [...TOUR_WINTER_1_GALLERY_VIEWER],
    galleryGridUrls: [...TOUR_WINTER_1_GALLERY_GRID],
  },
  {
    id: 'winter-2',
    season: 'winter',
    title: 'Восхождение на г. Голец',
    subtitle: 'Настоящее путешествие в зимнюю сказку!',
    heroPhrase: 'Белоснежная сказка Сихотэ-Алиньского хребта',
    duration: '16,5 часов',
    difficulty: 'Medium',
    price: '6 500 ₽',
    descriptionLeadBold: 'Гора Голец (1604 м)',
    description:
      ' — входит в десятку Приморского Барса. Путь к ней восхищает своей заснеженной сказочностью, где за каждым поворотом открываются новые красоты. Это путешествие для тех, кто ищет не просто прогулку, а настоящее зимнее приключение, где можно почувствовать себя покорителем вершины, с которой вам откроется восхитительный вид на высочайшие горы края!',
    program: [
      { timeLabel: '04:00', description: 'Выезд из Владивостока' },
      { timeLabel: '10:30', description: 'Прибытие к подножию' },
      {
        timeLabel: '11:00–14:30',
        description:
          'В приятном темпе совершаем восхождение, по пути обязательно много фотографируемся и созерцаем красоту!',
      },
      {
        timeLabel: '14:30–15:30',
        description: 'Отдых на вершине, фото-, видео-фиксация нашего успеха!',
      },
      {
        timeLabel: '15:30–16:30',
        description: 'Весёлый спуск с горы на ледянках',
      },
      {
        timeLabel: '16:30–17:30',
        description: 'Горячий перекус и согревающий глинтвейн у подножья',
      },
      { timeLabel: '17:30–22:30', description: 'Возвращение во Владивосток' },
    ],
    includedInPrice: [
      inc('Трансфер от точки сбора и обратно во Владивосток', faShuttleVan),
      inc('Горячее питание и согревающий глинтвейн', faMugHot),
      inc('Ледоступы/кошки (при необходимости)', faPersonHiking),
      inc('Гамаши, чтобы ноги оставались в тепле (при необходимости)', faSocks),
      inc('Ледянки/хобы для весёлой прокатки', faSnowboarding),
      inc('Гид-проводник и захватывающие истории о крае и местности', faUserTie),
    ],
    imageUrl: TOUR_WINTER_2_COVER,
    galleryImages: [...TOUR_WINTER_2_GALLERY_VIEWER],
    galleryGridUrls: [...TOUR_WINTER_2_GALLERY_GRID],
  },
  {
    id: 'winter-3',
    season: 'winter',
    title: 'Горнолыжный уикенд: Фалаза х Грибановка',
    subtitle:
      '2 снежных дня у подножья Фалазы. Для новичков и опытных райдеров',
    heroPhrase: 'Фалаза призывает влюблённых в горы',
    duration: '2 дня',
    difficulty: 'Medium',
    price: '10 000 ₽',
    descriptionLeadBold: '2 дня чистого горного вайба',
    description:
      ' — у подножья Фалазы! Посетим самую известную вершину Приморского края и раскатаемся на горнолыжной базе у её подножья! Выезд для искателей приключений, горнолыжников, сноубордистов и всех, кто любит горы!',
    program: [
      {
        timeLabel: 'День 1 · 8:00',
        description: 'Выезд из г. Владивостока навстречу приключениям',
      },
      {
        timeLabel: 'День 1 · 10:30',
        description: 'Прибытие к подножью Фалазы, подготовка к восхождению',
      },
      {
        timeLabel: 'День 1 · 11:00–15:00',
        description: 'Восхождение на вершину',
      },
      {
        timeLabel: 'День 1 · 15:00',
        description:
          'На вершине: перекус из своих продуктов, фото-, видео-фиксация нашего успеха',
      },
      {
        timeLabel: 'День 1 · 15:30–17:30',
        description: 'Спуск к горнолыжной базе, заселение в комфортабельные номера',
      },
      { timeLabel: 'День 1 · 18:30', description: 'Ужин в общем зале' },
      {
        timeLabel: 'День 1 · 19:00',
        description:
          'Релакс-вечер в чане: общение, музыка, настолки, отдых',
      },
      {
        timeLabel: 'День 2 · 9:30',
        description: 'Завтрак и сборы / выселение',
      },
      {
        timeLabel: 'День 2 · 11:00–13:00',
        description: 'Занятие по сноуборду с инструктором',
      },
      {
        timeLabel: 'День 2 · 11:00–17:00',
        description: 'Катание / прогулки по территории базы и окрестностям',
      },
      {
        timeLabel: 'День 2 · 17:30–20:00',
        description: 'Возвращение во Владивосток',
      },
    ],
    includedInPrice: [
      inc('Трансфер от точки сбора и обратно во Владивосток', faShuttleVan),
      inc(
        'Ледянки, ледоступы, гамаши для восхождения и весёлого спуска (при необходимости)',
        faPersonHiking
      ),
      inc('Проживание у самого склона в комфортабельных номерах (1 ночь)', faBed),
      inc('Питание: сытный ужин и завтрак', faMugHot),
      inc('Сопровождение гида-проводника на вершину', faUserTie),
      inc('Горячий чан на весь вечер', faHotTubPerson),
      inc('2 часа группового занятия с сертифицированным инструктором', faChalkboardTeacher),
      inc('Помощь в подборе и аренде снаряжения для новичков', faHelmetSafety),
    ],
    imageUrl: TOUR_WINTER_3_COVER,
    galleryImages: [...TOUR_WINTER_3_GALLERY_VIEWER],
    galleryGridUrls: [...TOUR_WINTER_3_GALLERY_GRID],
    prefaceBackgroundImageUrl: TOUR_WINTER_3_PREFACE_BACKGROUND,
  },
  {
    id: 'winter-4',
    season: 'winter',
    title: 'Хаски-тур',
    subtitle:
      'Знакомство с дружелюбными хаски и историей Приморского края — и всё это в один день!',
    heroPhrase: 'В собачьих упряжках по зимнему лесу',
    duration: '12,5 ч (день целиком), активная часть — 6,5 ч',
    difficulty: 'Easy',
    price: UI.tourCard.winterPriceLead,
    pricePrevious: '6 500 ₽',
    priceFootnote: 'Актуальную стоимость сообщим по запросу.',
    description:
      'Почувствуете настоящий драйв, управляя собачьей упряжкой, ощутите всё величие скальных комплексов Приморского края, а также погрузитесь в историю и недра Екатериновских пещер — и всё это за один день!',
    program: [
      { timeLabel: '7:00', description: 'Выезд из г. Владивосток' },
      { timeLabel: '9:00', description: 'Остановка в кафе «Ущелье Дарданеллы»' },
      {
        timeLabel: '10:00–12:30',
        description:
          'Прибытие к пушистикам: катание на собачьих упряжках, а также возможность пообщаться и поиграть с животными',
      },
      { timeLabel: '12:30–13:00', description: 'Горячий обед' },
      { timeLabel: '13:00', description: 'Выезд в сторону Екатериновки' },
      {
        timeLabel: '14:00–16:30',
        description:
          'Прибытие на скалу Пржевальского: прогулка по окрестностям, посещение пещер (с учётом уровня подготовки туристов и погодных условий), фотосессия с гигантскими сосульками (при наличии), посещение смотровой площадки с панорамными видами',
      },
      { timeLabel: '16:30', description: 'Отправление в город' },
      { timeLabel: '19:30', description: 'Прибытие в г. Владивосток' },
    ],
    includedInPrice: [
      inc('Трансфер от точки сбора и обратно во Владивосток', faShuttleVan),
      inc('Горячее питание', faMugHot),
      inc('Катание в собачьих упряжках', faDog),
      inc('Гид-проводник и захватывающие истории о крае и местности', faUserTie),
    ],
    imageUrl: TOUR_WINTER_4_COVER,
    galleryImages: [...TOUR_WINTER_4_GALLERY_VIEWER],
    galleryGridUrls: [...TOUR_WINTER_4_GALLERY_GRID],
  },
  {
    id: 'winter-5',
    season: 'winter',
    title: 'Горнолыжный уикенд: АрсГора',
    subtitle: '2 дня снежного склона на обновлённых трассах Арсеньева',
    heroPhrase: 'Арсгора ждёт приморских райдеров',
    duration: '2 дня',
    difficulty: 'Medium',
    metaAudienceLabel: 'Для новичков и опытных райдеров',
    price: UI.tourCard.winterPricePlaceholderNoListing,
    pricePrevious: '13 000 ₽',
    priceFootnote: 'Актуальную стоимость сообщим по запросу.',
    descriptionLeadBold: '2 дня чистого горного вайба на АрсГоре!',
    description:
      ' — приглашаем провести уикенд в нашей тёплой компании! Тур как для опытных райдеров, так и для новичков. Будем кататься, общаться и расслабляться!',
    program: [
      {
        timeLabel: 'День 1 · 6:30',
        description: 'Выезд из г. Владивосток',
      },
      {
        timeLabel: 'День 1 · 10:00',
        description: 'Прибытие в г. Арсеньев',
      },
      {
        timeLabel: 'День 1 · 10:00–11:00',
        description:
          'Покупка ски-пассов, аренда оборудования, экипировка',
      },
      {
        timeLabel: 'День 1 · 11:00–17:00',
        description:
          'Время на склоне: лыжи, сноуборд, прогулки; 2 часа группового занятия с сертифицированным инструктором по сноуборду или лыжам',
      },
      {
        timeLabel: 'День 1 · 17:30–18:00',
        description: 'Заселение в общий дом, свободное время',
      },
      { timeLabel: 'День 1 · 18:00', description: 'Ужин-барбекю' },
      {
        timeLabel: 'День 1 · 19:00',
        description:
          'Баня и парение (по желанию), общение, музыка, настолки, отдых',
      },
      { timeLabel: 'День 2 · 8:30', description: 'Завтрак' },
      { timeLabel: 'День 2 · 9:50', description: 'Выезд на склон' },
      {
        timeLabel: 'День 2 · 10:00–17:00',
        description:
          'Время на склоне: лыжи, сноуборд, прогулки; 2 часа группового занятия с сертифицированным инструктором по сноуборду или лыжам',
      },
      {
        timeLabel: 'День 2 · 17:30',
        description: 'Сдача оборудования, ски-пассов, выезд в город',
      },
      {
        timeLabel: 'День 2 · 22:00',
        description:
          'Прибытие в г. Владивосток, сдача оборудования (при необходимости)',
      },
    ],
    programAdditionalNotes: [
      'В программу включены ужин первого дня и завтрак второго дня; перекусы возьмите с собой или приобретите в местном кафе на средней станции.',
    ],
    includedInPrice: [
      inc('Трансфер от точки сбора и обратно во Владивосток', faShuttleVan),
      inc(
        'Проживание у самого склона в большом доме с огороженной территорией (1 ночь)',
        faBed
      ),
      inc('Питание: сытный ужин-барбекю и завтрак', faMugHot),
      inc('Баня и парение на весь вечер 1-го дня', faHotTubPerson),
      inc(
        '2 часа группового занятия с сертифицированным инструктором',
        faChalkboardTeacher
      ),
      inc(
        'Помощь в подборе и аренде снаряжения для новичков',
        faHelmetSafety
      ),
    ],
    imageUrl: TOUR_WINTER_5_COVER,
    galleryImages: [...TOUR_WINTER_5_GALLERY_VIEWER],
    galleryGridUrls: [...TOUR_WINTER_5_GALLERY_GRID],
  },

  // SPRING — 7 tours
  {
    id: 'spring-1',
    season: 'spring',
    title: 'Восхождение на Лысого Деда',
    subtitle: 'Самый восточный «тысячник» с трагической историей',
    heroPhrase: 'Каменный гребень Деда хранит истории давних трагедий',
    duration: '14–16 часов',
    difficulty: 'Medium',
    price: 'от 6 000 ₽',
    descriptionLeadBold: 'Гора Лысый Дед (1120 м)',
    description:
      ' — самый восточный «тысячник» Ливадийского хребта в Шкотовском районе Приморья. Известна тремя авиакатастрофами 1950-х годов, обломки самолётов до сих пор лежат на склонах. С вершины открывается панорама на Фокинское водохранилище, морское побережье и соседние хребты. Входит в список для получения почётного знака «Лунный медведь».',
    program: [
      { timeLabel: '06:00', description: 'Выезд из Владивостока' },
      { timeLabel: '09:00', description: 'Прибытие в село Моленый Мыс, инструктаж' },
      {
        timeLabel: '09:30–12:30',
        description:
          'Подход к подножию (около 6 км по лесной дороге) и восхождение',
      },
      {
        timeLabel: '12:30–13:30',
        description:
          'Отдых на вершине, обед с панорамным видом, фото- и видеофиксация нашего успеха! Осмотр обломков самолётов',
      },
      { timeLabel: '13:30–17:00', description: 'Спуск' },
      { timeLabel: '17:00–18:00', description: 'Горячий ужин' },
      { timeLabel: '18:00–21:00', description: 'Возвращение в город' },
    ],
    includedInPrice: [
      inc('Трансфер Владивосток — Моленый Мыс — Владивосток', faShuttleVan),
      inc('Горячее питание после спуска', faMugHot),
      inc('Гид-проводник', faUserTie),
      inc(
        'Интересные истории о разбившихся самолётах, лётчиках и мистике Лысого Деда',
        faPlane
      ),
      inc('Наше тепло и забота — это входит в каждый тур', faHeart),
    ],
    imageUrl: TOUR_SPRING_1_COVER,
    galleryImages: [...TOUR_SPRING_1_GALLERY_VIEWER],
    galleryGridUrls: [...TOUR_SPRING_1_GALLERY_GRID],
  },
  {
    id: 'spring-2',
    season: 'spring',
    title: 'Восхождение на Ольховую',
    subtitle: 'Высочайшая вершина с горными озёрами',
    heroPhrase: 'Высокогорные озёра и панорамы Сихотэ-Алиня',
    duration: '16–18 часов',
    difficulty: 'Hard',
    price: 'от 7 000 ₽',
    descriptionLeadBold: 'Гора Ольховая (1669 м)',
    description:
      ' — одна из высочайших вершин Приморья, расположена в Партизанском районе, входит в Алексеевский хребет. Уникальна наличием двух высокогорных озёр на высоте 1600 м. В Большом Алексеевском озере обитают краснокнижные тритоны. Популярна для круглогодичных восхождений, особенно красива осенью, когда склоны покрывает ковёр из брусники. Входит в список для получения почётного знака «Приморский барс».',
    program: [
      {
        timeLabel: 'Ранний выезд',
        description: 'Выезд из Владивостока, трансфер в Партизанский район.',
      },
      {
        timeLabel: 'День в горах',
        description:
          'Восхождение на гору Ольховую (1669 м): маршрут к двум высокогорным озёрам, панорамы Сихотэ-Алиня.',
      },
      {
        timeLabel: 'Вечер',
        description: 'Спуск и возвращение во Владивосток (итоговое время зависит от темпа группы и погоды).',
      },
    ],
    includedInPrice: [
      inc('Трансфер от точки сбора и обратно во Владивосток', faShuttleVan),
      inc('Горячее питание по программе дня', faMugHot),
      inc('Гид-проводник', faUserTie),
      inc('Сопровождение на маршруте восхождения', faPersonHiking),
    ],
    imageUrl: TOUR_SPRING_2_COVER,
    galleryImages: [...TOUR_SPRING_2_GALLERY_VIEWER],
    galleryGridUrls: [...TOUR_SPRING_2_GALLERY_GRID],
  },
  {
    id: 'spring-3',
    season: 'spring',
    title: 'Восхождение на Пидан (Высокую)',
    subtitle: 'Главная мистическая вершина Приморья',
    heroPhrase: 'Зелёная тайга, древние дольмены и бескрайнее море вдали',
    duration: '15 часов',
    difficulty: 'Medium',
    price: '6 000 ₽',
    descriptionLeadBold: 'Гора Пидан (Высокая, 1332 м)',
    description:
      ' — главная мистическая вершина Южного Приморья, часть Ливадийского хребта. Известна древними дольменами, каменными россыпями-курумниками и мощной энергетикой, привлекающей туристов со всего Дальнего Востока. Летом гора особенно хороша: зелёная тайга, цветущий рододендрон на склонах, прозрачный воздух и панорама до Японского моря с вершины. Входит в список «Приморского барса».',
    program: [
      { timeLabel: '5:00', description: 'Выезд' },
      {
        timeLabel: '07:00',
        description:
          'Прибытие в село Лукьяновка, пересадка на ГАЗ-66 (доставка прямо к подножию, бережём ваши силы)',
      },
      {
        timeLabel: '10:00',
        description: 'Прибытие к подножию: перекус, сбор, инструктаж',
      },
      { timeLabel: '10:30–14:30', description: 'Восхождение' },
      { timeLabel: '14:30–15:30', description: 'Пикник и фото-сессия' },
      { timeLabel: '18:00', description: 'Возвращение к машине, ужин' },
      { timeLabel: '21:00', description: 'Прибытие в город' },
    ],
    includedInPrice: [
      inc('Трансфер Владивосток — Лукьяновка — Владивосток', faShuttleVan),
      inc('Горячее питание и прохладительные напитки после спуска', faMugHot),
      inc(
        'Гид-проводник и захватывающие истории о дольменах, шаманах и «летающем человеке»',
        faUserTie
      ),
      inc('Проезд на подготовленном транспорте к подножию и обратно', faTruck),
    ],
    imageUrl: TOUR_SPRING_3_COVER,
    galleryImages: [...TOUR_SPRING_3_GALLERY_VIEWER],
    galleryGridUrls: [...TOUR_SPRING_3_GALLERY_GRID],
  },
  {
    id: 'spring-4',
    season: 'spring',
    title: 'Восхождение на гору Сестра',
    subtitle: 'Скальные «Зубы Дракона» и панорамы южного Сихотэ-Алиня',
    heroPhrase: 'Вершина хребта Зубы Дракона и панорамы Уссури',
    duration: '18–20 часов',
    difficulty: 'Hard',
    price: 'от 9 000 ₽',
    descriptionLeadBold: 'Гора Сестра (1671 м)',
    description:
      ' — одна из высочайших вершин южного Сихотэ-Алиня, расположена на границе Лазовского и Чугуевского районов, в национальном парке «Зов тигра». Венчает хребет «Зубы Дракона», знаменитый скальными останцами причудливой формы. Рядом находится гора-спутник Камень Брат (1402 м). С вершины открываются панорамы на долины рек Уссури и Милоградовки, а также на соседние вершины — Снежную, Облачную и Пидан. Входит в список для получения почётного знака «Приморский барс».',
    program: [
      {
        timeLabel: '02:30',
        description: 'Выезд из Владивостока навстречу приключениям!',
      },
      { timeLabel: '07:30', description: 'Прибытие в село Лазо, перекус' },
      {
        timeLabel: '08:30',
        description:
          'Прибытие к урочищу Пасека Ощепкова (граница нацпарка «Зов тигра»), инструктаж, оформление разрешений',
      },
      {
        timeLabel: '09:00–15:00',
        description:
          'Восхождение (5–6 часов) через тайгу к каменным останцам и на вершину',
      },
      {
        timeLabel: '15:00–16:00',
        description:
          'Отдых на вершине, обед с панорамным видом, фото- и видеофиксация нашего успеха!',
      },
      { timeLabel: '16:00–19:30', description: 'Спуск' },
      { timeLabel: '19:30–20:30', description: 'Горячий ужин у подножия' },
      { timeLabel: '20:30–01:00', description: 'Возвращение в город' },
    ],
    includedInPrice: [
      inc('Трансфер Владивосток — Лазо — Владивосток', faShuttleVan),
      inc('Горячее питание (ужин после спуска)', faMugHot),
      inc('Гид-проводник', faUserTie),
      inc('Разрешение на посещение национального парка «Зов тигра»', faTicket),
      inc(
        'Интересные истории о горе, каменных изваяниях и древних легендах',
        faBookOpen
      ),
    ],
    imageUrl: SPRING_TOUR_COVERS['spring-4'],
    galleryImages: [
      SPRING_TOUR_COVERS['spring-4'],
      SPRING_TOUR_COVERS['spring-4'],
      SPRING_TOUR_COVERS['spring-4'],
    ],
  },
  {
    id: 'spring-5',
    season: 'spring',
    title: 'Восхождение на Читинзу (Скалистую)',
    subtitle: 'Вершина контрастов, скальных изваяний и таинственного свиста',
    heroPhrase: 'Луга и каменные останцы перед Золотой Долиной',
    duration: '14–16 часов',
    difficulty: 'Hard',
    price: 'от 6 000 ₽',
    descriptionLeadBold: 'Гора Читинза (Скалистая, 1239 м)',
    description:
      ' — одна из самых популярных вершин Приморья, расположена в Партизанском районе. Уникальна природными контрастами: от глухой тайги до альпийских лугов, от берёзовых рощ до хвойных лесов. На склонах находится водопад Берендей (10 метров) и множество живописных ручьёв. С вершины открывается вид на Золотую долину, хребет Чандолаз, залив Восток и Ливадийский хребет. Входит в список для получения почётного знака «Приморский барс».',
    program: [
      {
        timeLabel: '04:00',
        description: 'Выезд из Владивостока навстречу приключениям!',
      },
      {
        timeLabel: '07:30',
        description:
          'Прибытие к селу Тигровое или станции Красноармейская (в зависимости от маршрута)',
      },
      {
        timeLabel: '08:00–12:30',
        description:
          'Восхождение (4–5 часов) через тайгу с ручьями, водопадами и сменой растительных поясов',
      },
      {
        timeLabel: '12:30–13:30',
        description:
          'Отдых на вершине, обед с панорамным видом, фото- и видеофиксация нашего успеха!',
      },
      { timeLabel: '13:30–17:00', description: 'Спуск' },
      {
        timeLabel: '17:00–18:00',
        description: 'Горячий обед на костре и согревающий чай у подножия',
      },
      { timeLabel: '18:00–22:00', description: 'Возвращение в город' },
    ],
    includedInPrice: [
      inc('Трансфер Владивосток — подножие — Владивосток', faShuttleVan),
      inc('Горячее питание после спуска', faMugHot),
      inc('Гид-проводник', faUserTie),
      inc(
        'Интересные истории о горе, «свистящей» конструкции и легендах места',
        faWind
      ),
    ],
    imageUrl: SPRING_TOUR_COVERS['spring-5'],
    galleryImages: [
      SPRING_TOUR_COVERS['spring-5'],
      SPRING_TOUR_COVERS['spring-5'],
      SPRING_TOUR_COVERS['spring-5'],
    ],
  },
  {
    id: 'spring-6',
    season: 'spring',
    title: 'Мараловая ферма и Парк Драконов',
    subtitle: 'Благородные олени и скальные драконы за один день',
    heroPhrase: 'Внимание: Обязательно покормите Маралов!',
    duration: '14–16 часов',
    difficulty: 'Easy',
    price: 'от 7 200 ₽',
    description:
      'Мараловая ферма «Заповедная долина» расположена в 9 км от села Лазо. Здесь живут более 300 маралов и пятнистых оленей. Гостей ждёт экскурсия с кормлением животных из рук, а также возможность приобрести сувенирную продукцию на основе пантов. Парк Драконов — уникальный природный скальный комплекс в Лазовском районе Приморья, на склоне Партизанского хребта. Известен причудливыми скальными образованиями, напоминающими драконов и мифических существ. Входит в список самых необычных мест Дальнего Востока.',
    program: [
      {
        timeLabel: '04:00',
        description:
          'Выезд из Владивостока. Дорога живописная, можно поспать или посмотреть в окно на просыпающуюся тайгу.',
      },
      {
        timeLabel: '08:30',
        description:
          'Прибытие на мараловую ферму «Заповедная долина» (село Лазо).',
      },
      {
        timeLabel: '09:00–10:30',
        description:
          'Экскурсия на мараловую ферму. Кормим оленей с рук, гладим, фотографируемся. Гид расскажет о пантовом оленеводстве и целебных свойствах пантов.',
      },
      {
        timeLabel: '10:30–11:00',
        description:
          'Свободное время: сувениры (пантовая продукция, настойки на меду), чай с травяными сборами.',
      },
      { timeLabel: '11:00–12:00', description: 'Переезд в село Чистоводное.' },
      { timeLabel: '12:00–13:00', description: 'Обед на природе.' },
      {
        timeLabel: '13:00–14:00',
        description:
          'Подъём к Парку Драконов. Тропа живописная, несложная, с панорамными видами на долину.',
      },
      {
        timeLabel: '14:00–16:30',
        description:
          'Прогулка по парку. Увидим «каменных драконов», «драконьи яйца», «змеиные головы» и другие причудливые скалы. Фотосессия на фоне мистических пейзажей.',
      },
      { timeLabel: '16:30–17:30', description: 'Спуск и сборы.' },
      { timeLabel: '17:30–22:00', description: 'Возвращение во Владивосток.' },
    ],
    includedInPrice: [
      inc(
        'Трансфер Владивосток — Лазо — Чистоводное — Владивосток',
        faShuttleVan
      ),
      inc('Экскурсия на мараловую ферму', faBinoculars),
      inc('Кормление оленей с рук', faPaw),
      inc('Гид-проводник на весь маршрут', faUserTie),
    ],
    imageUrl: SPRING_TOUR_COVERS['spring-6'],
    galleryImages: [
      SPRING_TOUR_COVERS['spring-6'],
      SPRING_TOUR_COVERS['spring-6'],
      SPRING_TOUR_COVERS['spring-6'],
    ],
  },
  {
    id: 'spring-7',
    season: 'spring',
    title: 'Путешествие в ущелье Дарданеллы',
    subtitle: 'Каменные стражи и горная река в сердце Приморья',
    heroPhrase: 'Исполинные скалы Щёк Дарданеллы',
    duration: '14–16 часов',
    difficulty: 'Easy',
    price: 'от 4 500 ₽',
    description:
      'Ущелье Дарданеллы (Щёки) — геоморфологический памятник природы регионального значения, расположен в долине реки Тигровой в Партизанском районе Приморья. Протяжённость ущелья — около 14 км, высота скал — до 150 м. Известно причудливыми скальными останцами: «Замок Принцессы», «Зуб Бабы Яги», «Зуб Кощея Бессмертного», «Голова Спящего Рыцаря» и другими. Название получило в честь пролива Дарданеллы — по легенде, его дали партизаны отряда Сергея Лазо, для которых ущелье было естественной неприступной крепостью.',
    program: [
      {
        timeLabel: '08:00',
        description:
          'Выезд из Владивостока. Дорога живописная, примерно 2,5 часа.',
      },
      {
        timeLabel: '10:30',
        description:
          'Прибытие к ущелью Дарданеллы (со стороны села Бровничи). Инструктаж, подготовка к походу.',
      },
      {
        timeLabel: '10:45–14:30',
        description:
          'Пешая прогулка по маршруту: тропа вдоль реки Тигровой → подъём к «Замку Принцессы» → скальный массив «Каменный монастырь» → видовые площадки на долину реки. Общая протяжённость пешего маршрута — около 5–6 км.',
      },
      {
        timeLabel: '14:30–16:00',
        description:
          'Большой привал на поляне на берегу реки Тигровой рядом с прижимом «Щёки». Горячий обед (приготовлю на месте с душой). Отдых, фотосессия, купание в тёплое время года.',
      },
      {
        timeLabel: '16:00–17:30',
        description: 'Спуск и возвращение к машине.',
      },
      {
        timeLabel: '17:30–20:30',
        description:
          'Возвращение во Владивосток. Уставшие, счастливые и с кучей фотографий.',
      },
    ],
    includedInPrice: [
      inc(
        'Трансфер Владивосток — ущелье Дарданеллы — Владивосток',
        faShuttleVan
      ),
      inc(
        'Горячий обед на берегу реки Тигровой (приготовлю на газовой горелке — душевно, сытно, с заботой)',
        faUtensils
      ),
      inc('Горячие напитки (чай/кофе/глинтвейн по сезону)', faMugSaucer),
      inc('Гид-проводник', faUserTie),
      inc(
        'Интересные истории о партизанах Сергея Лазо, происхождении названия и скалах-останцах',
        faBookOpen
      ),
      inc('Наше тепло и забота — это входит в каждый тур', faHeart),
    ],
    imageUrl: SPRING_TOUR_COVERS['spring-7'],
    galleryImages: [
      SPRING_TOUR_COVERS['spring-7'],
      SPRING_TOUR_COVERS['spring-7'],
      SPRING_TOUR_COVERS['spring-7'],
    ],
  },

  // SUMMER — 4 tours
  {
    id: 'summer-1',
    season: 'summer',
    title: 'Камчатка: Вулканы',
    subtitle: 'Восхождение на Авачинский',
    heroPhrase: 'Камчатка: кромка вулкана и дикая природа',
    duration: '10 дней',
    difficulty: 'Hard',
    price: 'от 95 000 ₽',
    description: 'Летняя Камчатка — мечта каждого путешественника. Восхождение на вулкан Авачинский, долина гейзеров, медведи и нетронутая природа.',
    program: [
      { timeLabel: 'День 3 · 05:00', description: 'Вулкан Авачинский' },
      { timeLabel: 'День 5 · 10:00', description: 'Долина гейзеров' },
      { timeLabel: 'День 7 · 18:00', description: 'Тихий океан' },
      { timeLabel: 'День 9 · 19:00', description: 'Дикий лосось' },
    ],
    includedInPrice: [
      inc('Вертолёт или наземный трансфер — по выбранной подпрограмме'),
      inc('Сопровождение гида на восхождениях'),
      inc('Газовое оборудование и общественная кухня в лагере'),
      inc('Питание в полевых условиях'),
      inc('Каска для участников при выдаче организатором'),
    ],
    imageUrl: IMAGES.tours.placeholder,
    galleryImages: [IMAGES.tours.gallery, IMAGES.tours.gallery, IMAGES.tours.gallery],
  },
  {
    id: 'summer-2',
    season: 'summer',
    title: 'Байкал: Великая Тропа',
    subtitle: 'Поход по Большой Байкальской тропе',
    heroPhrase: 'Байкал: чистая вода и дни на тропе',
    duration: '8 дней',
    difficulty: 'Medium',
    price: 'от 42 000 ₽',
    description: 'Многодневный поход по Большой Байкальской тропе вдоль берега Байкала. Кристально чистая вода, кедровые леса, дикие пляжи.',
    program: [
      { timeLabel: 'День 1 · 08:00', description: 'Большая Байкальская тропа' },
      { timeLabel: 'День 3 · 14:00', description: 'Купание в Байкале' },
      { timeLabel: 'День 5 · 11:00', description: 'Мыс Рытый' },
      { timeLabel: 'День 6 · 10:30', description: 'Кедровый лес' },
    ],
    includedInPrice: [
      inc('Перевозка общественного снаряжения и продуктов'),
      inc('Питание в походе по согласованному меню'),
      inc('Палатки и кухонный инвентарь команды'),
      inc('Гид с опытом тропы ББТ'),
      inc('Прокат треккинговых палок — при необходимости'),
    ],
    imageUrl: IMAGES.tours.placeholder,
    galleryImages: [IMAGES.tours.gallery, IMAGES.tours.gallery, IMAGES.tours.gallery],
  },
  {
    id: 'summer-3',
    season: 'summer',
    title: 'Алтай: Плато Укок',
    subtitle: 'Край земли у подножия Белухи',
    heroPhrase: 'Алтай: плато Укок на стыке четырёх стран',
    duration: '12 дней',
    difficulty: 'Expert',
    price: 'от 110 000 ₽',
    description: 'Экспедиция на легендарное плато Укок — место, где Россия, Казахстан, Монголия и Китай сходятся вместе. Нетронутая природа и древние наскальные рисунки.',
    program: [
      { timeLabel: 'День 4 · 09:00', description: 'Плато Укок' },
      { timeLabel: 'День 6 · 07:00', description: 'Гора Белуха' },
      { timeLabel: 'День 8 · 15:00', description: 'Петроглифы' },
      { timeLabel: 'День 10 · 17:00', description: 'Дикие лошади' },
    ],
    includedInPrice: [
      inc('Въезд на плато и сопровождение проводников'),
      inc('Высокогорное снаряжение лагеря и кухня'),
      inc('Спутниковая связь для координации группы'),
      inc('Питание с учётом длительных переходов'),
      inc('Медицинский инструктаж и групповая аптечка расширенная'),
    ],
    imageUrl: IMAGES.tours.placeholder,
    galleryImages: [IMAGES.tours.gallery, IMAGES.tours.gallery, IMAGES.tours.gallery],
  },
  {
    id: 'summer-4',
    season: 'summer',
    title: 'Карелия: Водный Поход',
    subtitle: 'Сплав по карельским рекам',
    heroPhrase: 'Карелия: дикие реки и поход на байдарках',
    duration: '7 дней',
    difficulty: 'Medium',
    price: 'от 35 000 ₽',
    description: 'Сплав на байдарках по живописным карельским рекам через озёра с гранитными берегами, водопады и сосновые леса.',
    program: [
      { timeLabel: 'День 1 · 10:00', description: 'Сплав на байдарках' },
      { timeLabel: 'День 3 · 12:00', description: 'Водопады' },
      { timeLabel: 'День 4 · 16:00', description: 'Гранитные острова' },
      { timeLabel: 'День 6 · 08:00', description: 'Рыбалка' },
    ],
    includedInPrice: [
      inc('Байдарки, вёсла, спасжилеты и гермомешки'),
      inc('Инструктор по гребле и безопасности на воде'),
      inc('Питание в лагере и на стоянках'),
      inc('Общая сушилка и тенты — по программе'),
      inc('Трансфер к воде и эвакуация с финиша'),
    ],
    imageUrl: IMAGES.tours.placeholder,
    galleryImages: [IMAGES.tours.gallery, IMAGES.tours.gallery, IMAGES.tours.gallery],
  },

  // FALL — 4 tours
  {
    id: 'fall-1',
    season: 'fall',
    title: 'Алтай: Золотая Осень',
    subtitle: 'Золото лиственниц и синь озёр',
    heroPhrase: 'Алтай осенью: лиственницы и синие озёра',
    duration: '7 дней',
    difficulty: 'Medium',
    price: 'от 40 000 ₽',
    description: 'Осенний Алтай в золоте — зрелище фантастическое. Лиственницы горят золотом, озёра синеют, воздух прозрачен как хрусталь.',
    program: [
      { timeLabel: 'День 2 · 09:00', description: 'Мультинские озёра' },
      { timeLabel: 'День 3 · 14:00', description: 'Золотые лиственницы' },
      { timeLabel: 'День 5 · 11:00', description: 'Горные реки' },
      { timeLabel: 'День 6 · 08:30', description: 'Панорамные виды' },
    ],
    includedInPrice: [
      inc('Гид и маршрутные листы'),
      inc('Питание на активных днях'),
      inc('Трансферы к началу троп'),
      inc('Групповая аптечка'),
      inc('Прокат штативов для съёмки — по запросу и наличию'),
    ],
    imageUrl: IMAGES.tours.placeholder,
    galleryImages: [IMAGES.tours.gallery, IMAGES.tours.gallery, IMAGES.tours.gallery],
  },
  {
    id: 'fall-2',
    season: 'fall',
    title: 'Карелия: Осенний Лес',
    subtitle: 'Грибной поход среди берёз',
    heroPhrase: 'Карелия осенью: лесная тишина и грибы',
    duration: '4 дня',
    difficulty: 'Easy',
    price: 'от 18 000 ₽',
    description: 'Осенняя Карелия — это краски, тишина и аромат леса. Грибной поход, рыбалка на озёрах, баня с берёзовым веником.',
    program: [
      { timeLabel: 'День 1 · 10:00', description: 'Грибной сезон' },
      { timeLabel: 'День 2 · 18:00', description: 'Карельская баня' },
      { timeLabel: 'День 3 · 07:00', description: 'Рыбалка' },
      { timeLabel: 'День 3 · 15:00', description: 'Осенние краски' },
    ],
    includedInPrice: [
      inc('Проводник по лесу и правилам сбора'),
      inc('Банный инвентарь и веники'),
      inc('Удочки и наживка — по программе рыбалки'),
      inc('Питание в базовом лагере'),
      inc('Трансфер от пункта сбора'),
    ],
    imageUrl: IMAGES.tours.placeholder,
    galleryImages: [IMAGES.tours.gallery, IMAGES.tours.gallery, IMAGES.tours.gallery],
  },
  {
    id: 'fall-3',
    season: 'fall',
    title: 'Кавказ: Горные Деревни',
    subtitle: 'Средневековые сёла в осенних горах',
    heroPhrase: 'Кавказ осенью: башни и горные сёла',
    duration: '8 дней',
    difficulty: 'Medium',
    price: 'от 45 000 ₽',
    description: 'Трекинг по горным сёлам Кавказа осенью — когда туристы расходятся, горы становятся дикими и величественными. Средневековые башни, древние традиции.',
    program: [
      { timeLabel: 'День 2 · 11:00', description: 'Средневековые башни' },
      { timeLabel: 'День 4 · 16:00', description: 'Горские традиции' },
      { timeLabel: 'День 5 · 09:00', description: 'Осенние виды' },
      { timeLabel: 'День 7 · 19:00', description: 'Домашняя кухня' },
    ],
    includedInPrice: [
      inc('Проживание в гостевых домах по маршруту'),
      inc('Гид-культуролог по башенным комплексам'),
      inc('Питание: завтраки и ужины там, где указано в программе'),
      inc('Трансферы между сёлами'),
      inc('Входные билеты в музеи — если входят в маршрут'),
    ],
    imageUrl: IMAGES.tours.placeholder,
    galleryImages: [IMAGES.tours.gallery, IMAGES.tours.gallery, IMAGES.tours.gallery],
  },
  {
    id: 'fall-4',
    season: 'fall',
    title: 'Байкал: Штормовой',
    subtitle: 'Осенние шторма и пустые берега',
    heroPhrase: 'Осенний Байкал: шторм, берег и сила',
    duration: '6 дней',
    difficulty: 'Hard',
    price: 'от 48 000 ₽',
    description: 'Осенний Байкал без туристов — суровый, штормовой, настоящий. Пешие маршруты вдоль пустых берегов, рыбалка, горячие источники.',
    program: [
      { timeLabel: 'День 1 · 14:00', description: 'Осенние шторма' },
      { timeLabel: 'День 2 · 10:00', description: 'Пустые пляжи' },
      { timeLabel: 'День 4 · 15:00', description: 'Горячие источники' },
      { timeLabel: 'День 5 · 22:00', description: 'Ночные звёзды' },
    ],
    includedInPrice: [
      inc('Гид по береговым маршрутам'),
      inc('Питание и горячие напитки на ветреных выходах'),
      inc('Посещение источников — по согласованной программе'),
      inc('Снасти для рыбалки — групповой комплект'),
      inc('Трансферы вдоль побережья'),
    ],
    imageUrl: IMAGES.tours.placeholder,
    galleryImages: [IMAGES.tours.gallery, IMAGES.tours.gallery, IMAGES.tours.gallery],
  },
];

export const getToursBySeason = (season: Tour['season']): Tour[] =>
  TOURS.filter(t => t.season === season);

export const getTourById = (id: string): Tour | undefined =>
  TOURS.find(t => t.id === id);
