/**
 * Vkraynosti — экспорт расписания туров в JSON для календаря на сайте.
 *
 * Установка (один раз):
 * 1. Google Таблица ← импорт шаблона xlsx или копия рабочей книги
 * 2. Расширения → Apps Script → вставить этот файл
 * 3. Проект → часовой пояс: Asia/Vladivostok
 * 4. Меню «Вкрайности» → «Настроить таблицу (всё)» (или Run installTourScheduleExport)
 * 5. Опубликовать → Web App (Execute as: Me, Access: Anyone) → VITE_TOUR_SCHEDULE_ENDPOINT_URL
 *
 * SSOT статусов: scripts/lib/scheduleSheetLabels.mjs → STATUS_TO_EXPORT_CODE
 * SSOT id туров на сайте: npm run generate:tour-schedule-gas-ids
 */

// <SITE_TOUR_IDS_BEGIN>
var SITE_TOUR_IDS = ["winter-1","winter-2","winter-3","winter-4","winter-5","spring-1","spring-2","spring-3","spring-4","spring-5","spring-6","spring-7","spring-8","spring-9","spring-10","spring-11","spring-12","spring-13","summer-1","summer-2","summer-3","summer-4","summer-5","summer-6","summer-7","summer-8","summer-9","summer-10","summer-11","summer-12","fall-1","fall-2","fall-3","fall-4","fall-5","fall-6","fall-7","fall-8","fall-9","fall-10","fall-11","fall-12","fall-13"];
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

var CACHE_KEY = 'tourScheduleJson';
var CACHE_TTL_SEC = 21600;
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

/**
 * Web App entry — GET JSON для сайта.
 * @param {GoogleAppsScript.Events.DoGet} _e
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function doGet(_e) {
  var json = getCachedScheduleJson_();
  if (!json) {
    json = rebuildScheduleCache_();
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Installable onEdit — пересборка кэша при изменениях в расписании.
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e
 */
function onScheduleEdit(e) {
  if (!e || !e.range) return;
  var sheet = e.range.getSheet();
  if (!sheet) return;
  var name = sheet.getName();

  if (CATALOG_SHEET_NAMES.indexOf(name) !== -1) {
    rebuildCatalogPricesInCache_();
    return;
  }

  if (SCHEDULE_SHEET_NAMES.indexOf(name) === -1) return;
  rebuildScheduleCache_(true);
}

function installTourScheduleExport() {
  installTourScheduleExportCore_();
  Logger.log(
    'installTourScheduleExport: OK. Триггер onScheduleEdit, автоматизации таблицы, кэш.\n' +
      'Опубликуйте Web App (doGet) → VITE_TOUR_SCHEDULE_ENDPOINT_URL.'
  );
}

function installTourScheduleExportForMenu() {
  installTourScheduleExportCore_();
  SpreadsheetApp.getUi().alert(
    'Готово: таблица настроена (каталог, списки туров, даты, формулы расписания, авто-JSON).\n\n' +
      'Опубликуйте Web App (doGet) и укажите URL в VITE_TOUR_SCHEDULE_ENDPOINT_URL.'
  );
}

function installTourScheduleExportCore_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  removeScheduleTriggers_();
  setupAllTableAutomationsCore_(ss);
  ScriptApp.newTrigger('onScheduleEdit').forSpreadsheet(ss).onEdit().create();
  rebuildScheduleCache_();
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
  setupCatalogTourPickLabelsCore_(ss);
  setupScheduleTourDropdownCore_(ss);
  setupScheduleDerivedFormulasCore_(ss);
  setupScheduleDateValidationCore_();
  applySheetUxCore_(ss);
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

function rebuildScheduleCacheManual() {
  rebuildScheduleCache_(false);
  SpreadsheetApp.getUi().alert('Кэш расписания обновлён.');
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
    var rows = sheet.getRange(CATALOG_FIRST_DATA_ROW, 1, CATALOG_MAX_DATA_ROW - 1, 4).getValues();
    for (var r = 0; r < rows.length; r++) {
      var id = normalizeTourId_(rows[r][0], null);
      if (!id) continue;
      if (!siteSet[id]) {
        warnings.push('Каталог «' + sheet.getName() + '» строка ' + (r + CATALOG_FIRST_DATA_ROW) + ': ' + id + ' — нет на сайте');
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
      if (tourId && !siteSet[tourId]) {
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
    ['   Заполните: A = ID (summer-3), B = название, C = цена, D = тип из списка'],
    ['   Колонку E не трогайте — подпись для списка появится сама'],
    [''],
    ['2. Добавить выезд'],
    ['   Лист «Расписание_*» того же сезона'],
    ['   A = дата (календарь), C = тур из списка, G = места, H = статус'],
    ['   Колонки B, D, E, F не редактируйте'],
    [''],
    ['3. JSON для сайта'],
    ['   Меню «Вкрайности» → обновляется при правках; «Обновить JSON сейчас» — вручную'],
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
 * @returns {string|null}
 */
function getCachedScheduleJson_() {
  return CacheService.getScriptCache().get(CACHE_KEY);
}

function rebuildCatalogPricesInCache_() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    Logger.log('rebuildCatalogPricesInCache_: lock busy, skip.');
    return;
  }

  try {
    SpreadsheetApp.flush();
    var cached = getCachedScheduleJson_();
    /** @type {{ events: Object[], prices: Object<string, number>, durationTypes: Object<string, string> }} */
    var payload = cached ? JSON.parse(cached) : { events: [], prices: {}, durationTypes: {} };
    if (!payload.events) payload.events = [];

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    payload.prices = readCatalogPrices_(ss);
    payload.durationTypes = readCatalogDurationTypes_(ss);
    var json = JSON.stringify(payload);
    CacheService.getScriptCache().put(CACHE_KEY, json, CACHE_TTL_SEC);
    Logger.log(
      'rebuildCatalogPricesInCache_: events=' +
        payload.events.length +
        ' (unchanged), prices=' +
        Object.keys(payload.prices).length +
        ', durationTypes=' +
        Object.keys(payload.durationTypes).length
    );
  } catch (err) {
    Logger.log('rebuildCatalogPricesInCache_: ' + err);
  } finally {
    lock.releaseLock();
  }
}

/**
 * @param {boolean=} fromEdit
 * @returns {string}
 */
function rebuildScheduleCache_(fromEdit) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    Logger.log('rebuildScheduleCache_: другой запуск уже идёт, пропуск.');
    var cached = getCachedScheduleJson_();
    if (cached) return cached;
    return JSON.stringify({ events: [], prices: {}, durationTypes: {} });
  }

  try {
    if (fromEdit) {
      SpreadsheetApp.flush();
      Utilities.sleep(800);
    }

    var events = [];
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    for (var i = 0; i < SCHEDULE_SHEET_NAMES.length; i++) {
      var sheetName = SCHEDULE_SHEET_NAMES[i];
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) continue;
      events = events.concat(readScheduleSheet_(sheet));
    }

    events.sort(function (a, b) {
      if (a.date === b.date) return a.tourId.localeCompare(b.tourId);
      return a.date.localeCompare(b.date);
    });

    var prices = readCatalogPrices_(ss);
    var durationTypes = readCatalogDurationTypes_(ss);
    var payload = JSON.stringify({ events: events, prices: prices, durationTypes: durationTypes });
    CacheService.getScriptCache().put(CACHE_KEY, payload, CACHE_TTL_SEC);
    Logger.log(
      'rebuildScheduleCache_: events=' +
        events.length +
        ', prices=' +
        Object.keys(prices).length +
        ', durationTypes=' +
        Object.keys(durationTypes).length
    );
    return payload;
  } finally {
    lock.releaseLock();
  }
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @returns {Object[]}
 */
function readScheduleSheet_(sheet) {
  var lastRow = getScheduleLastDataRow_(sheet);
  if (lastRow < 2) return [];

  var numRows = lastRow - 1;
  var rows = sheet.getRange(2, 1, numRows, 9).getValues();
  /** @type {Object[]} */
  var events = [];

  for (var r = 0; r < rows.length; r++) {
    var row = rows[r];
    var dateRaw = row[0];
    var tourId = normalizeTourId_(row[3], row[2]);
    var durationType = String(row[4] || '').trim();
    var priceRub = normalizeNumberOrNull_(row[5]);
    var seats = normalizeNumberOrNull_(row[6]);
    var statusRu = String(row[7] || '').trim().toLowerCase();
    var commentRaw = row[8];
    var comment =
      commentRaw === null || commentRaw === undefined || commentRaw === ''
        ? null
        : String(commentRaw).trim();

    if (!dateRaw && !tourId && !statusRu) continue;

    var dateIso = formatDateIso_(dateRaw);
    var statusCode = STATUS_TO_EXPORT_CODE[statusRu];

    if (!dateIso || !tourId || !statusCode) continue;
    if (durationType !== 'однодневный' && durationType !== 'многодневный') continue;

    events.push({
      date: dateIso,
      tourId: tourId,
      durationType: durationType,
      priceRub: priceRub,
      seats: seats,
      status: statusCode,
      comment: comment,
    });
  }

  return events;
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @returns {Object<string, number>}
 */
function readCatalogPrices_(ss) {
  /** @type {Object<string, number>} */
  var prices = {};

  for (var i = 0; i < CATALOG_SHEET_NAMES.length; i++) {
    var sheet = ss.getSheetByName(CATALOG_SHEET_NAMES[i]);
    if (!sheet) continue;

    var rows = sheet
      .getRange(CATALOG_FIRST_DATA_ROW, 1, CATALOG_MAX_DATA_ROW - CATALOG_FIRST_DATA_ROW + 1, 3)
      .getValues();

    for (var r = 0; r < rows.length; r++) {
      var tourId = normalizeTourId_(rows[r][0], null);
      if (!tourId) continue;

      var priceRub = normalizeNumberOrNull_(rows[r][2]);
      if (priceRub != null) prices[tourId] = priceRub;
    }
  }

  return prices;
}

/**
 * Каталог Туры_*: кол. A (id), D (однодневный | многодневный). sync: scheduleSheetLabels.mjs CATALOG_HEADERS.
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @returns {Object<string, string>}
 */
function readCatalogDurationTypes_(ss) {
  /** @type {Object<string, string>} */
  var durationTypes = {};

  for (var i = 0; i < CATALOG_SHEET_NAMES.length; i++) {
    var sheet = ss.getSheetByName(CATALOG_SHEET_NAMES[i]);
    if (!sheet) continue;

    var rows = sheet
      .getRange(CATALOG_FIRST_DATA_ROW, 1, CATALOG_MAX_DATA_ROW - CATALOG_FIRST_DATA_ROW + 1, 4)
      .getValues();

    for (var r = 0; r < rows.length; r++) {
      var tourId = normalizeTourId_(rows[r][0], null);
      if (!tourId) continue;

      var durationType = String(rows[r][3] || '').trim();
      if (durationType !== 'однодневный' && durationType !== 'многодневный') {
        if (durationType) {
          Logger.log(
            'readCatalogDurationTypes_: skip invalid type for ' + tourId + ': ' + durationType
          );
        }
        continue;
      }
      durationTypes[tourId] = durationType;
    }
  }

  return durationTypes;
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
    .addItem('Настроить таблицу (всё)', 'setupAllTableAutomationsForMenu')
    .addItem('Исправить формулы (#ERROR!)', 'repairScheduleFormulasForMenu')
    .addSeparator()
    .addItem('Установить автообновление (onEdit)', 'installTourScheduleExportForMenu')
    .addItem('Настроить списки туров (колонка C)', 'setupScheduleTourDropdownForMenu')
    .addItem('Настроить каталог (подписи E)', 'setupCatalogTourPickLabelsForMenu')
    .addItem('Настроить календарь дат (колонка A)', 'setupScheduleDateValidationForMenu')
    .addSeparator()
    .addItem('Проверить таблицу', 'runTableHealthCheckForMenu')
    .addItem('Обновить JSON сейчас', 'rebuildScheduleCacheManual')
    .addToUi();
}
