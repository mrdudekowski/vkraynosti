/**
 * Vkraynosti — Google Sheets: каталог туров и расписание.
 *
 * Установка (один раз):
 * 1. Google Таблица ← импорт шаблона xlsx или копия рабочей книги
 * 2. Расширения → Apps Script → вставить Code.gs, Publish.gs и S3Upload.gs
 * 3. Проект → часовой пояс: Asia/Vladivostok
 * 4. Свойства скрипта: S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY
 * 5. Меню «Вкрайности» → «Настроить таблицу (всё)»
 * 6. Публикация на сайт: «Обновить туры» / «Обновить расписание» / «Обновить всё»
 *
 * SSOT статусов: scripts/lib/scheduleSheetLabels.mjs
 * SSOT id туров на сайте: npm run generate:tour-schedule-gas-ids
 */

// <SITE_TOUR_IDS_BEGIN>
var SITE_TOUR_IDS = ["winter-1","winter-2","winter-3","winter-4","winter-5","spring-1","spring-2","spring-3","spring-4","spring-5","spring-6","spring-7","spring-8","spring-9","spring-10","spring-11","spring-12","spring-13","summer-1","summer-2","summer-3","summer-4","summer-5","summer-6","summer-7","summer-8","summer-9","summer-10","summer-11","summer-12","summer-13","summer-14","summer-15","summer-16","summer-17","summer-19","fall-1","fall-2","fall-3","fall-4","fall-5","fall-6","fall-7","fall-8","fall-9","fall-10","fall-11","fall-12","fall-13"];
// <SITE_TOUR_IDS_END>

var SCHEDULE_SHEET_NAMES = [
  'Расписание_Зима',
  'Расписание_Весна',
  'Расписание_Лето',
  'Расписание_Осень',
];

var CATALOG_SHEET_NAMES = ['Туры_Зима', 'Туры_Весна', 'Туры_Лето', 'Туры_Осень'];

/** Пары каталог ↔ расписание (sync: scheduleSheetLabels.mjs CATALOG_SCHEDULE_PAIRS). */
var CATALOG_SCHEDULE_PAIRS = [
  ['Туры_Зима', 'Расписание_Зима'],
  ['Туры_Весна', 'Расписание_Весна'],
  ['Туры_Лето', 'Расписание_Лето'],
  ['Туры_Осень', 'Расписание_Осень'],
];

/** @type {Record<string, string>} */
var STATUS_TO_EXPORT_CODE = {
  'запланирован': 'planned',
  'набор открыт': 'open',
  'мест нет': 'full',
  'отменён': 'cancelled',
  'завершился': 'completed',
};

var TIMEZONE = 'Asia/Vladivostok';

/** sync: scheduleSheetLabels.mjs SCHEDULE_MAX_DATA_ROWS */
var MAX_SCHEDULE_DATA_ROWS = 150;

/** sync: scheduleSheetLabels.mjs CATALOG_MAX_DATA_ROW — последняя строка каталога (вкл.). */
var CATALOG_MAX_DATA_ROW = 80;

var CATALOG_FIRST_DATA_ROW = 2;
var TOUR_PICK_DELIMITER = ' | ';
var META_SHEET_INSTRUCTION = '_Инструкция';
var META_SHEET_AUDIT = '_Проверка';

var DURATION_LIST = ['однодневный', 'многодневный'];

/** sync: scheduleSheetLabels.mjs CATALOG_PUBLICATION_STATUS_VALUES */
var CATALOG_PUBLICATION_STATUS_VALUES = ['активен', 'скрыт', 'в разработке'];

/** sync: scheduleSheetLabels.mjs PUBLICATION_STATUS_TO_EXPORT_CODE — статус тура на сайте (кол. F), не статус выезда (H). */
var PUBLICATION_STATUS_TO_EXPORT_CODE = {
  'активен': 'active',
  'скрыт': 'hidden',
  'в разработке': 'in_development',
};

var CATALOG_PUBLICATION_STATUS_COLUMN = 6;

/**
 * В ru/de и др. локалях Google Таблиц разделитель аргументов — «;», не «,».
 * @param {GoogleAppsScript.Spreadsheet} ss
 * @returns {boolean}
 */
function usesSemicolonFormulas_(ss) {
  var locale = ss.getSpreadsheetLocale() || '';
  return !/^en/i.test(locale);
}

/**
 * setFormula в Apps Script: имена функций — EN (IF, VLOOKUP), разделитель — по локали (; в ru).
 * Не подставлять ЛОЖЬ — с EN-именами нужен FALSE.
 * @param {string} formula
 * @param {GoogleAppsScript.Spreadsheet} ss
 * @returns {string}
 */
function localizeFormula_(formula, ss) {
  var out = formula.charAt(0) === '=' ? formula : '=' + formula;
  if (!usesSemicolonFormulas_(ss)) return out;
  var localized = '';
  var inQuote = false;
  for (var i = 0; i < out.length; i++) {
    var ch = out.charAt(i);
    if (ch === '"') {
      inQuote = !inQuote;
      localized += ch;
    } else if (ch === ',' && !inQuote) {
      localized += ';';
    } else {
      localized += ch;
    }
  }
  return localized;
}

/**
 * Вставка как ручной ввод (setValue) — корректно для ru: EN-имена + «;» + FALSE.
 * setFormula с ЛОЖЬ/русскими именами даёт «Синтаксическая ошибка».
 * @param {GoogleAppsScript.Spreadsheet.Range} range
 * @param {string} enFormula
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 */
function applyFormula_(range, enFormula, ss) {
  range.setValue(localizeFormula_(enFormula, ss));
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Range} range
 * @param {string[][]} enFormulaGrid
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 */
function applyFormulasGrid_(range, enFormulaGrid, ss) {
  var grid = enFormulaGrid.map(function (row) {
    return row.map(function (cell) {
      return localizeFormula_(cell, ss);
    });
  });
  range.setValues(grid);
}

/**
 * @param {number} row
 * @param {string} catalogRange
 * @returns {string}
 */
function scheduleWeekdayFormulaEn_(row) {
  return 'IF(A' + row + '="","",CHOOSE(WEEKDAY(A' + row + ',2),"пн","вт","ср","чт","пт","сб","вс"))';
}

/**
 * @param {number} row
 * @returns {string}
 */
function scheduleTourIdFormulaEn_(row) {
  var delimEscaped = TOUR_PICK_DELIMITER.replace(/"/g, '""');
  var delimLen = TOUR_PICK_DELIMITER.length;
  return (
    'IF(C' +
    row +
    '="","",TRIM(MID(C' +
    row +
    ',SEARCH("' +
    delimEscaped +
    '",C' +
    row +
    ')+' +
    delimLen +
    ',LEN(C' +
    row +
    '))))'
  );
}

/**
 * @param {number} row
 * @param {string} catalogRange
 * @param {number} colIndex
 * @returns {string}
 */
function scheduleVlookupFormulaEn_(row, catalogRange, colIndex) {
  return 'IF(D' + row + '="","",IFERROR(VLOOKUP(D' + row + ',' + catalogRange + ',' + colIndex + ',FALSE),""))';
}

/**
 * @returns {string}
 */
function catalogPickArrayFormulaEn_() {
  return (
    '=ARRAYFORMULA(IF(LEN(A' +
    CATALOG_FIRST_DATA_ROW +
    ':A)=0,"",B' +
    CATALOG_FIRST_DATA_ROW +
    ':B&"' +
    TOUR_PICK_DELIMITER +
    '"&A' +
    CATALOG_FIRST_DATA_ROW +
    ':A))'
  );
}

function installTourScheduleExport() {
  installTourScheduleTableCore_();
  Logger.log('installTourScheduleExport: OK. Таблица настроена. Публикация — меню «Вкрайности».');
}

function installTourScheduleExportForMenu() {
  installTourScheduleTableCore_();
  SpreadsheetApp.getUi().alert(
    'Готово: таблица настроена (каталог, списки туров, даты, формулы расписания).\n\n' +
      'Для публикации на сайт: «Обновить туры» / «Обновить расписание» / «Обновить всё».'
  );
}

function installTourScheduleTableCore_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  removeScheduleTriggers_();
  setupAllTableAutomationsCore_(ss);
}

/** Меню: полная настройка без пересоздания триггера. */
function setupAllTableAutomationsForMenu() {
  setupAllTableAutomationsCore_(SpreadsheetApp.getActiveSpreadsheet());
  SpreadsheetApp.getUi().alert(
    'Готово: подписи каталога, списки туров, формулы расписания, календарь дат, подсказки.\n\n' +
      'Добавьте тур в «Туры_*» (колонки A–D) — он появится в списке «Тур» на «Расписание_*».'
  );
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 */
function setupAllTableAutomationsCore_(ss) {
  ensureInstructionSheet_(ss);
  setupCatalogPublicationStatusValidationCore_(ss);
  setupCatalogTourPickLabelsCore_(ss);
  setupScheduleTourDropdownCore_(ss);
  setupScheduleDerivedFormulasCore_(ss);
  setupScheduleDateValidationCore_();
  applySheetUxCore_(ss);
}

function setupCatalogPublicationStatusValidationForMenu() {
  setupCatalogPublicationStatusValidationCore_(SpreadsheetApp.getActiveSpreadsheet());
  SpreadsheetApp.getUi().alert(
    'Готово: колонка F «Статус на сайте» на листах «Туры_*» — список активен / скрыт / в разработке.\n' +
      'Пустая ячейка = черновик (не публикуется на сайт).'
  );
}

/**
 * Заголовок F1 и валидация F2:F80 на всех «Туры_*».
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 */
function setupCatalogPublicationStatusValidationCore_(ss) {
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(CATALOG_PUBLICATION_STATUS_VALUES, true)
    .setAllowInvalid(false)
    .setHelpText('активен — полная публикация; в разработке — карточка и анонс; скрыт — не на сайте и не в календаре.')
    .build();

  for (var i = 0; i < CATALOG_SHEET_NAMES.length; i++) {
    var sheet = ss.getSheetByName(CATALOG_SHEET_NAMES[i]);
    if (!sheet) continue;
    sheet.getRange(1, CATALOG_PUBLICATION_STATUS_COLUMN).setValue('Статус на сайте');
    sheet
      .getRange(
        CATALOG_FIRST_DATA_ROW,
        CATALOG_PUBLICATION_STATUS_COLUMN,
        CATALOG_MAX_DATA_ROW - CATALOG_FIRST_DATA_ROW + 1,
        1
      )
      .setDataValidation(rule);
  }
}

function setupCatalogTourPickLabelsForMenu() {
  setupCatalogTourPickLabelsCore_(SpreadsheetApp.getActiveSpreadsheet());
  SpreadsheetApp.getUi().alert(
    'Готово: колонка «Подпись списка» (E) на листах «Туры_*» заполняется автоматически.\n' +
      'Вводите только A–D (ID, название, цена, тип).'
  );
}

/**
 * ARRAYFORMULA в E2 — подписи для dropdown без ручных формул в строках.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 */
function setupCatalogTourPickLabelsCore_(ss) {
  for (var i = 0; i < CATALOG_SHEET_NAMES.length; i++) {
    var sheet = ss.getSheetByName(CATALOG_SHEET_NAMES[i]);
    if (!sheet) continue;
    sheet.getRange(CATALOG_FIRST_DATA_ROW, 5, CATALOG_MAX_DATA_ROW - CATALOG_FIRST_DATA_ROW + 1, 1)
      .clearContent();
    applyFormula_(sheet.getRange(CATALOG_FIRST_DATA_ROW, 5), catalogPickArrayFormulaEn_(), ss);
  }
}

function setupScheduleTourDropdownForMenu() {
  setupScheduleTourDropdownCore_(SpreadsheetApp.getActiveSpreadsheet());
  SpreadsheetApp.getUi().alert(
    'Готово: колонка «Тур» на «Расписание_*» берёт список из «Туры_*», колонка E (до строки ' +
      CATALOG_MAX_DATA_ROW +
      ').\nНе редактируйте список через карандаш в ячейке.'
  );
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 */
function setupScheduleTourDropdownCore_(ss) {
  for (var i = 0; i < CATALOG_SCHEDULE_PAIRS.length; i++) {
    var catalogName = CATALOG_SCHEDULE_PAIRS[i][0];
    var scheduleName = CATALOG_SCHEDULE_PAIRS[i][1];
    var catalogSheet = ss.getSheetByName(catalogName);
    var scheduleSheet = ss.getSheetByName(scheduleName);
    if (!catalogSheet || !scheduleSheet) continue;

    var pickRange = catalogSheet.getRange(
      CATALOG_FIRST_DATA_ROW,
      5,
      CATALOG_MAX_DATA_ROW - CATALOG_FIRST_DATA_ROW + 1,
      1
    );

    var rule = SpreadsheetApp.newDataValidation()
      .requireValueInRange(pickRange, true)
      .setAllowInvalid(false)
      .setHelpText('Выберите тур из каталога «' + catalogName + '». Новые туры — добавьте строку в каталог (A–D).')
      .build();

    scheduleSheet.getRange(2, 3, MAX_SCHEDULE_DATA_ROWS, 1).setDataValidation(rule);
  }
}

/**
 * Формулы B, D, E, F на «Расписание_*» (менеджер не вводит).
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 */
function setupScheduleDerivedFormulasCore_(ss) {
  var rowCount = MAX_SCHEDULE_DATA_ROWS;
  /** @type {string[][]} */
  var colB = [];
  /** @type {string[][]} */
  var colD = [];
  /** @type {string[][]} */
  var colE = [];
  /** @type {string[][]} */
  var colF = [];

  for (var i = 0; i < CATALOG_SCHEDULE_PAIRS.length; i++) {
    var catalogName = CATALOG_SCHEDULE_PAIRS[i][0];
    var scheduleName = CATALOG_SCHEDULE_PAIRS[i][1];
    var scheduleSheet = ss.getSheetByName(scheduleName);
    if (!scheduleSheet) continue;

    var catalogRange = "'" + catalogName + "'!$A$" + CATALOG_FIRST_DATA_ROW + ':$D$' + CATALOG_MAX_DATA_ROW;
    colB.length = 0;
    colD.length = 0;
    colE.length = 0;
    colF.length = 0;

    for (var r = 2; r <= 1 + rowCount; r++) {
      colB.push([scheduleWeekdayFormulaEn_(r)]);
      colD.push([scheduleTourIdFormulaEn_(r)]);
      colE.push([scheduleVlookupFormulaEn_(r, catalogRange, 4)]);
      colF.push([scheduleVlookupFormulaEn_(r, catalogRange, 3)]);
    }

    applyFormulasGrid_(scheduleSheet.getRange(2, 2, rowCount, 1), colB, ss);
    applyFormulasGrid_(scheduleSheet.getRange(2, 4, rowCount, 1), colD, ss);
    applyFormulasGrid_(scheduleSheet.getRange(2, 5, rowCount, 1), colE, ss);
    applyFormulasGrid_(scheduleSheet.getRange(2, 6, rowCount, 1), colF, ss);
    scheduleSheet.getRange(2, 6, rowCount, 1).setNumberFormat('# ##0 "₽"');
    scheduleSheet.getRange(2, 1, rowCount, 1).setNumberFormat('dd.mm.yyyy');

    var statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(
        ['запланирован', 'набор открыт', 'мест нет', 'отменён', 'завершился'],
        true
      )
      .setAllowInvalid(false)
      .build();
    scheduleSheet.getRange(2, 8, MAX_SCHEDULE_DATA_ROWS, 1).setDataValidation(statusRule);
  }
}

function setupScheduleDateValidation() {
  setupScheduleDateValidationCore_();
  Logger.log('setupScheduleDateValidation: OK');
}

function setupScheduleDateValidationForMenu() {
  setupScheduleDateValidationCore_();
  SpreadsheetApp.getUi().alert(
    'Готово: колонка «Дата» — календарь по сезону.\nКлик по A → иконка календаря → выбор дня.'
  );
}

/**
 * Диапазоны date between (sync: scripts/lib/seasonDates.mjs).
 * @type {Record<string, { prompt: string, min: { y: number, m: number, d: number }, max: { y: number, m: number, d: number } }>}
 */
var SEASON_DATE_VALIDATION = {
  Расписание_Зима: {
    prompt: 'Клик по ячейке → иконка календаря. Месяцы: Декабрь 2025 – Февраль 2026.',
    min: { y: 2025, m: 12, d: 1 },
    max: { y: 2026, m: 2, d: 28 },
  },
  Расписание_Весна: {
    prompt: 'Клик по ячейке → иконка календаря. Месяцы: Март–Май 2026.',
    min: { y: 2026, m: 3, d: 1 },
    max: { y: 2026, m: 5, d: 31 },
  },
  Расписание_Лето: {
    prompt: 'Клик по ячейке → иконка календаря. Месяцы: Июнь–Август 2026.',
    min: { y: 2026, m: 6, d: 1 },
    max: { y: 2026, m: 8, d: 31 },
  },
  Расписание_Осень: {
    prompt: 'Клик по ячейке → иконка календаря. Месяцы: Сентябрь–Ноябрь 2026.',
    min: { y: 2026, m: 9, d: 1 },
    max: { y: 2026, m: 11, d: 30 },
  },
};

function setupScheduleDateValidationCore_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var scheduleDataRows = MAX_SCHEDULE_DATA_ROWS;

  for (var sheetName in SEASON_DATE_VALIDATION) {
    if (!Object.prototype.hasOwnProperty.call(SEASON_DATE_VALIDATION, sheetName)) continue;
    var config = SEASON_DATE_VALIDATION[sheetName];
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) continue;

    var minDate = dateFromParts_(config.min);
    var maxDate = dateFromParts_(config.max);
    var rule = SpreadsheetApp.newDataValidation()
      .requireDateBetween(minDate, maxDate)
      .setAllowInvalid(false)
      .setHelpText(config.prompt)
      .build();
    sheet.getRange(2, 1, scheduleDataRows, 1).setDataValidation(rule);
    sheet.getRange(2, 1, scheduleDataRows, 1).setNumberFormat('dd.mm.yyyy');
  }
}

/**
 * @param {{ y: number, m: number, d: number }} parts
 * @returns {Date}
 */
function dateFromParts_(parts) {
  return new Date(parts.y, parts.m - 1, parts.d);
}

function runTableHealthCheckForMenu() {
  var report = runTableHealthCheckCore_();
  SpreadsheetApp.getUi().alert(report.summary, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * @returns {{ summary: string, rows: string[][] }}
 */
function runTableHealthCheckCore_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var siteSet = buildSiteTourIdSet_();
  var publicationStatuses = readCatalogPublicationStatuses_(ss);
  /** @type {string[]} */
  var issues = [];
  /** @type {string[]} */
  var warnings = [];

  for (var i = 0; i < CATALOG_SHEET_NAMES.length; i++) {
    var sheet = ss.getSheetByName(CATALOG_SHEET_NAMES[i]);
    if (!sheet) {
      issues.push('Нет листа: ' + CATALOG_SHEET_NAMES[i]);
      continue;
    }
    var rows = sheet.getRange(CATALOG_FIRST_DATA_ROW, 1, CATALOG_MAX_DATA_ROW - 1, 6).getValues();
    for (var r = 0; r < rows.length; r++) {
      var id = normalizeTourId_(rows[r][0], null);
      if (!id) continue;
      var pubCode = publicationStatuses[id] || null;
      var statusRaw = String(rows[r][5] || '').trim();
      if (statusRaw) {
        var normalized = normalizePublicationStatusCode_(statusRaw);
        if (!normalized) {
          issues.push(
            'Каталог «' + sheet.getName() + '» ' + id + ': неверный статус публикации «' + statusRaw + '»'
          );
        }
      }
      if (!siteSet[id] && pubCode && pubCode !== 'hidden') {
        warnings.push(
          'Каталог «' + sheet.getName() + '» ' + id + ': статус «' + pubCode + '», но тура нет в toursData.ts'
        );
      }
      var duration = String(rows[r][3] || '').trim();
      if (duration && DURATION_LIST.indexOf(duration) === -1) {
        issues.push('Каталог «' + sheet.getName() + '» ' + id + ': неверный тип «' + duration + '»');
      }
      if (!String(rows[r][1] || '').trim()) {
        issues.push('Каталог «' + sheet.getName() + '» ' + id + ': пустое название (B)');
      }
    }
  }

  var seenEvents = {};
  for (var s = 0; s < SCHEDULE_SHEET_NAMES.length; s++) {
    var sched = ss.getSheetByName(SCHEDULE_SHEET_NAMES[s]);
    if (!sched) continue;
    var lastRow = getScheduleLastDataRow_(sched);
    if (lastRow < 2) continue;
    var data = sched.getRange(2, 1, lastRow - 1, 9).getValues();
    for (var j = 0; j < data.length; j++) {
      var dateIso = formatDateIso_(data[j][0]);
      var tourId = normalizeTourId_(data[j][3], data[j][2]);
      var statusRu = String(data[j][7] || '').trim().toLowerCase();
      if (!dateIso && !tourId && !statusRu) continue;
      if (tourId && publicationStatuses[tourId] === 'hidden' && dateIso && statusRu) {
        issues.push(
          'Расписание «' + sched.getName() + '» строка ' + (j + 2) + ': выезд для скрытого тура ' + tourId
        );
      }
      if (tourId && !siteSet[tourId] && publicationStatuses[tourId] !== 'hidden') {
        warnings.push('Расписание «' + sched.getName() + '» строка ' + (j + 2) + ': ' + tourId + ' — нет на сайте');
      }
      if (tourId && !dateIso) {
        issues.push('Расписание «' + sched.getName() + '» строка ' + (j + 2) + ': выбран тур, нет даты');
      }
      if (dateIso && tourId && statusRu) {
        var key = dateIso + '|' + tourId;
        if (seenEvents[key]) {
          warnings.push('Дубликат: ' + dateIso + ' + ' + tourId + ' (' + sched.getName() + ')');
        }
        seenEvents[key] = true;
      }
      if (statusRu && !STATUS_TO_EXPORT_CODE[statusRu]) {
        issues.push('Расписание «' + sched.getName() + '» строка ' + (j + 2) + ': неверный статус');
      }
    }
  }

  writeAuditSheet_(ss, issues, warnings);

  var summary =
    'Проверка завершена.\n' +
    'Ошибки: ' +
    issues.length +
    '\nПредупреждения: ' +
    warnings.length +
    '\n\nПодробности на листе «' +
    META_SHEET_AUDIT +
    '».';

  return { summary: summary, rows: [] };
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {string[]} issues
 * @param {string[]} warnings
 */
function writeAuditSheet_(ss, issues, warnings) {
  var sheet = ss.getSheetByName(META_SHEET_AUDIT);
  if (!sheet) {
    sheet = ss.insertSheet(META_SHEET_AUDIT);
  }
  sheet.clear();
  sheet.getRange(1, 1, 1, 2).setValues([['Уровень', 'Сообщение']]);
  sheet.getRange(1, 1, 1, 2).setFontWeight('bold');
  /** @type {string[][]} */
  var rows = [];
  issues.forEach(function (msg) {
    rows.push(['Ошибка', msg]);
  });
  warnings.forEach(function (msg) {
    rows.push(['Предупреждение', msg]);
  });
  if (rows.length === 0) {
    rows.push(['OK', 'Критичных замечаний нет']);
  }
  sheet.getRange(2, 1, rows.length, 2).setValues(rows);
}

/**
 * @returns {Object<string, boolean>}
 */
function buildSiteTourIdSet_() {
  var set = {};
  if (!SITE_TOUR_IDS || SITE_TOUR_IDS.length === 0) {
    Logger.log('SITE_TOUR_IDS пуст — запустите npm run generate:tour-schedule-gas-ids и вставьте блок в Code.gs');
    return set;
  }
  for (var i = 0; i < SITE_TOUR_IDS.length; i++) {
    set[SITE_TOUR_IDS[i]] = true;
  }
  return set;
}

/**
 * Подсказки в заголовках + мягкая защита формул.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 */
function applySheetUxCore_(ss) {
  var catalogNotes = {
    1: 'Формат: winter-1, summer-12. Не меняйте после появления в расписании.',
    2: 'Название для dropdown и сайта.',
    3: 'Число в ₽ или пусто (по запросу).',
    4: 'однодневный или многодневный',
    5: 'Заполняется автоматически — не редактировать',
    6: 'активен / в разработке / скрыт. Пусто = черновик. Публикация — меню «Обновить туры».',
  };

  for (var i = 0; i < CATALOG_SHEET_NAMES.length; i++) {
    var cat = ss.getSheetByName(CATALOG_SHEET_NAMES[i]);
    if (!cat) continue;
    for (var col in catalogNotes) {
      if (Object.prototype.hasOwnProperty.call(catalogNotes, col)) {
        cat.getRange(1, Number(col)).setNote(catalogNotes[col]);
      }
    }
    protectRangeWarningOnly_(cat.getRange(1, 5, CATALOG_MAX_DATA_ROW, 1), 'Подпись списка — формула');
  }

  var scheduleNotes = {
    1: 'Календарь сезона — клик по ячейке → иконка справа',
    3: 'Выбор из каталога сезона',
    4: 'Подставляется из «Тур»',
    5: 'Из каталога',
    6: 'Из каталога (можно переопределить в строке)',
    7: 'Число мест или пусто',
    8: 'запланирован / набор открыт / мест нет / отменён / завершился',
  };

  for (var p = 0; p < CATALOG_SCHEDULE_PAIRS.length; p++) {
    var sched = ss.getSheetByName(CATALOG_SCHEDULE_PAIRS[p][1]);
    if (!sched) continue;
    for (var sc in scheduleNotes) {
      if (Object.prototype.hasOwnProperty.call(scheduleNotes, sc)) {
        sched.getRange(1, Number(sc)).setNote(scheduleNotes[sc]);
      }
    }
    var lastRow = 1 + MAX_SCHEDULE_DATA_ROWS;
    protectRangeWarningOnly_(sched.getRange(2, 2, lastRow - 1, 1), 'День недели — формула');
    protectRangeWarningOnly_(sched.getRange(2, 4, lastRow - 1, 3), 'ID, тип, цена — формулы');
  }
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Range} range
 * @param {string} description
 */
function protectRangeWarningOnly_(range, description) {
  var protection = range.protect().setDescription(description);
  protection.setWarningOnly(true);
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 */
function ensureInstructionSheet_(ss) {
  var sheet = ss.getSheetByName(META_SHEET_INSTRUCTION);
  if (!sheet) {
    sheet = ss.insertSheet(META_SHEET_INSTRUCTION, 0);
  }
  sheet.clear();
  var lines = [
    ['Вкрайности — расписание туров'],
    [''],
    ['1. Добавить тур в сезон'],
    ['   Лист «Туры_Зима» / «Туры_Весна» / «Туры_Лето» / «Туры_Осень»'],
    ['   Заполните: A = ID (summer-3), B = название, C = цена, D = тип из списка, F = статус на сайте'],
    ['   Колонку E не трогайте — подпись для списка появится сама'],
    ['   F: активен (по умолчанию), в разработке, скрыт — меню «Настроить статус публикации»'],
    [''],
    ['2. Добавить выезд'],
    ['   Лист «Расписание_*» того же сезона'],
    ['   A = дата (календарь), C = тур из списка, G = места, H = статус'],
    ['   Колонки B, D, E, F не редактируйте'],
    [''],
    ['3. Публикация на сайт'],
    ['   Меню «Вкрайности» → «Обновить туры» / «Обновить расписание» / «Обновить всё»'],
    [''],
    ['4. Если тур не в dropdown'],
    ['   Меню → «Настроить таблицу (всё)» или «Настроить списки туров»'],
    ['   Не редактируйте список «Тур» через карандаш в ячейке'],
    [''],
    ['5. Тур есть в таблице, но не на сайте'],
    ['   Меню → «Проверить таблицу» — предупреждение; добавьте тур в toursData.ts на сайте'],
  ];
  sheet.getRange(1, 1, lines.length, 1).setValues(lines);
  sheet.setColumnWidth(1, 520);
}

/**
 * Каталог Туры_*: кол. A (id), F (статус на сайте). Для проверки таблицы.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @returns {Object<string, string>}
 */
function readCatalogPublicationStatuses_(ss) {
  /** @type {Object<string, string>} */
  var publicationStatuses = {};

  for (var i = 0; i < CATALOG_SHEET_NAMES.length; i++) {
    var sheet = ss.getSheetByName(CATALOG_SHEET_NAMES[i]);
    if (!sheet) continue;

    var rows = sheet
      .getRange(
        CATALOG_FIRST_DATA_ROW,
        1,
        CATALOG_MAX_DATA_ROW - CATALOG_FIRST_DATA_ROW + 1,
        CATALOG_PUBLICATION_STATUS_COLUMN
      )
      .getValues();

    for (var r = 0; r < rows.length; r++) {
      var tourId = normalizeTourId_(rows[r][0], null);
      if (!tourId) continue;

      var statusRaw = String(rows[r][CATALOG_PUBLICATION_STATUS_COLUMN - 1] || '').trim();
      var code = normalizePublicationStatusCode_(statusRaw);
      if (!code) continue;
      publicationStatuses[tourId] = code;
    }
  }

  return publicationStatuses;
}

/**
 * @param {string} statusRaw
 * @returns {string|null}
 */
function normalizePublicationStatusCode_(statusRaw) {
  var normalized = String(statusRaw || '')
    .trim()
    .toLowerCase();
  if (!normalized) return null;
  return PUBLICATION_STATUS_TO_EXPORT_CODE[normalized] || null;
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @returns {number}
 */
function getScheduleLastDataRow_(sheet) {
  var sheetLastRow = sheet.getLastRow();
  if (sheetLastRow < 2) return 1;

  var cappedLastRow = Math.min(sheetLastRow, 1 + MAX_SCHEDULE_DATA_ROWS);
  var colA = sheet.getRange(2, 1, cappedLastRow - 1, 1).getValues();
  for (var i = colA.length - 1; i >= 0; i--) {
    var cell = colA[i][0];
    if (cell !== '' && cell !== null) return i + 2;
  }
  return 1;
}

/**
 * @param {*} value
 * @returns {string|null}
 */
function formatDateIso_(value) {
  if (value === null || value === undefined || value === '') return null;
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, TIMEZONE, 'yyyy-MM-dd');
  }
  var s = String(value).trim();
  var dot = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dot) return dot[3] + '-' + dot[2] + '-' + dot[1];
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return null;
}

/**
 * @param {*} tourIdCell
 * @param {*} tourPickCell
 * @returns {string}
 */
function normalizeTourId_(tourIdCell, tourPickCell) {
  var id = String(tourIdCell || '').trim();
  if (/^[a-z]+-\d+$/.test(id)) return id;
  var pick = String(tourPickCell || '').trim();
  if (!pick) return '';
  var match = pick.match(/\|\s*([a-z]+-\d+)\s*$/);
  return match ? match[1] : '';
}

/**
 * @param {*} value
 * @returns {number|null}
 */
function normalizeNumberOrNull_(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number' && !isNaN(value)) return value;
  var digits = String(value).replace(/\s/g, '').match(/\d+/);
  return digits ? Number.parseInt(digits[0], 10) : null;
}

function removeScheduleTriggers_() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'onScheduleEdit') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}

function repairScheduleFormulasForMenu() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  setupCatalogTourPickLabelsCore_(ss);
  setupScheduleDerivedFormulasCore_(ss);
  SpreadsheetApp.getUi().alert(
    'Формулы перезаписаны (EN-функции, разделитель «;», FALSE).\n' +
      'Если ошибка осталась — проверьте Файл → Настройки: локаль «Россия».'
  );
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Вкрайности')
    .addItem('Обновить туры', 'publishToursJsonForMenu')
    .addItem('Обновить расписание', 'publishScheduleJsonForMenu')
    .addItem('Обновить всё', 'publishAllJsonForMenu')
    .addSeparator()
    .addItem('Проверить таблицу', 'runTableHealthCheckForMenu')
    .addItem('Исправить формулы (#ERROR!)', 'repairScheduleFormulasForMenu')
    .addSeparator()
    .addItem('Настроить таблицу (всё)', 'setupAllTableAutomationsForMenu')
    .addItem('Настроить списки туров (колонка C)', 'setupScheduleTourDropdownForMenu')
    .addItem('Настроить каталог (подписи E)', 'setupCatalogTourPickLabelsForMenu')
    .addItem('Настроить статус публикации (колонка F)', 'setupCatalogPublicationStatusValidationForMenu')
    .addItem('Настроить календарь дат (колонка A)', 'setupScheduleDateValidationForMenu')
    .addToUi();
}
