/**
 * Ручная публикация tours_list.json и schedule.json в S3.
 * Свойства скрипта: S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY (см. S3Upload.gs).
 */

var SCHEMA_VERSION = 1;

var AUDIT_LEVEL_DRAFT = 'Черновик';
var AUDIT_LEVEL_WARNING = 'Предупреждение';
var AUDIT_LEVEL_ERROR = 'Ошибка';
var AUDIT_LEVEL_OK = 'OK';

/**
 * @param {function(): *} callback
 * @returns {*}
 */
function withPublishLock_(callback) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    throw new Error('Публикация уже выполняется. Повторите попытку позже.');
  }
  try {
    return callback();
  } finally {
    lock.releaseLock();
  }
}

function publishToursJsonForMenu() {
  try {
    var result = withPublishLock_(publishToursCore_);
    SpreadsheetApp.getUi().alert(formatToursPublishMessage_(result));
  } catch (err) {
    SpreadsheetApp.getUi().alert('Ошибка публикации туров:\n\n' + String(err.message || err));
  }
}

function publishScheduleJsonForMenu() {
  try {
    var result = withPublishLock_(publishScheduleCore_);
    SpreadsheetApp.getUi().alert(formatSchedulePublishMessage_(result));
  } catch (err) {
    SpreadsheetApp.getUi().alert('Ошибка публикации расписания:\n\n' + String(err.message || err));
  }
}

function publishAllJsonForMenu() {
  try {
    withPublishLock_(function () {
      var toursResult = publishToursCore_();
      try {
        var scheduleResult = publishScheduleCore_();
        SpreadsheetApp.getUi().alert(
          formatAllPublishSuccessMessage_(toursResult, scheduleResult)
        );
      } catch (scheduleErr) {
        SpreadsheetApp.getUi().alert(
          formatPartialPublishMessage_(toursResult, scheduleErr)
        );
      }
    });
  } catch (err) {
    SpreadsheetApp.getUi().alert('Ошибка публикации:\n\n' + String(err.message || err));
  }
}

/**
 * @returns {Object}
 */
function publishToursCore_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var built = buildToursListPayload_(ss);
  writePublishAuditSheet_(ss, built.audit);
  var upload = publishJsonToS3_('tours', built.payload);
  return { built: built, upload: upload };
}

/**
 * @returns {Object}
 */
function publishScheduleCore_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var catalog = readPublishedToursForScheduleFilter_(ss);
  var built = buildSchedulePayload_(ss, catalog);
  writePublishAuditSheet_(ss, built.audit);
  var upload = publishJsonToS3_('schedule', built.payload);
  return { built: built, upload: upload };
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @returns {Object}
 */
function buildToursListPayload_(ss) {
  /** @type {Object[]} */
  var audit = [];
  var stats = { published: 0, draft: 0, hidden: 0, invalid: 0 };
  /** @type {Object[]} */
  var tours = [];
  /** @type {Object<string, boolean>} */
  var seenIds = {};

  for (var i = 0; i < CATALOG_SHEET_NAMES.length; i++) {
    var sheetName = CATALOG_SHEET_NAMES[i];
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      audit.push(auditEntry_(AUDIT_LEVEL_ERROR, 'Система', '—', '—', '—', 'Не найден лист ' + sheetName));
      throw new Error('Не найден лист: ' + sheetName);
    }

    var rows = sheet
      .getRange(
        CATALOG_FIRST_DATA_ROW,
        1,
        CATALOG_MAX_DATA_ROW - CATALOG_FIRST_DATA_ROW + 1,
        CATALOG_PUBLICATION_STATUS_COLUMN
      )
      .getValues();

    for (var r = 0; r < rows.length; r++) {
      var rowIndex = CATALOG_FIRST_DATA_ROW + r;
      var row = rows[r];
      var rowAudit = processCatalogRowForPublish_(
        sheetName,
        rowIndex,
        row,
        seenIds,
        stats
      );
      audit = audit.concat(rowAudit.audit);
      if (rowAudit.tour) tours.push(rowAudit.tour);
    }
  }

  tours.sort(function (a, b) {
    return a.id.localeCompare(b.id);
  });

  return {
    payload: {
      schemaVersion: SCHEMA_VERSION,
      generatedAt: new Date().toISOString(),
      tours: tours,
    },
    stats: stats,
    audit: audit,
  };
}

/**
 * @param {string} sheetName
 * @param {number} rowIndex
 * @param {*[]} row
 * @param {Object<string, boolean>} seenIds
 * @param {Object} stats
 * @returns {{ tour: (Object|null), audit: Object[] }}
 */
function processCatalogRowForPublish_(sheetName, rowIndex, row, seenIds, stats) {
  /** @type {Object[]} */
  var audit = [];
  if (isCatalogRowFullyEmpty_(row)) return { tour: null, audit: audit };

  var tourId = normalizeTourId_(row[0], null);
  var title = String(row[1] || '').trim();
  var durationType = String(row[3] || '').trim();
  var statusRaw = String(row[5] || '').trim();
  var pubClass = classifyTourPublicationForPublish_(statusRaw);

  if (!tourId) {
    if (catalogRowHasAnyData_(row)) {
      stats.draft++;
      audit.push(
        auditEntry_(
          AUDIT_LEVEL_DRAFT,
          'Тур',
          sheetName,
          rowIndex,
          String(row[0] || '—'),
          'Частично заполненная строка или некорректный ID'
        )
      );
    }
    return { tour: null, audit: audit };
  }

  if (pubClass === 'draft') {
    stats.draft++;
    audit.push(
      auditEntry_(AUDIT_LEVEL_DRAFT, 'Тур', sheetName, rowIndex, tourId, 'Не указан статус публикации')
    );
    return { tour: null, audit: audit };
  }

  if (pubClass === 'hidden') {
    stats.hidden++;
    return { tour: null, audit: audit };
  }

  if (pubClass === 'invalid') {
    stats.invalid++;
    audit.push(
      auditEntry_(
        AUDIT_LEVEL_WARNING,
        'Тур',
        sheetName,
        rowIndex,
        tourId,
        'Неизвестный статус публикации «' + statusRaw + '»'
      )
    );
    return { tour: null, audit: audit };
  }

  if (!title || !durationType) {
    stats.draft++;
    audit.push(
      auditEntry_(
        AUDIT_LEVEL_DRAFT,
        'Тур',
        sheetName,
        rowIndex,
        tourId,
        'Не заполнены обязательные поля (название или тип тура)'
      )
    );
    return { tour: null, audit: audit };
  }

  if (DURATION_LIST.indexOf(durationType) === -1) {
    stats.invalid++;
    audit.push(
      auditEntry_(
        AUDIT_LEVEL_WARNING,
        'Тур',
        sheetName,
        rowIndex,
        tourId,
        'Некорректный тип тура «' + durationType + '»'
      )
    );
    return { tour: null, audit: audit };
  }

  var priceRub = normalizeNumberOrNull_(row[2]);
  if (priceRub != null && priceRub < 0) {
    stats.invalid++;
    audit.push(
      auditEntry_(AUDIT_LEVEL_WARNING, 'Тур', sheetName, rowIndex, tourId, 'Отрицательная цена')
    );
    return { tour: null, audit: audit };
  }

  if (seenIds[tourId]) {
    stats.invalid++;
    audit.push(
      auditEntry_(AUDIT_LEVEL_WARNING, 'Тур', sheetName, rowIndex, tourId, 'Повторяющийся ID тура')
    );
    return { tour: null, audit: audit };
  }
  seenIds[tourId] = true;

  stats.published++;
  return {
    tour: {
      id: tourId,
      title: title,
      priceRub: priceRub,
      durationType: durationType,
      publicationStatus: pubClass,
    },
    audit: audit,
  };
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @returns {Object<string, string>}
 */
function readPublishedToursForScheduleFilter_(ss) {
  var built = buildToursListPayload_(ss);
  /** @type {Object<string, string>} */
  var map = {};
  built.payload.tours.forEach(function (tour) {
    map[tour.id] = tour.publicationStatus;
  });
  return map;
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {Object<string, string>} publishedTourMap
 * @returns {Object}
 */
function buildSchedulePayload_(ss, publishedTourMap) {
  /** @type {Object[]} */
  var audit = [];
  var stats = { published: 0, draft: 0, hiddenTour: 0, invalid: 0 };
  /** @type {Object[]} */
  var events = [];
  /** @type {Object<string, boolean>} */
  var seenKeys = {};

  for (var i = 0; i < SCHEDULE_SHEET_NAMES.length; i++) {
    var sheetName = SCHEDULE_SHEET_NAMES[i];
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      audit.push(auditEntry_(AUDIT_LEVEL_ERROR, 'Система', '—', '—', '—', 'Не найден лист ' + sheetName));
      throw new Error('Не найден лист: ' + sheetName);
    }

    var rows = sheet.getRange(2, 1, MAX_SCHEDULE_DATA_ROWS, 9).getValues();
    for (var r = 0; r < rows.length; r++) {
      var rowIndex = r + 2;
      var rowResult = processScheduleRowForPublish_(
        sheetName,
        rowIndex,
        rows[r],
        publishedTourMap,
        seenKeys,
        stats
      );
      audit = audit.concat(rowResult.audit);
      if (rowResult.event) events.push(rowResult.event);
    }
  }

  events.sort(function (a, b) {
    if (a.date === b.date) return a.tourId.localeCompare(b.tourId);
    return a.date.localeCompare(b.date);
  });

  return {
    payload: {
      schemaVersion: SCHEMA_VERSION,
      generatedAt: new Date().toISOString(),
      events: events,
    },
    stats: stats,
    audit: audit,
  };
}

/**
 * @param {string} sheetName
 * @param {number} rowIndex
 * @param {*[]} row
 * @param {Object<string, string>} publishedTourMap
 * @param {Object<string, boolean>} seenKeys
 * @param {Object} stats
 * @returns {{ event: (Object|null), audit: Object[] }}
 */
function processScheduleRowForPublish_(sheetName, rowIndex, row, publishedTourMap, seenKeys, stats) {
  /** @type {Object[]} */
  var audit = [];
  if (isScheduleRowFullyEmpty_(row)) return { event: null, audit: audit };

  var dateIso = formatDateIso_(row[0]);
  var tourId = normalizeTourId_(row[3], row[2]);
  var statusRu = String(row[7] || '').trim().toLowerCase();
  var hasDate = dateIso !== null && dateIso !== '';
  var hasTour = tourId !== '';
  var hasStatus = statusRu !== '';

  if (!hasStatus) {
    if (hasDate || hasTour || String(row[8] || '').trim() || String(row[6] || '').trim()) {
      stats.draft++;
      audit.push(
        auditEntry_(AUDIT_LEVEL_DRAFT, 'Расписание', sheetName, rowIndex, tourId || '—', 'Не указан статус выезда')
      );
    }
    return { event: null, audit: audit };
  }

  if (!hasDate || !hasTour) {
    stats.draft++;
    audit.push(
      auditEntry_(AUDIT_LEVEL_DRAFT, 'Расписание', sheetName, rowIndex, tourId || '—', 'Не заполнены дата или тур')
    );
    return { event: null, audit: audit };
  }

  if (!dateIso) {
    stats.invalid++;
    audit.push(
      auditEntry_(AUDIT_LEVEL_WARNING, 'Расписание', sheetName, rowIndex, tourId, 'Некорректный формат даты')
    );
    return { event: null, audit: audit };
  }

  var statusCode = STATUS_TO_EXPORT_CODE[statusRu];
  if (!statusCode) {
    stats.invalid++;
    audit.push(
      auditEntry_(
        AUDIT_LEVEL_WARNING,
        'Расписание',
        sheetName,
        rowIndex,
        tourId,
        'Неизвестный статус выезда «' + String(row[7] || '').trim() + '»'
      )
    );
    return { event: null, audit: audit };
  }

  var pubStatus = publishedTourMap[tourId];
  if (!pubStatus) {
    stats.hiddenTour++;
    audit.push(
      auditEntry_(
        AUDIT_LEVEL_WARNING,
        'Расписание',
        sheetName,
        rowIndex,
        tourId,
        'Выезд не опубликован: тур отсутствует в каталоге или скрыт'
      )
    );
    return { event: null, audit: audit };
  }

  if (pubStatus === 'in_development') {
    stats.hiddenTour++;
    audit.push(
      auditEntry_(
        AUDIT_LEVEL_WARNING,
        'Расписание',
        sheetName,
        rowIndex,
        tourId,
        'Выезд не опубликован: тур в разработке'
      )
    );
    return { event: null, audit: audit };
  }

  var seats = normalizeNumberOrNull_(row[6]);
  if (seats != null && seats < 0) {
    stats.invalid++;
    audit.push(
      auditEntry_(AUDIT_LEVEL_WARNING, 'Расписание', sheetName, rowIndex, tourId, 'Отрицательное количество мест')
    );
    return { event: null, audit: audit };
  }

  var eventKey = dateIso + '|' + tourId;
  if (seenKeys[eventKey]) {
    stats.invalid++;
    audit.push(
      auditEntry_(AUDIT_LEVEL_WARNING, 'Расписание', sheetName, rowIndex, tourId, 'Дубликат выезда (дата + тур)')
    );
    return { event: null, audit: audit };
  }
  seenKeys[eventKey] = true;

  var commentRaw = row[8];
  var comment =
    commentRaw === null || commentRaw === undefined || String(commentRaw).trim() === ''
      ? null
      : String(commentRaw).trim();

  stats.published++;
  return {
    event: {
      date: dateIso,
      tourId: tourId,
      seats: seats,
      status: statusCode,
      comment: comment,
    },
    audit: audit,
  };
}

/**
 * @param {string} statusRaw
 * @returns {'active' | 'hidden' | 'in_development' | 'draft' | 'invalid'}
 */
function classifyTourPublicationForPublish_(statusRaw) {
  var normalized = String(statusRaw || '').trim().toLowerCase();
  if (!normalized) return 'draft';
  var code = PUBLICATION_STATUS_TO_EXPORT_CODE[normalized];
  if (!code) return 'invalid';
  return code;
}

/**
 * @param {*[]} row
 * @returns {boolean}
 */
function isCatalogRowFullyEmpty_(row) {
  for (var i = 0; i < row.length; i++) {
    if (String(row[i] || '').trim() !== '') return false;
  }
  return true;
}

/**
 * @param {*[]} row
 * @returns {boolean}
 */
function catalogRowHasAnyData_(row) {
  return !isCatalogRowFullyEmpty_(row);
}

/**
 * @param {*[]} row
 * @returns {boolean}
 */
function isScheduleRowFullyEmpty_(row) {
  return isCatalogRowFullyEmpty_(row);
}

/**
 * @param {string} level
 * @param {string} section
 * @param {string} sheet
 * @param {number|string} row
 * @param {string} tourId
 * @param {string} message
 * @returns {Object}
 */
function auditEntry_(level, section, sheet, row, tourId, message) {
  return {
    level: level,
    section: section,
    sheet: sheet,
    row: row,
    tourId: tourId,
    message: message,
  };
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {Object[]} entries
 */
function writePublishAuditSheet_(ss, entries) {
  var sheet = ss.getSheetByName(META_SHEET_AUDIT);
  if (!sheet) sheet = ss.insertSheet(META_SHEET_AUDIT);
  sheet.clear();
  sheet
    .getRange(1, 1, 1, 6)
    .setValues([['Уровень', 'Раздел', 'Лист', 'Строка', 'ID тура', 'Сообщение']]);
  sheet.getRange(1, 1, 1, 6).setFontWeight('bold');

  /** @type {*[][]} */
  var rows = [];
  entries.forEach(function (entry) {
    rows.push([entry.level, entry.section, entry.sheet, entry.row, entry.tourId, entry.message]);
  });
  if (rows.length === 0) {
    rows.push([AUDIT_LEVEL_OK, 'Система', '—', '—', '—', 'Замечаний нет']);
  }
  sheet.getRange(2, 1, rows.length, 6).setValues(rows);
}

/**
 * @param {Object} result
 * @returns {string}
 */
function formatToursPublishMessage_(result) {
  var stats = result.built.stats;
  var generatedAt = result.built.payload.generatedAt;
  return (
    'Список туров опубликован.\n\n' +
    'Опубликовано туров: ' +
    stats.published +
    '\nПропущено черновиков: ' +
    stats.draft +
    '\nПропущено скрытых туров: ' +
    stats.hidden +
    '\nПропущено некорректных строк: ' +
    stats.invalid +
    '\n\nФайл: tours_list.json\nВерсия: ' +
    formatGeneratedAtLocal_(generatedAt) +
    '\n\nПодробности записаны на листе «' +
    META_SHEET_AUDIT +
    '».'
  );
}

/**
 * @param {Object} result
 * @returns {string}
 */
function formatSchedulePublishMessage_(result) {
  var stats = result.built.stats;
  var generatedAt = result.built.payload.generatedAt;
  return (
    'Расписание опубликовано.\n\n' +
    'Опубликовано выездов: ' +
    stats.published +
    '\nПропущено черновиков: ' +
    stats.draft +
    '\nПропущено выездов скрытых туров: ' +
    stats.hiddenTour +
    '\nПропущено некорректных строк: ' +
    stats.invalid +
    '\n\nФайл: schedule.json\nВерсия: ' +
    formatGeneratedAtLocal_(generatedAt) +
    '\n\nПодробности записаны на листе «' +
    META_SHEET_AUDIT +
    '».'
  );
}

/**
 * @param {Object} toursResult
 * @param {Object} scheduleResult
 * @returns {string}
 */
function formatAllPublishSuccessMessage_(toursResult, scheduleResult) {
  return (
    'Всё опубликовано.\n\n' +
    formatToursPublishMessage_(toursResult) +
    '\n\n---\n\n' +
    formatSchedulePublishMessage_(scheduleResult)
  );
}

/**
 * @param {Object} toursResult
 * @param {*} scheduleErr
 * @returns {string}
 */
function formatPartialPublishMessage_(toursResult, scheduleErr) {
  return (
    'Обновление выполнено частично.\n\n' +
    'Список туров успешно опубликован.\n' +
    'Расписание не обновлено.\n\n' +
    'Причина:\n' +
    String(scheduleErr.message || scheduleErr) +
    '\n\nСтарое расписание продолжает работать на сайте.\n\n' +
    formatToursPublishMessage_(toursResult)
  );
}

/**
 * @param {string} iso
 * @returns {string}
 */
function formatGeneratedAtLocal_(iso) {
  try {
    return Utilities.formatDate(new Date(iso), TIMEZONE, 'dd.MM.yyyy, HH:mm');
  } catch (err) {
    return iso;
  }
}
