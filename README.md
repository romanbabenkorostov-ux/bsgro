# BSGRO Site v12 — Модульная архитектура на Eleventy (11ty)

## Выбор генератора

| Критерий | Eleventy (11ty) ✅ | Jekyll | Hugo | Gulp + Nunjucks |
|---|---|---|---|---|
| Язык | Node.js | Ruby | Go | Node.js |
| Шаблонизатор | Nunjucks, Liquid, и др. | Liquid | Go templates | Nunjucks |
| Скорость сборки | Быстрая | Средняя | Очень быстрая | Средняя |
| Конфигурация | Минимальная | Средняя | Средняя | Ручная |
| GitHub Actions | `npm ci && npm run build` | Нужен Ruby | Нужен Go-бинарник | `npm ci && gulp build` |
| Кривая обучения | Пологая | Средняя | Крутая (Go tmpl) | Средняя |
| Гибкость данных | `_data/*.json` + front matter | `_data/*.yml` | `data/*.toml/yaml` | Ручная |

**Почему 11ty:**
- Единственная зависимость: `npm install`
- Nunjucks — мощный и читаемый шаблонизатор
- Zero-config: `.eleventy.js` < 25 строк
- Данные контактов, навигации — JSON-файлы, не код
- GitHub Actions: стандартный Node.js workflow

## Структура проекта

```
bsgro-site-v12/
├── .github/workflows/
│   └── deploy.yml              ← CI/CD: push → build → GitHub Pages
├── src/
│   ├── _includes/
│   │   ├── base.njk            ← Базовый layout (head, body, scripts)
│   │   ├── navbar.njk          ← Навигация (1 файл на все страницы)
│   │   └── footer.njk          ← Подвал (1 файл на все страницы)
│   ├── _data/
│   │   ├── site.json           ← Контакты, название, копирайт
│   │   └── nav.json            ← Меню, ссылки навигации, footer-ссылки
│   ├── css/
│   │   └── style.css           ← Единый CSS
│   ├── js/
│   │   └── main.js             ← Fade-up, bar-fill, scroll-spy
│   ├── assets/                 ← Статика: logo, QR, vCard, favicon
│   ├── index.njk               ← Главная
│   ├── sorgo.njk               ← Агрокультура сорго
│   ├── sorgo-food-1.njk        ← Сорговый сироп: сырьё и технология
│   ├── sorgo-food-2.njk        ← Применение в food-продукции
│   └── sorgo-food-3.njk        ← Внедрение и управление рисками
├── .eleventy.js                ← Конфигурация Eleventy
├── package.json                ← Зависимости (только @11ty/eleventy)
├── .gitignore
└── README.md                   ← Этот файл
```

## Как это решает проблемы

| Проблема (было) | Решение (стало) |
|---|---|
| Правка навигации в 5 файлах | Один `navbar.njk` + данные в `nav.json` |
| Правка контактов в 5 footer'ах | Один `footer.njk` + данные в `site.json` |
| Копирование `<head>` между страницами | Один `base.njk` с `{{ pageTitle }}` из front matter |
| Дублирование скриптов | Один `main.js`, подключается в `base.njk` |
| Новая страница = копировать всё | Новый `.njk` файл с front matter + контент |

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Локальная разработка (http://localhost:8080)
npm run dev

# Сборка для продакшна
npm run build         # → папка _site/
```

## Типовые задачи

### Изменить контакты
Один файл: `src/_data/site.json` → поля `contact.*`

### Изменить навигацию
Один файл: `src/_data/nav.json` → секции `main`, `indexSections`, `footerLinks`

### Добавить новую страницу
```bash
# Создать файл src/my-page.njk:
---
layout: base.njk
pageId: "my-page"
pageTitle: "BSGRO — Моя новая страница"
pageDescription: "Описание страницы"
footerGroup: "index"
permalink: "/my-page/"
---

<!-- Контент страницы -->
<section class="hero" ...>
  ...
</section>
```

### Front matter — параметры страницы

| Параметр | Описание | Пример |
|---|---|---|
| `layout` | Шаблон | `base.njk` |
| `pageId` | ID для active-состояния navbar | `sorgo-food-1` |
| `pageTitle` | Тег `<title>` | `BSGRO — Сорговый сироп` |
| `pageDescription` | Мета-описание | `Технология производства...` |
| `pageKeywords` | Мета-ключевые слова (опционально) | `сорго, сироп` |
| `footerGroup` | Какой набор ссылок в footer | `index` / `sorgo` / `sorgo-food` |
| `permalink` | URL страницы | `/sorgo-food-1/` |
| `extraJs` | Дополнительный JS (опционально) | inline-скрипт |

## Деплой на GitHub Pages

1. Репозиторий → Settings → Pages → Source: **GitHub Actions**
2. Push в `main` → автоматическая сборка и деплой
3. Workflow: `.github/workflows/deploy.yml`

## Локальная сборка без Node.js (fallback)

Если нет возможности установить Node.js, файлы `src/*.njk` содержат
полный HTML-контент страниц в теле. Навигация и footer генерируются
из шаблонов, но сам контент читаем и редактируем как обычный HTML.
