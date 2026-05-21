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
import { faWater } from '@fortawesome/free-solid-svg-icons/faWater';
import { faWind } from '@fortawesome/free-solid-svg-icons/faWind';
import { faHeart } from '@fortawesome/free-solid-svg-icons/faHeart';
import { faPaw } from '@fortawesome/free-solid-svg-icons/faPaw';
import { faUserTie } from '@fortawesome/free-solid-svg-icons/faUserTie';
import type { Tour, TourIncludedItem } from '../types';
import {
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
  TOUR_SPRING_3_PREFACE_BLOCK_BACKGROUND_VIEWER,
  TOUR_SPRING_4_GALLERY_GRID,
  TOUR_SPRING_4_GALLERY_VIEWER,
  TOUR_SPRING_4_PREFACE_BACKGROUND,
  TOUR_SPRING_5_GALLERY_GRID,
  TOUR_SPRING_5_GALLERY_VIEWER,
  TOUR_SPRING_6_GALLERY_GRID,
  TOUR_SPRING_6_GALLERY_VIEWER,
  TOUR_SPRING_6_PREFACE_BACKGROUND,
  TOUR_SPRING_7_GALLERY_GRID,
  TOUR_SPRING_7_GALLERY_VIEWER,
  TOUR_SPRING_7_PREFACE_BACKGROUND,
  TOUR_SPRING_8_GALLERY_GRID,
  TOUR_SPRING_8_GALLERY_VIEWER,
  TOUR_SPRING_8_PREFACE_BACKGROUND,
  TOUR_SPRING_9_GALLERY_GRID,
  TOUR_SPRING_9_GALLERY_VIEWER,
  TOUR_SPRING_9_PREFACE_BACKGROUND,
  TOUR_SPRING_10_GALLERY_GRID,
  TOUR_SPRING_10_GALLERY_VIEWER,
  TOUR_SPRING_10_PREFACE_BACKGROUND,
  TOUR_SPRING_11_GALLERY_GRID,
  TOUR_SPRING_11_GALLERY_VIEWER,
  TOUR_SPRING_11_PREFACE_BACKGROUND,
  TOUR_SPRING_12_GALLERY_GRID,
  TOUR_SPRING_12_GALLERY_VIEWER,
  TOUR_SPRING_12_PREFACE_BACKGROUND,
  TOUR_SPRING_13_GALLERY_GRID,
  TOUR_SPRING_13_GALLERY_VIEWER,
  TOUR_SPRING_13_PREFACE_BACKGROUND,
  TOUR_SUMMER_1_COVER_GRID,
  TOUR_SUMMER_1_GALLERY_GRID,
  TOUR_SUMMER_1_GALLERY_VIEWER,
  TOUR_SUMMER_1_PREFACE_BACKGROUND,
  TOUR_SUMMER_7_COVER_GRID,
  TOUR_SUMMER_7_GALLERY_GRID,
  TOUR_SUMMER_7_GALLERY_VIEWER,
  TOUR_SUMMER_7_PREFACE_BACKGROUND,
  TOUR_SUMMER_8_COVER_GRID,
  TOUR_SUMMER_8_GALLERY_GRID,
  TOUR_SUMMER_8_GALLERY_VIEWER,
  TOUR_SUMMER_8_PREFACE_BACKGROUND,
} from '../constants/images';
import { FALL_TOUR_MEDIA_BY_ID } from '../constants/generated/fallTourMedia.generated';
import { SUMMER_PAIRED_TOUR_MEDIA_BY_ID } from '../constants/generated/summerPairedTourMedia.generated';
import { UI } from '../constants/ui';
import { buildFallToursFromSpring } from './createFallTourFromSpring';
import { buildSummerToursFromSpring } from './createSummerTourFromSpring';

const inc = (text: string, icon: IconDefinition = faCheck): TourIncludedItem => ({
  text,
  icon,
});

const TOURS_CORE: Tour[] = [
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
      inc('Гамаши, чтобы ноги оставались в тепле (при необходимости)', faSocks),
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
    duration: '12,5 часов',
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
    difficultyDisplayLabel: 'Лёгкая/Сложная',
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

  // SPRING — 10 tours
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
      'Ущелье Дарданеллы (Щёки) — природный памятник в долине реки Тигровой. Здесь нас ждут скальные останцы, тропа вдоль реки и видовые точки с высоты до 150 м. Маршрут мягкий по темпу и подходит тем, кто хочет красивый день в горах без перегруза.',
    program: [
      {
        timeLabel: '08:00',
        description: 'Выезд из Владивостока. В пути около 2,5 часов.',
      },
      {
        timeLabel: '10:30',
        description: 'Прибытие к старту маршрута, инструктаж и подготовка.',
      },
      {
        timeLabel: '10:45–14:30',
        description:
          'Пеший маршрут 5-6 км: тропа вдоль Тигровой, "Замок Принцессы", "Каменный монастырь" и видовые площадки.',
      },
      {
        timeLabel: '14:30–16:00',
        description:
          'Большой привал у реки: горячий обед, отдых, фото. В тёплое время можно искупаться.',
      },
      {
        timeLabel: '16:00–17:30',
        description: 'Спуск и возвращение к машине.',
      },
      {
        timeLabel: '17:30–20:30',
        description: 'Возвращение во Владивосток.',
      },
    ],
    includedInPrice: [
      inc(
        'Трансфер Владивосток — ущелье Дарданеллы — Владивосток',
        faShuttleVan
      ),
      inc('Горячий обед на берегу реки Тигровой', faUtensils),
      inc('Горячие напитки (чай/кофе/глинтвейн по сезону)', faMugSaucer),
      inc('Гид-проводник', faUserTie),
      inc('Истории о местности и происхождении названия ущелья', faBookOpen),
      inc('Забота команды на всём маршруте', faHeart),
    ],
    imageUrl: SPRING_TOUR_COVERS['spring-7'],
    prefaceBackgroundImageUrl: TOUR_SPRING_7_PREFACE_BACKGROUND,
    galleryImages: [...TOUR_SPRING_7_GALLERY_VIEWER],
    galleryGridUrls: [...TOUR_SPRING_7_GALLERY_GRID],
  },
  {
    id: 'spring-3',
    season: 'spring',
    title: 'Восхождение на Пидан (Ливадийскую)',
    subtitle: 'Главная мистическая вершина Приморья',
    heroPhrase: 'Тайга Пидана, дольмены и морские дали',
    duration: '15 часов',
    difficulty: 'Medium',
    price: '6 000 ₽',
    descriptionLeadBold: 'Гора Пидан (Ливадийская, 1332 м)',
    description:
      ' — главная мистическая вершина Южного Приморья известна древними дольменами, каменными россыпями-курумниками и мощной энергетикой.',
    descriptionAside:
      'Привлекает туристов зеленой тайгой, цветущим рододендроном на склонах, панорамой Японского моря и самым чистым прозрачным воздухом.',
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
    prefaceBackgroundImageUrl: TOUR_SPRING_3_PREFACE_BLOCK_BACKGROUND_VIEWER,
    galleryImages: [...TOUR_SPRING_3_GALLERY_VIEWER],
    galleryGridUrls: [...TOUR_SPRING_3_GALLERY_GRID],
  },
  {
    id: 'spring-6',
    season: 'spring',
    title: 'Маралы х Драконы',
    subtitle: 'Благородные олени и скальные драконы за один день',
    heroPhrase: 'Ферма маралов и скалы-драконы за день',
    duration: '14–16 часов',
    difficulty: 'Easy',
    price: 'от 7 200 ₽',
    description:
      'Комбинированный тур в Лазовский район: утром посещаем мараловую ферму с кормлением оленей, после обеда идем в Парк Драконов. Формат подойдёт для спокойного темпа, фото и знакомства с двумя яркими локациями за один день.',
    program: [
      {
        timeLabel: '04:00',
        description: 'Выезд из Владивостока.',
      },
      {
        timeLabel: '08:30',
        description: 'Прибытие на мараловую ферму "Заповедная долина".',
      },
      {
        timeLabel: '09:00–10:30',
        description:
          'Экскурсия по ферме: кормим оленей с рук, фотографируемся, слушаем рассказ гида.',
      },
      {
        timeLabel: '10:30–11:00',
        description: 'Свободное время: чай и сувениры на ферме.',
      },
      { timeLabel: '11:00–12:00', description: 'Переезд в село Чистоводное.' },
      { timeLabel: '12:00–13:00', description: 'Обед на природе' },
      {
        timeLabel: '13:00–14:00',
        description: 'Подъём к Парку Драконов по несложной тропе.',
      },
      {
        timeLabel: '14:00–16:30',
        description:
          'Прогулка по парку: "каменные драконы", панорамы долины и фотостопы.',
      },
      { timeLabel: '16:30–17:30', description: 'Спуск и сборы' },
      { timeLabel: '17:30–22:00', description: 'Возвращение во Владивосток' },
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
    prefaceBackgroundImageUrl: TOUR_SPRING_6_PREFACE_BACKGROUND,
    galleryImages: [...TOUR_SPRING_6_GALLERY_VIEWER],
    galleryGridUrls: [...TOUR_SPRING_6_GALLERY_GRID],
  },
  {
    id: 'spring-10',
    season: 'spring',
    title: 'Путешествие на остров Аскольд',
    subtitle:
      'Остров-призрак с маяками, кекурами и морскими котиками',
    heroPhrase: 'Катер, маяк, кекуры и лежбища ларг за один день',
    duration: '12–14 часов',
    difficulty: 'Medium',
    difficultyDisplayLabel: 'Легкая/Сложная',
    price: '7 000 ₽',
    descriptionLeadBold: 'Остров Аскольд',
    description:
      ' — однодневная морская экспедиция на один из самых атмосферных островов Приморья. За поездку увидим кекуры "Пять пальцев", лежбища ларг и сивучей, старый маяк и военные объекты. Маршрут зависит от погоды и состояния моря.',
    program: [
      { timeLabel: '07:00', description: 'Выезд из Владивостока' },
      {
        timeLabel: '10:00',
        description: 'Прибытие в посёлок Дунай, пересадка на катер',
      },
      {
        timeLabel: '10:00–11:00',
        description:
          'Морская прогулка к кекурам "Пять пальцев", наблюдение за ларгами и сивучами',
      },
      {
        timeLabel: '11:00–11:30',
        description: 'Высадка на остров (бухта зависит от погоды)',
      },
      {
        timeLabel: '11:30–15:30',
        description:
          'Пешая прогулка по острову: батарея №26, маяк на мысе Елагина и смотровые точки',
      },
      {
        timeLabel: '15:30–16:30',
        description: 'Обед на берегу. Готовим на месте',
      },
      { timeLabel: '16:30–17:00', description: 'Посадка на катер' },
      { timeLabel: '17:00–18:00', description: 'Переход в посёлок Дунай' },
      { timeLabel: '18:00–21:00', description: 'Возвращение во Владивосток' },
    ],
    includedInPrice: [
      inc('Индивидуальный трансфер Владивосток — Дунай — Владивосток', faShuttleVan),
      inc('Катер до острова Аскольд и обратно', faWater),
      inc('Сопровождение гида-проводника', faUserTie),
      inc('Обед на берегу', faUtensils),
      inc('Горячие напитки (чай/кофе)', faMugHot),
      inc('Истории об острове и его обитателях', faBookOpen),
      inc('Забота команды на протяжении тура', faHeart),
    ],
    imageUrl: SPRING_TOUR_COVERS['spring-10'],
    prefaceBackgroundImageUrl: TOUR_SPRING_10_PREFACE_BACKGROUND,
    galleryImages: [...TOUR_SPRING_10_GALLERY_VIEWER],
    galleryGridUrls: [...TOUR_SPRING_10_GALLERY_GRID],
  },
  {
    id: 'spring-11',
    season: 'spring',
    title: 'Путешествие на остров Шкота',
    subtitle: 'Необитаемый остров с маяком и морскими котиками',
    heroPhrase: 'Лазурная бухта, старый маяк и ужин с морепродуктами',
    duration: '8–10 часов',
    difficulty: 'Easy',
    price: '5 000 ₽',
    priceFootnote: 'Для группы от 3 до 8 человек.',
    descriptionLeadBold: 'Остров Шкота',
    description:
      ' — маленький необитаемый остров к югу от Русского, куда летом можно перейти вброд по каменистой косе. За один день пройдём к заброшенному маяку, увидим скалы, кекуры и, если повезёт, лежбище ларг. В финале — спуск в бухту по стационарной верёвке, купание в чистой воде и обед с морепродуктами для вашей компании.',
    program: [
      { timeLabel: '09:00', description: 'Выезд из Владивостока через Русский мост' },
      {
        timeLabel: '10:00',
        description: 'Прибытие к косе и переход вброд на остров Шкота',
      },
      {
        timeLabel: '10:15–12:30',
        description:
          'Пешая прогулка: заброшенный военный городок, батарея, старый маяк, скалы и море',
      },
      {
        timeLabel: '12:30–13:30',
        description:
          'Спуск в бухту по верёвке для желающих, купание и отдых у воды',
      },
      {
        timeLabel: '13:30–14:30',
        description: 'Обед с морепродуктами на берегу, готовим на месте',
      },
      {
        timeLabel: '14:30–15:30',
        description: 'Отдых, фотосессия и купание',
      },
      { timeLabel: '15:30–16:30', description: 'Обратный путь до косы' },
      { timeLabel: '16:30–17:30', description: 'Возвращение во Владивосток' },
    ],
    includedInPrice: [
      inc('Индивидуальный трансфер Владивосток — остров Шкота — Владивосток', faShuttleVan),
      inc('Сопровождение гида-проводника', faUserTie),
      inc('Обед с морепродуктами на берегу', faUtensils),
      inc('Горячие напитки (чай/кофе)', faMugHot),
      inc('Истории об острове, маяке, батареях и морских котиках', faBookOpen),
      inc('Забота команды и индивидуальный подход', faHeart),
    ],
    imageUrl: SPRING_TOUR_COVERS['spring-11'],
    prefaceBackgroundImageUrl: TOUR_SPRING_11_PREFACE_BACKGROUND,
    galleryImages: [...TOUR_SPRING_11_GALLERY_VIEWER],
    galleryGridUrls: [...TOUR_SPRING_11_GALLERY_GRID],
  },
  {
    id: 'spring-12',
    season: 'spring',
    title: 'Путешествие на мыс Тобизина',
    subtitle: 'Край земли с каменной «шахматной доской»',
    heroPhrase: 'Скалы-исполины и бескрайнее море',
    duration: '6–8 часов',
    difficulty: 'Easy',
    price: '5 000 ₽',
    priceFootnote: 'Для группы от 4 до 10 человек.',
    descriptionLeadBold: 'Мыс Тобизина',
    description:
      ' — самая южная точка острова Русский: лесная тропа, скалы до 30 м и каменное плато, похожее на шахматную доску. Дойдём до края моря, пройдём небольшой верёвочный участок, летом искупаемся в бухте Карпинского и устроим обед с морепродуктами на берегу.',
    program: [
      { timeLabel: '10:00', description: 'Выезд из Владивостока через Русский мост' },
      {
        timeLabel: '10:40',
        description: 'Прибытие к бухте Карпинского, инструктаж и подготовка',
      },
      {
        timeLabel: '11:00–13:00',
        description:
          'Пешая прогулка к мысу: лесная тропа, скалы, каменный перешеек и верёвочный участок',
      },
      {
        timeLabel: '13:00–14:00',
        description:
          'Свободное время на мысе: фото на каменном плато, виды на море и отдых',
      },
      { timeLabel: '14:00–15:30', description: 'Обратный путь к бухте Карпинского' },
      {
        timeLabel: '15:30–16:30',
        description: 'Купание в бухте Карпинского в тёплое время года',
      },
      {
        timeLabel: '16:30–17:30',
        description: 'Обед с морепродуктами на берегу, готовим на месте',
      },
      { timeLabel: '17:30–18:30', description: 'Возвращение во Владивосток' },
    ],
    includedInPrice: [
      inc('Индивидуальный трансфер Владивосток — мыс Тобизина — Владивосток', faShuttleVan),
      inc('Сопровождение гида-проводника', faUserTie),
      inc('Обед с морепродуктами на берегу', faUtensils),
      inc('Горячие напитки (чай/кофе)', faMugHot),
      inc('Помощь на верёвочном участке маршрута', faHelmetSafety),
      inc('Истории об острове Русский и мысе Тобизина', faBookOpen),
      inc('Забота команды и индивидуальный формат', faHeart),
    ],
    imageUrl: SPRING_TOUR_COVERS['spring-12'],
    prefaceBackgroundImageUrl: TOUR_SPRING_12_PREFACE_BACKGROUND,
    galleryImages: [...TOUR_SPRING_12_GALLERY_VIEWER],
    galleryGridUrls: [...TOUR_SPRING_12_GALLERY_GRID],
  },
  {
    id: 'spring-13',
    season: 'spring',
    title: 'Полуостров Гамова',
    subtitle: 'Райский уголок на юге Приморья',
    heroPhrase: 'Скалистые мысы, реликтовый лес и бескрайнее море!',
    duration: '15 часов',
    difficulty: 'Easy',
    difficultyDisplayLabel: 'Лёгкий хайкинг',
    price: '6 500 ₽',
    priceFootnote: 'Июль-август: 7 200 ₽.',
    descriptionLeadBold: 'Полуостров Гамова',
    description:
      ' — джип-тур по югу Приморья, где за один день собраны бухты Витязь, Теляковского и Астафьева, реликтовые сосны, скалистые мысы и видовые точки над морем. Маршрут для тех, кто хочет увидеть дикое Приморье без суеты: прозрачную воду, вековой маяк, легенды старого края и пикник на берегу.',
    program: [
      { timeLabel: '06:00', description: 'Выезд из Владивостока' },
      {
        timeLabel: '10:30',
        description: 'Бухта Витязь и её главные достопримечательности',
      },
      {
        timeLabel: '12:00',
        description:
          'Полуостров Гамова: остров Томящегося сердца, бухта Теляковского и реликтовые сосны',
      },
      {
        timeLabel: '15:00',
        description: 'Дзен в бухте Астафьева и пикник на берегу',
      },
      { timeLabel: '17:00', description: 'Выезд в город' },
      { timeLabel: '21:00', description: 'Прибытие во Владивосток' },
    ],
    includedInPrice: [
      inc('Индивидуальный трансфер из Владивостока', faShuttleVan),
      inc('Сопровождение гида-проводника', faUserTie),
      inc('Обед на берегу', faUtensils),
      inc('Горячие напитки (чай/кофе)', faMugHot),
      inc('Истории о крае, полуострове, бухтах и окрестностях', faBookOpen),
      inc('Забота команды и индивидуальный подход', faHeart),
    ],
    imageUrl: SPRING_TOUR_COVERS['spring-13'],
    prefaceBackgroundImageUrl: TOUR_SPRING_13_PREFACE_BACKGROUND,
    galleryImages: [...TOUR_SPRING_13_GALLERY_VIEWER],
    galleryGridUrls: [...TOUR_SPRING_13_GALLERY_GRID],
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
    prefaceBackgroundImageUrl: TOUR_SPRING_4_PREFACE_BACKGROUND,
    galleryImages: [...TOUR_SPRING_4_GALLERY_VIEWER],
    galleryGridUrls: [...TOUR_SPRING_4_GALLERY_GRID],
  },
  {
    id: 'spring-8',
    season: 'spring',
    title: 'Восхождение на г. Фалаза',
    subtitle: 'Одна из самых красивых и доступных вершин Приморья',
    heroPhrase: 'Панорамы с вершины Фалазы',
    duration: '1 день / 13 часов',
    difficulty: 'Medium',
    price: '6 000 ₽',
    descriptionLeadBold: 'Гора Фалаза (Литовка, 1279 м)',
    description:
      ' — одна из самых доступных и красивых вершин южного Приморья. Тур рассчитан на один активный день: бодрое восхождение, отдых на вершине, панорамы дальних хребтов и горячий ужин после спуска. Подходит тем, кто хочет яркий горный опыт без многодневного похода.',
    program: [
      { timeLabel: '07:00', description: 'Выезд из Владивостока' },
      {
        timeLabel: '09:30',
        description: 'Прибытие к подножию Фалазы, инструктаж, сбор',
      },
      { timeLabel: '10:00', description: 'Восхождение на вершину' },
      {
        timeLabel: '13:00',
        description: 'Отдых на вершине, фото- и видео-фиксация, пикник',
      },
      { timeLabel: '14:30–16:30', description: 'Спуск' },
      { timeLabel: '16:30', description: 'Горячий ужин' },
      { timeLabel: '17:30', description: 'Выезд в город' },
      { timeLabel: '20:00', description: 'Прибытие во Владивосток' },
    ],
    includedInPrice: [
      inc('Трансфер Владивосток — Грибановка — Владивосток', faShuttleVan),
      inc('Горячее питание и напитки после спуска', faMugHot),
      inc('Сопровождение гида-проводника на маршруте', faUserTie),
      inc('Инструктаж и организация безопасного прохождения маршрута', faPersonHiking),
      inc('Фото- и видео-фиксация на память', faBinoculars),
    ],
    imageUrl: SPRING_TOUR_COVERS['spring-8'],
    prefaceBackgroundImageUrl: TOUR_SPRING_8_PREFACE_BACKGROUND,
    galleryImages: [...TOUR_SPRING_8_GALLERY_VIEWER],
    galleryGridUrls: [...TOUR_SPRING_8_GALLERY_GRID],
  },
  {
    id: 'spring-9',
    season: 'spring',
    title: 'Восхождение на г. Воробей + Дегустация',
    subtitle:
      'Лёгкое восхождение в Приморье и дегустация местных вин в Анисимовке',
    heroPhrase: 'Вершина днём, дегустация приморских вин вечером',
    duration: '1 день / 14,5 часов',
    difficulty: 'Easy',
    price: '6 000 ₽',
    descriptionLeadBold: 'Гора Воробей (Туманная, 1230 м)',
    description:
      ' — доступная вершина из проекта "Приморский Барс" рядом с Анисимовкой. Главная идея тура: сочетать активный маршрут в горах и гастрономический финальный аккорд! После восхождения едем в Майхинское хозяйство на экскурсию и дегустацию.',
    program: [
      { timeLabel: '07:00', description: 'Выезд из Владивостока' },
      { timeLabel: '09:00', description: 'Прибытие к подножию' },
      { timeLabel: '09:30–12:30', description: 'Восхождение' },
      {
        timeLabel: '12:30–14:30',
        description: 'Отдых на вершине, фото- и видео-фиксация, обед',
      },
      { timeLabel: '14:30–16:30', description: 'Спуск' },
      { timeLabel: '17:30', description: 'Посещение винодельни, дегустация' },
      { timeLabel: '19:30', description: 'Выезд в город' },
      { timeLabel: '21:30', description: 'Прибытие во Владивосток' },
    ],
    includedInPrice: [
      inc('Трансфер из Владивостока и обратно', faShuttleVan),
      inc('Сопровождение гида-проводника на всём маршруте', faUserTie),
      inc('Горячий обед на маршруте', faMugHot),
      inc('Дегустация в Майхинском домохозяйстве', faUtensils),
      inc('Помощь с фото и видео на маршруте', faHeart),
      inc('Организация маршрута и сопровождение группы', faCheck),
    ],
    imageUrl: SPRING_TOUR_COVERS['spring-9'],
    prefaceBackgroundImageUrl: TOUR_SPRING_9_PREFACE_BACKGROUND,
    galleryImages: [...TOUR_SPRING_9_GALLERY_VIEWER],
    galleryGridUrls: [...TOUR_SPRING_9_GALLERY_GRID],
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
    galleryImages: [...TOUR_SPRING_5_GALLERY_VIEWER],
    galleryGridUrls: [...TOUR_SPRING_5_GALLERY_GRID],
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

  // SUMMER — 8 tours (summer-1, summer-7, summer-8 — уникальные; summer-2…6 — фабрика)
  {
    id: 'summer-1',
    season: 'summer',
    title: 'Заповедная Та-Чингоуза',
    subtitle: 'Бухта Кит, кордон Тачингоуза, бухта Просёлочная, мараловая ферма',
    heroPhrase: 'Бирюзовое море, скалы и ферма маралов',
    duration: '2 дня / 1 ночь',
    difficulty: 'Easy',
    difficultyDisplayLabel: 'легкая',
    price: 'от 15 000 ₽',
    priceFootnote: 'группа от 4 человек',
    description:
      'Из Владивостока — через сопки и леса к морю: бухта Кит (два километра пляжа, остров с маяком), экскурсия «Сквозь века», затем побережье с остановками у бухт Заря и Камбальная. К вечеру — кордон Тачингоуза («красота неземная»): ужин, чай, закат, ночёвка в домике без удобств — тишина и звёздное небо.\n\nУтром — бухта Просёлочная (бирюзовая вода, скала «кит»), потом мараловая ферма: около трёхсот оленей, кормление из рук. Обед по дороге и возвращение в город.',
    program: [
      { timeLabel: 'День 1 · 06:00', description: 'Выезд из Владивостока' },
      { timeLabel: 'День 1 · 11:00', description: 'Бухта Кит, экскурсия, обед' },
      { timeLabel: 'День 1 · 14:00', description: 'Дорога вдоль побережья' },
      {
        timeLabel: 'День 1 · 17:00',
        description: 'Кордон Тачингоуза, ужин, ночёвка (дополнительно баня)',
      },
      {
        timeLabel: 'День 2 · 09:00',
        description: 'Завтра, зарядка. Купание и прогулка по морю',
      },
      { timeLabel: 'День 2 · 14:00', description: 'Мараловая ферма, олени' },
      { timeLabel: 'День 2 · 15:30', description: 'Обед' },
      { timeLabel: 'День 2 · 16:00', description: 'Выезд домой' },
      { timeLabel: 'День 2 · 21:00', description: 'Владивосток' },
    ],
    includedInPrice: [
      inc('Трансфер туда-обратно', faShuttleVan),
      inc('Проезд по заповеднику', faTicket),
      inc('Экскурсия «Сквозь века»', faChalkboardTeacher),
      inc('Ночлег на кордоне', faBed),
      inc('Завтрак и Ужин', faUtensils),
      inc('Ферма Маралов', faPaw),
      inc('Горячие напитки', faMugHot),
      inc('Наша забота и душа', faHeart),
    ],
    imageUrl: TOUR_SUMMER_1_COVER_GRID,
    prefaceBackgroundImageUrl: TOUR_SUMMER_1_PREFACE_BACKGROUND,
    galleryImages: [...TOUR_SUMMER_1_GALLERY_VIEWER],
    galleryGridUrls: [...TOUR_SUMMER_1_GALLERY_GRID],
  },
  {
    id: 'summer-7',
    season: 'summer',
    title: 'Северное Приморье: Тайны побережья',
    subtitle: 'Бухта Дубовая, маяк Балюзек и космическая тайна Дальнегорска',
    heroPhrase:
      'Туда, где кончаются дороги, а океан встречается со звёздами. Два дня, чтобы влюбиться в настоящий север Приморья.',
    duration: '2 дня / 1 ночь',
    difficulty: 'Medium',
    difficultyDisplayLabel: 'Средняя',
    price: '19 500 ₽',
    priceFootnote: 'на одного участника, группа от 5 человек',
    description:
      'Два дня на севере: Дубовая — кекуры, пляж и пикник у воды; вечером база «Мыс Балюзек», ужин и ночь с видом на залив.\n\nНаутро — маяк Балюзек, мыс Четырёх Скал, Рудная Пристань и Высота 611 в Дальнегорске. К ночи — Владивосток.',
    descriptionAside:
      'Между перевалами — тайга и бухты, где время течёт иначе. Дубовая дышит шумом волн; у Балюзека маяк почти век смотрит в море. Четырёх Скал держат кекуры-стражи — а Высота 611 в финале: небо, легенда 1986-го, история, от которой стынет кожа.',
    program: [
      {
        timeLabel: 'День 1 · 04:00',
        description: 'Выезд из Владивостока навстречу приключениям!',
      },
      {
        timeLabel: 'День 1 · 11:30',
        description:
          'Бухта Дубовая: кекуры «Курица» и «Бутылка», прогулка по песчаному пляжу, обед-пикник',
      },
      {
        timeLabel: 'День 1 · 16:00',
        description: 'Переезд на базу отдыха «Мыс Балюзек», размещение в номерах',
      },
      {
        timeLabel: 'День 1 · 16:30',
        description: 'Посещение смотровой площадки к маяку Балюзек',
      },
      {
        timeLabel: 'День 1 · 19:00',
        description: 'Ужин, согревающий чай под шум волн',
      },
      { timeLabel: 'День 2 · 09:00', description: 'Завтрак на базе, сборы' },
      {
        timeLabel: 'День 2 · 12:00',
        description: 'Мыс Четырёх Скал: визитная карточка Севера',
      },
      { timeLabel: 'День 2 · 14:30', description: 'Обед' },
      {
        timeLabel: 'День 2 · 15:30',
        description:
          'Прогулка к маяку Рудной Пристани: виды на бухту и скалы 2 Брата',
      },
      {
        timeLabel: 'День 2 · 16:30',
        description: 'Переезд в Дальнегорск. Экскурсия на Высоту 611',
      },
      { timeLabel: 'День 2 · 17:30', description: 'Выезд домой' },
      { timeLabel: 'День 2 · 23:00', description: 'Прибытие во Владивосток' },
    ],
    programAdditionalNotes: [
      'По желанию можно встретить рассвет на маяке Балюзек.',
      'Время поездки и маршрут могут меняться из-за погодных и иных условий.',
    ],
    includedInPrice: [
      inc(
        'Комфортабельный трансфер Владивосток — север Приморья — Владивосток',
        faShuttleVan
      ),
      inc('Проживание на базе отдыха «Мыс Балюзек» (1 ночь)', faBed),
      inc(
        'Питание: обед-пикник и горячий ужин первого дня, завтрак и обед-пикник второго дня',
        faUtensils
      ),
      inc('Вход на все указанные природные объекты', faTicket),
      inc('Экскурсия на маяк Балюзек и к мысу Четырёх Скал', faBinoculars),
      inc('Услуги гида-проводника и трансфер по всему маршруту', faUserTie),
      inc('Горячие напитки на маршруте', faMugHot),
      inc('Наша забота и душа', faHeart),
    ],
    imageUrl: TOUR_SUMMER_7_COVER_GRID,
    prefaceBackgroundImageUrl: TOUR_SUMMER_7_PREFACE_BACKGROUND,
    galleryImages: [...TOUR_SUMMER_7_GALLERY_VIEWER],
    galleryGridUrls: [...TOUR_SUMMER_7_GALLERY_GRID],
  },
  {
    id: 'summer-8',
    season: 'summer',
    title: 'Полуостров Краббе',
    subtitle: 'Один день среди морских скал, бухт и тех видов, в которые влюбляешься сразу',
    heroPhrase:
      'Туда, где зелёные сопки уходят в море, а каждый поворот тропы — как новая открытка Приморья',
    duration: '1 день',
    difficulty: 'Medium',
    difficultyDisplayLabel: 'Средняя',
    price: 'по запросу',
    description:
      'Этот маршрут — для тех, кто любит живые путешествия: красивые дороги, морской воздух, душевную компанию и места, после которых ещё долго тепло внутри.\n\nПолуостров Краббе — одно из самых атмосферных мест юга Приморья. Он в Хасанском округе, считается необитаемым и входит в буферную зону особо охраняемых природных территорий. Здесь море с двух сторон, зелёные сопки, бухты, кекуры, пещеры и ощущение, будто вы приехали в совсем другое Приморье — более дикое, тихое и сильное.\n\nМы любим этот маршрут за красоту и характер: прогулку по берегу и смотровым точкам, каменную сказку Краббе, бухту Агатовую, простор и редкое чувство свободы. Это поездка, в которой не нужно спешить: идём, смотрим, дышим морем и просто проживаем очень красивый день.',
    program: [
      { timeLabel: '05:30', description: 'Выезд из Владивостока' },
      { timeLabel: '10:00', description: 'Прибытие к началу маршрута, короткий инструктаж' },
      {
        timeLabel: '10:30–13:30',
        description: 'Прогулка по полуострову, видовые точки, море, фото',
      },
      { timeLabel: '13:30–14:30', description: 'Пикник с красивым видом' },
      {
        timeLabel: '14:30–17:00',
        description: 'Продолжаем маршрут, исследуем берег и бухты',
      },
      { timeLabel: '17:30', description: 'Выезд обратно' },
      { timeLabel: '22:00–23:00', description: 'Возвращение во Владивосток' },
    ],
    includedInPrice: [
      inc('Трансфер туда и обратно', faShuttleVan),
      inc('Сопровождение команды Вкрайности', faUserTie),
      inc('Организация маршрута', faBookOpen),
      inc('Прогулка по полуострову Краббе', faPersonHiking),
      inc('Время на отдых, фото и пикник', faMugHot),
      inc('Наша забота и тёплая атмосфера в поездке', faHeart),
    ],
    imageUrl: TOUR_SUMMER_8_COVER_GRID,
    prefaceBackgroundImageUrl: TOUR_SUMMER_8_PREFACE_BACKGROUND,
    galleryImages: [...TOUR_SUMMER_8_GALLERY_VIEWER],
    galleryGridUrls: [...TOUR_SUMMER_8_GALLERY_GRID],
  },
];

const springTours = TOURS_CORE.filter((tour) => tour.season === 'spring');

const SUMMER_PAIRED_TOURS = buildSummerToursFromSpring(
  springTours,
  SUMMER_PAIRED_TOUR_MEDIA_BY_ID
);

function summerTourSortKey(tour: Tour): number {
  return Number.parseInt(tour.id.replace('summer-', ''), 10);
}

const summerTours = [
  ...TOURS_CORE.filter((tour) => tour.season === 'summer'),
  ...SUMMER_PAIRED_TOURS,
].sort((a, b) => summerTourSortKey(a) - summerTourSortKey(b));

const TOURS_BEFORE_FALL: Tour[] = [
  ...TOURS_CORE.filter((tour) => tour.season !== 'summer'),
  ...summerTours,
];

const FALL_TOURS = buildFallToursFromSpring(springTours, FALL_TOUR_MEDIA_BY_ID);

export const TOURS: Tour[] = [...TOURS_BEFORE_FALL, ...FALL_TOURS];

export const getToursBySeason = (season: Tour['season']): Tour[] =>
  TOURS.filter(t => t.season === season);

export const getTourById = (id: string): Tour | undefined =>
  TOURS.find(t => t.id === id);
