# Tour schedule — Google Apps Script

Скопируйте **`Code.gs`** в проект Apps Script таблицы расписания.

## Обновление из репозитория

```bash
npm run generate:tour-schedule-gas-ids   # блок SITE_TOUR_IDS в Code.gs
```

После изменения туров на сайте — пересоберите ids и вставьте файл в Apps Script (или замените только блок между `SITE_TOUR_IDS_BEGIN/END`).

## Документация

- Менеджер: `docs/TOUR_SCHEDULE_SHEETS_MANAGER.md`
- Техническая: `docs/TOUR_SCHEDULE_SHEETS_AUTOMATION.md`
