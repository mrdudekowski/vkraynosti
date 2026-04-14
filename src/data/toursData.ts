import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faBed } from '@fortawesome/free-solid-svg-icons/faBed';
import { faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons/faChalkboardTeacher';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { faDog } from '@fortawesome/free-solid-svg-icons/faDog';
import { faHelmetSafety } from '@fortawesome/free-solid-svg-icons/faHelmetSafety';
import { faHotTubPerson } from '@fortawesome/free-solid-svg-icons/faHotTubPerson';
import { faMugHot } from '@fortawesome/free-solid-svg-icons/faMugHot';
import { faPersonHiking } from '@fortawesome/free-solid-svg-icons/faPersonHiking';
import { faShuttleVan } from '@fortawesome/free-solid-svg-icons/faShuttleVan';
import { faSocks } from '@fortawesome/free-solid-svg-icons/faSocks';
import { faSnowboarding } from '@fortawesome/free-solid-svg-icons/faSnowboarding';
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
    heroPhrase: 'Сказочные заснеженные ели на самой снежной вершине Приморья',
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
    heroPhrase:
      'Сказочный заснеженный лес и невероятные виды на Сихотэ-Алиньский хребет',
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
    heroPhrase: 'Тур для влюблённых в горы во всех смыслах!',
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
    heroPhrase: 'Катания в собачьих упряжках в зимнем лесу',
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
    heroPhrase:
      'Горнолыжный склон в Арсеньеве ждёт приморских райдеров!',
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

  // SPRING — 4 tours
  {
    id: 'spring-1',
    season: 'spring',
    title: 'Алтай: Цветение Маральника',
    subtitle: 'Розовые горы в мае',
    heroPhrase: 'Розовые горы просыпаются после зимы',
    duration: '6 дней',
    difficulty: 'Easy',
    price: 'от 32 000 ₽',
    description: 'В мае горы Алтая покрываются розовым цветением маральника — рододендрона. Лёгкий трекинг среди цветущих склонов с видами на снежные вершины.',
    program: [
      { timeLabel: 'День 1 · 10:00', description: 'Цветение маральника' },
      { timeLabel: 'День 2 · 15:00', description: 'Панорамные виды' },
      { timeLabel: 'День 4 · 11:00', description: 'Горные реки' },
      { timeLabel: 'День 5 · 19:00', description: 'Алтайская кухня' },
    ],
    includedInPrice: [
      inc('Сопровождение гида по тропам'),
      inc('Перекус и обеды на маршруте по программе'),
      inc('Групповая аптечка и средства от клещей (сезон)'),
      inc('Трансфер к точке старта и обратно'),
      inc('Походная картография района'),
    ],
    imageUrl: SPRING_TOUR_COVERS['spring-1'],
    galleryImages: [SPRING_TOUR_COVERS['spring-1'], SPRING_TOUR_COVERS['spring-1'], SPRING_TOUR_COVERS['spring-1']],
  },
  {
    id: 'spring-2',
    season: 'spring',
    title: 'Камчатка: Первый Снег',
    subtitle: 'Вулканы в облаках',
    heroPhrase: 'Вулканы над землёй, которая только просыпается',
    duration: '9 дней',
    difficulty: 'Hard',
    price: 'от 85 000 ₽',
    description: 'Весенняя Камчатка — время, когда склоны вулканов ещё покрыты снегом, а природа просыпается. Трекинг к кратерам действующих вулканов.',
    program: [
      { timeLabel: 'День 2 · 08:30', description: 'Действующие вулканы' },
      { timeLabel: 'День 4 · 12:00', description: 'Гейзеры' },
      { timeLabel: 'День 6 · 17:00', description: 'Медведи' },
      { timeLabel: 'День 8 · 09:00', description: 'Вертолётные экскурсии' },
    ],
    includedInPrice: [
      inc('Вертолётные перелёты по заявленным в программе точкам'),
      inc('Полевой гид и радиосвязь в группе'),
      inc('Газовые горелки и общественное снаряжение лагеря'),
      inc('Питание в экспедиции'),
      inc('Разрешения и сборы на территориях парков — по факту включения в оферту'),
    ],
    imageUrl: SPRING_TOUR_COVERS['spring-2'],
    galleryImages: [SPRING_TOUR_COVERS['spring-2'], SPRING_TOUR_COVERS['spring-2'], SPRING_TOUR_COVERS['spring-2']],
  },
  {
    id: 'spring-3',
    season: 'spring',
    title: 'Байкал Весной',
    subtitle: 'Ледоход и первая зелень',
    heroPhrase: 'Лёд трескается — Байкал снова свободен',
    duration: '5 дней',
    difficulty: 'Easy',
    price: 'от 24 000 ₽',
    description: 'Наблюдение за таянием льда на Байкале — уникальное природное шоу. Пешие прогулки вдоль берега, знакомство с байкальской флорой.',
    program: [
      { timeLabel: 'День 1 · 14:00', description: 'Ледоход' },
      { timeLabel: 'День 2 · 10:00', description: 'Нерпа на льдинах' },
      { timeLabel: 'День 3 · 16:00', description: 'Горячие источники' },
      { timeLabel: 'День 4 · 13:00', description: 'Рыбная кухня' },
    ],
    includedInPrice: [
      inc('Трансферы по береговой программе'),
      inc('Гид-экскурсовод по природе Байкала'),
      inc('Вход в зону источников — если предусмотрено маршрутом'),
      inc('Питание: завтраки и обеды по расписанию'),
      inc('Бинокль для наблюдения за нерпой — на время выходов'),
    ],
    imageUrl: SPRING_TOUR_COVERS['spring-3'],
    galleryImages: [SPRING_TOUR_COVERS['spring-3'], SPRING_TOUR_COVERS['spring-3'], SPRING_TOUR_COVERS['spring-3']],
  },
  {
    id: 'spring-4',
    season: 'spring',
    title: 'Кавказ: Весенний Трекинг',
    subtitle: 'Альпийские луга и водопады',
    heroPhrase: 'Водопады бурлят, горы цветут',
    duration: '7 дней',
    difficulty: 'Medium',
    price: 'от 38 000 ₽',
    description: 'Весной Кавказские горы преображаются: альпийские луга цветут, водопады бурлят от талых вод. Трекинг по классическим маршрутам.',
    program: [
      { timeLabel: 'День 1 · 09:00', description: 'Альпийские луга' },
      { timeLabel: 'День 3 · 11:30', description: 'Водопады' },
      { timeLabel: 'День 4 · 15:00', description: 'Горские сёла' },
      { timeLabel: 'День 6 · 08:00', description: 'Вид на Эльбрус' },
    ],
    includedInPrice: [
      inc('Горный гид и маршрутные разрешения'),
      inc('Ночёвки в гостевых домах по программе'),
      inc('Питание на маршруте'),
      inc('Трансфер к тропе и с тропы'),
      inc('Групповая страховка от несчастного случая — по условиям оферты'),
    ],
    imageUrl: SPRING_TOUR_COVERS['spring-4'],
    galleryImages: [SPRING_TOUR_COVERS['spring-4'], SPRING_TOUR_COVERS['spring-4'], SPRING_TOUR_COVERS['spring-4']],
  },

  // SUMMER — 4 tours
  {
    id: 'summer-1',
    season: 'summer',
    title: 'Камчатка: Вулканы',
    subtitle: 'Восхождение на Авачинский',
    heroPhrase: 'Стоять на краю живого вулкана',
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
    heroPhrase: 'Кристальная вода и бесконечный берег',
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
    heroPhrase: 'Там, где сходятся четыре страны',
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
    heroPhrase: 'Туда, куда не ступала нога туриста',
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
    heroPhrase: 'Лиственницы горят золотом над синими озёрами',
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
    heroPhrase: 'Тишина, краски и запах первых грибов',
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
    heroPhrase: 'Средневековые башни в осенних горах',
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
    heroPhrase: 'Суровый, штормовой, настоящий',
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
