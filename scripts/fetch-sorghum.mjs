#!/usr/bin/env node
/**
 * fetch-sorghum.mjs
 * -----------------
 * Загружает месячные цены на сорго (PSORG) из IMF PCPS API (SDMX JSON)
 * и сохраняет результат в src/_data/sorghumPrices.json
 *
 * Использование:
 *   node scripts/fetch-sorghum.mjs          — обновить данные
 *   node scripts/fetch-sorghum.mjs --dry    — только показать, не записывать
 *
 * API endpoint:
 *   http://dataservices.imf.org/REST/SDMX_JSON.svc/CompactData/PCPS/M.W00.PSORG.USD
 *
 * Единица IMF: USD/cwt (центнер, 100 фунтов ≈ 45.359 кг)
 * Конвертация: $/MT = $/cwt × 22.046
 */

import https from 'node:https';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.resolve(__dirname, '..', 'src', '_data', 'sorghumPrices.json');
const DRY_RUN = process.argv.includes('--dry');

// Последние 5 лет + текущий
const startYear = new Date().getFullYear() - 5;
const endYear = new Date().getFullYear();

const API_URL =
  `http://dataservices.imf.org/REST/SDMX_JSON.svc/CompactData/PCPS/` +
  `M.W00.PSORG.USD?startPeriod=${startYear}&endPeriod=${endYear}`;

// Коэффициент конвертации cwt → MT
const CWT_TO_MT = 22.046;

function fetch(url) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, { headers: { Accept: 'application/json' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch (e) { reject(e); }
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  console.log(`📥 Запрос IMF PCPS API: PSORG (сорго), ${startYear}–${endYear}...`);
  console.log(`   URL: ${API_URL}\n`);

  let data;
  try {
    data = await fetch(API_URL);
  } catch (err) {
    console.error('❌ Не удалось получить данные от IMF API:', err.message);
    console.error('   Проверьте доступность http://dataservices.imf.org');
    process.exit(1);
  }

  // Парсинг SDMX CompactData
  const series = data?.CompactData?.DataSet?.Series;
  if (!series) {
    console.error('❌ Ответ API не содержит данных Series.');
    console.error('   Возможно, IMF изменил структуру ответа.');
    process.exit(1);
  }

  const obs = Array.isArray(series.Obs) ? series.Obs : [series.Obs];

  const prices = obs
    .filter((o) => o?.['@OBS_VALUE'] && o?.['@TIME_PERIOD'])
    .map((o) => ({
      date: o['@TIME_PERIOD'],                             // "2021-01"
      price: Math.round(parseFloat(o['@OBS_VALUE']) * CWT_TO_MT * 100) / 100
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (prices.length === 0) {
    console.error('❌ Не найдено ни одного наблюдения.');
    process.exit(1);
  }

  const result = {
    meta: {
      source: 'IMF Primary Commodity Price System (PCPS)',
      commodity: 'PSORG — Sorghum, U.S. No.2 yellow, FOB Gulf ports',
      unit: 'USD per metric ton',
      updated: new Date().toISOString().slice(0, 10),
      note: `Автоматически получено через IMF SDMX JSON API. Конвертация $/cwt → $/MT (×${CWT_TO_MT}).`
    },
    prices
  };

  console.log(`✅ Получено ${prices.length} месяцев данных`);
  console.log(`   Период: ${prices[0].date} — ${prices[prices.length - 1].date}`);
  console.log(`   Мин: $${Math.min(...prices.map(p => p.price))}/MT`);
  console.log(`   Макс: $${Math.max(...prices.map(p => p.price))}/MT`);
  console.log(`   Последняя: ${prices[prices.length - 1].date} = $${prices[prices.length - 1].price}/MT`);

  if (DRY_RUN) {
    console.log('\n--- DRY RUN: данные не записаны ---');
    console.log(JSON.stringify(result, null, 2));
  } else {
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`\n💾 Записано: ${OUTPUT}`);
  }
}

main();
