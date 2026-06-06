/**
 * Вебхук «сайт → Telegram» для заявок (проект «Вкрайности»).
 *
 * --- Быстрый старт ---
 * 1) Вставьте этот файл в Apps Script.
 * 2) В Project Settings → Script properties добавьте:
 *    TELEGRAM_BOT_TOKEN — токен от @BotFather.
 *    TELEGRAM_CHAT_ID   — id группы (число; супергруппа со знаком «-»).
 * 3) Опционально запустите installDefaultSettings(), чтобы задать TTL идемпотентности.
 * 4) Запустите функцию sendTestLead().
 * 5) Если тест пришёл в Telegram — Deploy → New deployment → Web app.
 *
 * --- Script Properties (Project Settings → Script properties) ---
 * TELEGRAM_BOT_TOKEN  — токен от @BotFather (не коммитить в git).
 * TELEGRAM_CHAT_ID    — id группы (число; супергруппа со знаком «-»).
 *
 * Опционально:
 * IDEMPOTENCY_TTL_SECONDS — 60…21600 (лимит CacheService), по умолчанию 21600 (6 ч).
 *
 * --- Важно про публичный endpoint ---
 * Этот скрипт рассчитан на прямую отправку из браузера, поэтому endpoint публичный.
 * Защита здесь ограничена валидацией payload и идемпотентностью; для строгой модели доверия
 * поставьте перед GAS serverless proxy, который хранит приватные ключи вне браузера.
 *
 * --- Деплой ---
 * Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone
 * (или ограниченный доступ — осознанно; для серверного POST часто «Anyone»).
 *
 * --- Пример curl (подставьте URL деплоя /exec) ---
 * curl -sS -X POST 'https://script.google.com/macros/s/AKfycb.../exec' \
 *   -H 'Content-Type: application/json' \
 *   -d '{"tourId":"spring-6","tourTitle":"Мараловая ферма и Парк Драконов","season":"spring","name":"Иван","phone":"+79001234567","email":"","preferredMessenger":"telegram","question":"Вопрос","privacyAccepted":true,"sourceUrl":"https://…","submittedAt":"2026-05-11T12:00:00.000Z","userAgent":"curl"}'
 *
 * --- Чеклист ---
 * [ ] Бот создан, TELEGRAM_BOT_TOKEN в свойствах.
 * [ ] Бот добавлен в группу, может писать сообщения.
 * [ ] TELEGRAM_CHAT_ID верный (для супергруппы отрицательный id).
 * [ ] Web App задеплоен, URL с /exec скопирован в VITE_TOUR_REQUEST_ENDPOINT_URL.
 * [ ] CORS: прямой POST из браузера на script.google.com остается opaque; сайт не читает JSON-статус.
 *
 * --- HTTP-статусы ---
 * У Web App ответ через ContentService обычно отдаётся с кодом 200 даже при ошибке.
 * Семантика ошибок — в JSON: ok, error, code (FORBIDDEN, BAD_REQUEST, UPSTREAM…).
 * Если нужны реальные 403/502 и приватная проверка, поставьте перед GAS обратный прокси.
 */

var TELEGRAM_TEXT_LIMIT = 4096;
var SAFE_CHUNK = 4000;
var DEFAULT_IDEMPOTENCY_TTL_SECONDS = '21600';

/**
 * Запустите один раз из Apps Script.
 * Эта функция запишет только TTL идемпотентности.
 * Токен бота, chat_id и секрет нужно добавить вручную, чтобы не хранить их в коде.
 */
function installDefaultSettings() {
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('IDEMPOTENCY_TTL_SECONDS')) {
    props.setProperty('IDEMPOTENCY_TTL_SECONDS', DEFAULT_IDEMPOTENCY_TTL_SECONDS);
  }

  Logger.log('Готово: IDEMPOTENCY_TTL_SECONDS установлен. Теперь добавьте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID.');
}

/**
 * Запустите после заполнения TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID.
 * В Telegram должно прийти тестовое сообщение.
 */
function sendTestLead() {
  var props = PropertiesService.getScriptProperties();

  if (!props.getProperty('TELEGRAM_BOT_TOKEN')) {
    Logger.log('Не найден TELEGRAM_BOT_TOKEN. Добавьте токен бота в Script Properties.');
    return;
  }
  if (!props.getProperty('TELEGRAM_CHAT_ID')) {
    Logger.log('Не найден TELEGRAM_CHAT_ID. Добавьте id группы в Script Properties.');
    return;
  }

  var testPayload = {
    idempotencyKey: 'gas-test-' + new Date().toISOString(),
    tourId: 'winter-1',
    tourTitle: 'Тестовый тур',
    season: 'winter',
    name: 'Тестовая заявка',
    phone: '+79001234567',
    email: 'test@example.com',
    preferredMessenger: 'telegram',
    question: 'Проверка отправки заявки из Google Apps Script.',
    privacyAccepted: true,
    preferredDepartureDate: '2026-06-14',
    sourceUrl: 'https://vkraynosti.ru/tours/winter-1',
    submittedAt: new Date().toISOString(),
    userAgent: 'Apps Script test',
  };

  var fakePostEvent = {
    postData: {
      contents: JSON.stringify(testPayload),
      type: 'application/json',
    },
    parameter: {},
  };

  var result = handleLeadPost_(fakePostEvent);
  Logger.log(JSON.stringify(result));
}

/**
 * @param {GoogleAppsScript.Events.DoPost} e
 * @return {GoogleAppsScript.Content.TextOutput}
 */
function doPost(e) {
  try {
    var result = handleLeadPost_(e);
    return jsonOut_(result);
  } catch (err) {
    Logger.log('doPost fatal: ' + err);
    return jsonOut_({ ok: false, error: 'Internal error', code: 'INTERNAL' });
  }
}

/**
 * @param {GoogleAppsScript.Events.DoGet} e
 * @return {GoogleAppsScript.Content.TextOutput}
 */
function doGet() {
  return jsonOut_({ ok: true, service: 'vkraynosti-telegram-lead-webhook' });
}

/**
 * @param {Object} obj
 * @return {GoogleAppsScript.Content.TextOutput}
 */
function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * @param {GoogleAppsScript.Events.DoPost} e
 * @return {{ok:boolean,error?:string,code?:string,deduplicated?:boolean}}
 */
function handleLeadPost_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return { ok: false, error: 'Empty body', code: 'BAD_REQUEST' };
  }

  var type = (e.postData.type || '').toLowerCase();
  var isJsonBody = type === '' || type.indexOf('json') !== -1 || type.indexOf('text/plain') !== -1;
  if (!isJsonBody) {
    return { ok: false, error: 'Expected JSON body', code: 'BAD_REQUEST' };
  }

  /** @type {Object} */
  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (parseErr) {
    return { ok: false, error: 'Invalid JSON', code: 'BAD_REQUEST' };
  }

  var props = PropertiesService.getScriptProperties();
  var idemKey = typeof body.idempotencyKey === 'string' ? body.idempotencyKey.trim() : '';
  if (idemKey) {
    var ttl = parseIdempotencyTtl_(props.getProperty('IDEMPOTENCY_TTL_SECONDS'));
    var cache = CacheService.getScriptCache();
    var cacheKey = 'lead_' + Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, idemKey, Utilities.Charset.UTF_8)).slice(0, 200);
    if (cache.get(cacheKey)) {
      return { ok: true, deduplicated: true };
    }
    var err = validatePayload_(body);
    if (err) {
      return { ok: false, error: err, code: 'BAD_REQUEST' };
    }
    var text = buildLeadMessage_(body);
    var sendResult = sendTelegramHtmlChunks_(props, text);
    if (!sendResult.ok) {
      Logger.log('Telegram error: ' + sendResult.detail);
      return { ok: false, error: sendResult.error, code: sendResult.code || 'UPSTREAM' };
    }
    cache.put(cacheKey, '1', ttl);
    return { ok: true };
  }

  var errNoIdem = validatePayload_(body);
  if (errNoIdem) {
    return { ok: false, error: errNoIdem, code: 'BAD_REQUEST' };
  }
  var textNoIdem = buildLeadMessage_(body);
  var sendNoIdem = sendTelegramHtmlChunks_(props, textNoIdem);
  if (!sendNoIdem.ok) {
    Logger.log('Telegram error: ' + sendNoIdem.detail);
    return { ok: false, error: sendNoIdem.error, code: sendNoIdem.code || 'UPSTREAM' };
  }
  return { ok: true };
}

/**
 * @param {string|undefined} raw
 * @return {number}
 */
function parseIdempotencyTtl_(raw) {
  var n = parseInt(raw, 10);
  if (isNaN(n) || n < 60) return 21600;
  if (n > 21600) return 21600;
  return n;
}

/**
 * @param {Object} body
 * @return {string} сообщение об ошибке или пустая строка
 */
function validatePayload_(body) {
  if (!body.tourId || typeof body.tourId !== 'string' || !String(body.tourId).trim()) {
    return 'tourId is required';
  }
  if (body.tourTitle != null && typeof body.tourTitle !== 'string') {
    return 'tourTitle must be a string when provided';
  }
  if (body.season != null && typeof body.season !== 'string') {
    return 'season must be a string when provided';
  }
  if (!body.name || typeof body.name !== 'string' || !String(body.name).trim()) {
    return 'name is required';
  }
  if (!body.phone || typeof body.phone !== 'string' || !String(body.phone).trim()) {
    return 'phone is required';
  }
  if (body.privacyAccepted !== true) {
    return 'privacyAccepted must be true';
  }
  var m = body.preferredMessenger;
  if (m !== 'whatsapp' && m !== 'telegram' && m !== 'max') {
    return 'preferredMessenger must be whatsapp, telegram or max';
  }
  return '';
}

/**
 * @param {Object} body
 * @return {string}
 */
function buildLeadMessage_(body) {
  var tourId = escapeHtml_(String(body.tourId).trim());
  var tourTitle = body.tourTitle ? escapeHtml_(String(body.tourTitle).trim()) : 'Без названия';
  var season = body.season ? escapeHtml_(seasonLabel_(String(body.season))) : '—';
  var email = body.email != null && String(body.email).trim() ? escapeHtml_(String(body.email).trim()) : '—';
  var question = body.question != null && String(body.question).trim() ? escapeHtml_(String(body.question).trim()) : '—';
  var sourceUrl = body.sourceUrl ? escapeHtml_(String(body.sourceUrl)) : '—';
  var submittedAt = body.submittedAt ? escapeHtml_(String(body.submittedAt)) : '—';
  var userAgent = body.userAgent ? escapeHtml_(String(body.userAgent)) : '—';
  var idempotencyKey = body.idempotencyKey ? escapeHtml_(String(body.idempotencyKey)) : '—';
  var privacyAccepted = body.privacyAccepted === true ? 'Да' : 'Нет';

  var departureDate = formatDepartureDate_(body.preferredDepartureDate);

  var lines = [
    '<b>Новая заявка с сайта</b>',
    '<b>Тур:</b> ' + tourTitle + ' (id: ' + tourId + ')',
    '<b>Сезон:</b> ' + season,
    '<b>Дата выезда:</b> ' + departureDate,
    '',
    '<b>Имя:</b> ' + escapeHtml_(String(body.name).trim()),
    '<b>Телефон:</b> <code>' + escapeHtml_(String(body.phone).trim()) + '</code>',
    '<b>Email:</b> ' + email,
    '<b>Мессенджер:</b> ' + escapeHtml_(messengerLabel_(body.preferredMessenger)),
    '<b>Вопрос:</b>',
    question,
    '',
    '<b>Согласие с политикой:</b> ' + privacyAccepted,
    '<b>Отправлено:</b> ' + submittedAt,
    '<b>Idempotency key:</b> <code>' + idempotencyKey + '</code>',
    '',
    '<b>Ссылка на страницу с которой была оставлена заявка:</b>',
    sourceUrl,
    '',
    '<b>User-Agent:</b>',
    userAgent,
  ];

  return lines.join('\n');
}

/**
 * ISO YYYY-MM-DD → «d MMMM yyyy» (как в модалке заявки на сайте).
 * @param {string|undefined} iso
 * @return {string}
 */
function formatDepartureDate_(iso) {
  if (iso == null || typeof iso !== 'string') {
    return '—';
  }
  var trimmed = String(iso).trim();
  if (!trimmed) {
    return '—';
  }
  var match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return escapeHtml_(trimmed);
  }
  var day = parseInt(match[3], 10);
  var month = parseInt(match[2], 10);
  var year = match[1];
  var monthNames = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ];
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return escapeHtml_(trimmed);
  }
  return escapeHtml_(day + ' ' + monthNames[month - 1] + ' ' + year);
}

/**
 * @param {string} season
 * @return {string}
 */
function seasonLabel_(season) {
  if (season === 'spring') return 'Весна';
  if (season === 'winter') return 'Зима';
  if (season === 'summer') return 'Лето';
  if (season === 'fall') return 'Осень';
  return season;
}

/**
 * @param {string} m
 * @return {string}
 */
function messengerLabel_(m) {
  if (m === 'whatsapp') return 'WhatsApp';
  if (m === 'telegram') return 'Telegram';
  if (m === 'max') return 'MAX';
  return String(m);
}

/**
 * @param {string} s
 * @return {string}
 */
function escapeHtml_(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * @param {GoogleAppsScript.Properties.Properties} props
 * @param {string} fullText
 * @return {{ok:boolean,error?:string,code?:string,detail?:string}}
 */
function sendTelegramHtmlChunks_(props, fullText) {
  var token = props.getProperty('TELEGRAM_BOT_TOKEN');
  var chatRaw = props.getProperty('TELEGRAM_CHAT_ID');
  if (!token || !chatRaw) {
    return { ok: false, error: 'Telegram not configured', code: 'INTERNAL', detail: 'missing token or chat id' };
  }

  var chatId = Number(chatRaw);
  if (isNaN(chatId)) {
    chatId = chatRaw;
  }

  var chunks = splitMessageChunks_(fullText, SAFE_CHUNK);
  var total = chunks.length;

  for (var i = 0; i < total; i++) {
    var part = chunks[i];
    if (total > 1) {
      part = '<i>Часть ' + (i + 1) + '/' + total + '</i>\n\n' + part;
      if (part.length > TELEGRAM_TEXT_LIMIT) {
        part = part.slice(0, TELEGRAM_TEXT_LIMIT);
      }
    }

    var result = telegramSendMessage_(token, chatId, part);
    if (!result.ok) {
      return result;
    }
  }
  return { ok: true };
}

/**
 * @param {string} text
 * @param {number} maxLen
 * @return {string[]}
 */
function splitMessageChunks_(text, maxLen) {
  if (text.length <= maxLen) return [text];
  var out = [];
  var rest = text;
  while (rest.length > 0) {
    var take = rest.slice(0, maxLen);
    var br = take.lastIndexOf('\n');
    if (br > maxLen * 0.5) {
      take = rest.slice(0, br + 1);
    }
    out.push(take);
    rest = rest.slice(take.length);
  }
  return out;
}

/**
 * @param {string} token
 * @param {number|string} chatId
 * @param {string} text
 * @return {{ok:boolean,error?:string,code?:string,detail?:string}}
 */
function telegramSendMessage_(token, chatId, text) {
  var url = 'https://api.telegram.org/bot' + token + '/sendMessage';
  var payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  };

  var response;
  try {
    response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
      followRedirects: true,
      validateHttpsCertificates: true,
    });
  } catch (fetchErr) {
    Logger.log('UrlFetchApp.fetch failed: ' + fetchErr);
    return { ok: false, error: 'Telegram request failed', code: 'UPSTREAM', detail: String(fetchErr) };
  }

  var code = response.getResponseCode();
  var raw = response.getContentText();
  if (code < 200 || code >= 300) {
    Logger.log('Telegram HTTP ' + code + ': ' + raw);
    return { ok: false, error: 'Telegram HTTP error', code: 'UPSTREAM', detail: raw };
  }

  try {
    var json = JSON.parse(raw);
    if (!json.ok) {
      Logger.log('Telegram API ok=false: ' + raw);
      return { ok: false, error: 'Telegram API error', code: 'UPSTREAM', detail: raw };
    }
  } catch (parseErr) {
    Logger.log('Telegram response not JSON: ' + raw);
    return { ok: false, error: 'Bad Telegram response', code: 'UPSTREAM', detail: raw };
  }

  return { ok: true };
}
