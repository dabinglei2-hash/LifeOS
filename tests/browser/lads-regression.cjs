#!/usr/bin/env node
'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {isDeepStrictEqual} = require('node:util');

const root = process.cwd();
const artifactDir = path.resolve(process.env.LADS_ARTIFACT_DIR || path.join(root, '.lads-artifacts'));
const playwrightPath = process.env.LIFEOS_PLAYWRIGHT_PATH
  || 'C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright';
const {chromium} = require(playwrightPath);
fs.mkdirSync(artifactDir, {recursive: true});

const checks = [];
const consoleErrors = [];
let server;
let browser;
let base;

function record(id, status, evidence) {
  checks.push({id, status, evidence: String(evidence).slice(0, 1000)});
  fs.writeFileSync(path.join(artifactDir, 'browser-progress.json'), JSON.stringify({checks}, null, 2));
}

function watchPage(page) {
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', error => consoleErrors.push(error.message));
}

const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.wasm': 'application/wasm',
};

function staticServer() {
  return http.createServer((request, response) => {
    const requested = decodeURIComponent((request.url || '/').split('?')[0]);
    const relative = requested === '/' ? 'index.html' : requested.replace(/^\/+/, '');
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      response.writeHead(404, {'content-type': 'text/plain'});
      response.end('not found');
      return;
    }
    response.writeHead(200, {
      'content-type': mime[path.extname(file)] || 'application/octet-stream',
      'cache-control': relative === 'sw.js' ? 'no-cache' : 'no-store',
    });
    fs.createReadStream(file).pipe(response);
  });
}

function listen(instance) {
  return new Promise((resolve, reject) => {
    instance.once('error', reject);
    instance.listen(0, '127.0.0.1', () => resolve(`http://127.0.0.1:${instance.address().port}`));
  });
}

function closeServer(instance) {
  return new Promise(resolve => {
    if (!instance || !instance.listening) return resolve();
    const timer = setTimeout(resolve, 5000);
    instance.close(() => {
      clearTimeout(timer);
      resolve();
    });
  });
}

async function closeBrowser(instance) {
  if (!instance) return;
  await Promise.race([
    instance.close(),
    new Promise((_, reject) => setTimeout(
      () => reject(new Error('browser cleanup timed out')),
      5000,
    )),
  ]);
}

async function freshContext(currentBrowser, viewport = {width: 390, height: 844}, locale = 'zh-CN') {
  const context = await currentBrowser.newContext({
    viewport, locale, timezoneId: 'Asia/Shanghai', serviceWorkers: 'allow',
    acceptDownloads: true,
  });
  await context.route('**/*', route => {
    const destination = new URL(route.request().url());
    if (destination.hostname === '127.0.0.1' || destination.protocol === 'data:') return route.continue();
    return route.abort('blockedbyclient');
  });
  context.on('page', watchPage);
  return context;
}

async function settle(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(80);
}

async function storage(page) {
  return page.evaluate(() => Object.fromEntries(
    Array.from({length: localStorage.length}, (_, index) => {
      const key = localStorage.key(index);
      return [key, localStorage.getItem(key)];
    }),
  ));
}

async function assertLayout(currentBrowser, viewport, id) {
  const context = await freshContext(currentBrowser, viewport);
  const page = await context.newPage();
  await page.goto(`${base}/index.html#overview`);
  await settle(page);
  const layout = await page.evaluate(() => {
    const nav = document.querySelector('.mobile-bottom-nav');
    const style = nav ? getComputedStyle(nav) : null;
    return {
      innerWidth, innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      navVisible: Boolean(nav && nav.getBoundingClientRect().height > 0),
      navFixed: style ? ['fixed', 'sticky'].includes(style.position) : false,
      navRect: nav ? nav.getBoundingClientRect().toJSON() : null,
    };
  });
  const passed = layout.innerWidth === viewport.width
    && layout.scrollWidth <= layout.innerWidth + 1
    && (viewport.width > 900 || (layout.navVisible && layout.navFixed));
  record(id, passed ? 'PASS' : 'FAIL', JSON.stringify(layout));
  if (!passed) await page.screenshot({path: path.join(artifactDir, `${id}.png`), fullPage: true});
  await context.close();
}

async function run() {
  server = process.env.LIFEOS_BASE_URL ? null : staticServer();
  base = process.env.LIFEOS_BASE_URL || await listen(server);
  browser = await chromium.launch({channel: 'chrome', headless: true});

  const context = await freshContext(browser);
  const page = await context.newPage();
  await page.goto(`${base}/index.html#overview`);
  await settle(page);

  const routes = ['#overview', '#records', '#learning', '#tasks', '#finance', '#social', '#personal', '#daily-notes', '#monthly', '#notes', '#health', '#backup', '#search'];
  const sections = ['overview-section','records-section','learning','work-plan-section','finance','social-section','personal','daily-notes-section','monthly','notes-section','health-section','backup','search-section'];
  let routeFailures = [];
  for (const route of routes) {
    await page.evaluate(value => { location.hash = value; }, route);
    const section = sections[routes.indexOf(route)];
    await page.waitForFunction(id => {
      const visible = document.querySelectorAll('main > .page-section:not(.route-hidden)');
      return visible.length === 1 && visible[0].id === id;
    }, section);
    const visible = await page.locator('#' + section).isVisible();
    if (!visible || page.url().endsWith('#overview') && route !== '#overview') routeFailures.push(route);
  }
  record('route-navigation', routeFailures.length ? 'FAIL' : 'PASS', routeFailures.length ? `failed=${routeFailures.join(',')}` : `${routes.length} routes rendered`);

  await page.goto(`${base}/index.html#tasks`);
  await page.reload();
  await settle(page);
  await page.waitForFunction(() => {
    const visible = document.querySelectorAll('main > .page-section:not(.route-hidden)');
    return visible.length === 1 && visible[0].id === 'work-plan-section';
  });
  await page.locator('#task-compose > summary').click();
  const date = await page.locator('#task-date').inputValue();
  await page.locator('#task-title').fill('ASCII schedule alpha');
  await page.locator('#task-submit').click();
  await page.waitForTimeout(80);
  let state = await storage(page);
  let data = JSON.parse(state['my-life-dashboard-v1'] || '{"tasks":[]}');
  let task = data.tasks.find(item => item.title === 'ASCII schedule alpha');
  if (task) {
    await page.locator(`[data-edit-task="${task.id}"]`).first().click();
    await page.locator('#task-title').fill('ASCII schedule beta');
    await page.locator('#task-submit').click();
    await page.waitForTimeout(80);
    data = JSON.parse((await storage(page))['my-life-dashboard-v1'] || '{"tasks":[]}');
  }
  record('schedule-crud', task && data.tasks.some(item => item.id === task.id && item.title === 'ASCII schedule beta') ? 'PASS' : 'FAIL', `date=${date} task=${task?.id || 'missing'}`);

  await page.goto(`${base}/index.html#learning`);
  await settle(page);
  await page.locator('[data-learning-view="plans"]').click();
  await page.locator('#learning-plan-new').click();
  await page.locator('#learning-plan-title').fill('ASCII learning plan');
  await page.locator('#learning-plan-date').fill(date);
  await page.locator('#learning-plan-minutes').fill('30');
  await page.locator('#learning-plan-form button[type="submit"]').click();
  await page.waitForTimeout(80);
  const learning = JSON.parse((await storage(page))['my-life-dashboard-learning-meta-v1'] || '{"plans":[]}');
  const planned = learning.plans.some(item => item.estimatedMinutes === 30);
  await page.locator('[data-learning-view="home"]').click();
  await page.locator('[data-learning-new-record]:visible').first().click();
  await page.locator('#study-date').fill(date);
  await page.locator('#study-content').fill('ASCII actual study');
  await page.locator('#study-duration').fill('17');
  await page.locator('#study-submit').click();
  await page.waitForTimeout(80);
  data = JSON.parse((await storage(page))['my-life-dashboard-v1'] || '{"studies":[]}');
  const actual = data.studies.find(item => item.content === 'ASCII actual study');
  record('learning-plan-actual', planned && actual?.duration === 17 ? 'PASS' : 'FAIL', `planned=30 actual=${actual?.duration ?? 'missing'} separate=${planned && actual?.duration === 17}`);

  await page.goto(`${base}/index.html#finance`);
  await settle(page);
  await page.locator('#finance-more-open').click();
  await page.locator('#finance-filters-open').click();
  await page.locator('#finance-advanced-open').click();
  await page.locator('#finance-income-input').fill('12.34');
  await page.locator('#finance-expense-input').fill('2.34');
  await page.locator('#finance-note').fill('ASCII finance');
  await page.locator('#finance-submit').click();
  await page.waitForTimeout(80);
  data = JSON.parse((await storage(page))['my-life-dashboard-v1'] || '{"finances":[]}');
  const finance = data.finances.some(item => item.note === 'ASCII finance');
  const financeIncome = await page.locator('#finance-income').textContent();
  const financeExpense = await page.locator('#finance-expense').textContent();
  const summaryPass = finance && financeIncome?.includes('12.34') && financeExpense?.includes('2.34');
  record('finance-save-summary', summaryPass ? 'PASS' : 'FAIL', `records=${data.finances.length} income=${financeIncome} expense=${financeExpense}`);

  await page.goto(`${base}/index.html#daily-notes`);
  await settle(page);
  await page.locator('#ideas-compose-open').click();
  await page.locator('#idea-rich-editor .ql-editor').fill('ASCII idea body alpha');
  await page.locator('#diary-form button[type="submit"]').click();
  await page.waitForTimeout(100);
  let personal = JSON.parse((await storage(page))['my-life-dashboard-personal-v1'] || '{"diary":[]}');
  const idea = personal.diary.find(item => item.content === 'ASCII idea body alpha');
  let ideaDetail = false;
  let ideaEdited = false;
  if (idea) {
    await page.locator(`[data-open-note="${idea.id}"]`).first().click();
    await page.waitForTimeout(80);
    ideaDetail = page.url().includes(`#note/${encodeURIComponent(idea.id)}`)
      && (await page.locator('#note-detail').textContent() || '').includes('ASCII idea body alpha');
    const edit = page.locator(`[data-edit-note="${idea.id}"]`).first();
    if (await edit.count()) {
      await edit.click();
      await page.locator('#idea-rich-editor .ql-editor').fill('ASCII idea body beta');
      await page.locator('#diary-form button[type="submit"]').click();
      await page.waitForTimeout(100);
      personal = JSON.parse((await storage(page))['my-life-dashboard-personal-v1'] || '{"diary":[]}');
      ideaEdited = personal.diary.some(item => item.id === idea.id && item.content === 'ASCII idea body beta');
    }
  }
  record('ideas-save-edit-detail', idea && ideaDetail && ideaEdited ? 'PASS' : 'FAIL', `idea=${idea?.id || 'missing'} detail=${ideaDetail} edited=${ideaEdited}`);

  await page.goto(`${base}/index.html#backup`);
  await settle(page);
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#backup-export-notes').click();
  const download = await downloadPromise;
  const backupPath = path.join(artifactDir, 'synthetic-v11.json');
  await download.saveAs(backupPath);
  const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  const exportPass = backup.schemaVersion === 11 && backup.format === 'my-life-dashboard-backup';

  const restored = await freshContext(browser);
  const restoredPage = await restored.newPage();
  await restoredPage.goto(`${base}/index.html#backup`);
  await settle(restoredPage);
  await restoredPage.locator('#backup-file').setInputFiles(backupPath);
  await restoredPage.waitForSelector('#backup-preview:not(.hidden)');
  const previewVisible = await restoredPage.locator('#backup-preview').isVisible();
  const beforeConfirmation = (await storage(restoredPage))['my-life-dashboard-v1'];
  await restoredPage.locator('#backup-import-confirm').click();
  await restoredPage.locator('#confirm-dialog[open]').waitFor({state: 'visible'});
  const confirmationPreserved = (await storage(restoredPage))['my-life-dashboard-v1'] === beforeConfirmation;
  await restoredPage.locator('#confirm-accept').click();
  await restoredPage.waitForFunction(id => JSON.parse(localStorage.getItem('my-life-dashboard-v1') || '{"tasks":[]}').tasks.some(row => row.id === id), task.id);
  const restoredData = JSON.parse((await storage(restoredPage))['my-life-dashboard-v1'] || '{"tasks":[]}');
  const originalData = JSON.parse((await storage(page))['my-life-dashboard-v1']);
  const coreIntact = ['studies','finances','tasks'].every(kind => originalData[kind].every(row =>
    isDeepStrictEqual(row, restoredData[kind].find(item => item.id === row.id))));
  const restoredPersonal = JSON.parse((await storage(restoredPage))['my-life-dashboard-personal-v1'] || '{"diary":[]}');
  const ideaIntact = personal.diary.every(row => isDeepStrictEqual(row, restoredPersonal.diary.find(item => item.id === row.id)));
  record('json-v11-export-preview-restore', exportPass && previewVisible && confirmationPreserved && coreIntact && ideaIntact ? 'PASS' : 'FAIL', `schema=${backup.schemaVersion} preview=${previewVisible} confirmation=${confirmationPreserved} core=${coreIntact} ideas=${ideaIntact}`);

  await restoredPage.locator('#backup-file').setInputFiles(backupPath);
  await restoredPage.waitForSelector('#backup-preview:not(.hidden)');
  const duplicateCount = Number(await restoredPage.locator('#backup-duplicate-count').textContent() || 0);
  const beforeInvalid = JSON.stringify(await storage(restoredPage));
  const invalidPath = path.join(artifactDir, 'synthetic-invalid.json');
  fs.writeFileSync(invalidPath, '{"format":"wrong","schemaVersion":11}\n');
  await restoredPage.locator('#backup-file').setInputFiles(invalidPath);
  await restoredPage.waitForTimeout(100);
  const afterInvalid = JSON.stringify(await storage(restoredPage));
  const invalidBlocked = !(await restoredPage.locator('#backup-preview').isVisible());
  const invalidMessage = await restoredPage.locator('#backup-status').textContent();
  record('restore-dedupe-invalid-preserve', duplicateCount > 0 && beforeInvalid === afterInvalid && invalidBlocked && /无效|错误|失败/.test(invalidMessage) ? 'PASS' : 'FAIL', `duplicates=${duplicateCount} preserved=${beforeInvalid === afterInvalid} preview_hidden=${invalidBlocked} error=${invalidMessage}`);
  await restored.close();

  const isolated = await freshContext(browser);
  const isolatedPage = await isolated.newPage();
  await isolatedPage.goto(`${base}/index.html#overview`);
  await settle(isolatedPage);
  const isolatedState = await storage(isolatedPage);
  const isolatedPass = !isolatedState['my-life-dashboard-v1'];
  record('context-storage-isolation', isolatedPass ? 'PASS' : 'FAIL', `fresh_storage_keys=${Object.keys(isolatedState).length}`);
  await isolated.close();
  await context.close();

  await assertLayout(browser, {width: 390, height: 500}, 'layout-390x500');
  await assertLayout(browser, {width: 414, height: 896}, 'layout-414x896');
  await assertLayout(browser, {width: 1366, height: 900}, 'layout-1366x900');
  record('bottom-navigation', checks.some(item => item.evidence.includes('"navFixed":true')) ? 'PASS' : 'FAIL', 'mobile contexts require a visible fixed/sticky bottom navigation');

  const pwa = await freshContext(browser);
  const pwaPage = await pwa.newPage();
  await pwaPage.goto(`${base}/index.html#overview`);
  await settle(pwaPage);
  await pwaPage.waitForFunction(() => 'serviceWorker' in navigator);
  await pwaPage.evaluate(() => Promise.race([
    navigator.serviceWorker.ready,
    new Promise((_, reject) => setTimeout(() => reject(new Error(
      'Service worker did not activate: ' + document.querySelector('#pwa-version')?.textContent
      + ' / ' + document.querySelector('#pwa-message')?.textContent,
    )), 15000)),
  ]));
  await pwaPage.reload();
  await settle(pwaPage);
  await pwa.setOffline(true);
  await pwaPage.reload({waitUntil: 'domcontentloaded'});
  const offlineTitle = await pwaPage.title();
  const offlineShell = await pwaPage.locator('#overview-section').isVisible();
  const offlineControlled = await pwaPage.evaluate(() => Boolean(navigator.serviceWorker.controller) && !navigator.onLine);
  record('offline-pwa', offlineTitle && offlineShell && offlineControlled ? 'PASS' : 'FAIL', `title=${offlineTitle} shell=${offlineShell} controlled_offline=${offlineControlled}`);
  await pwa.close();

  record('browser-console', consoleErrors.length ? 'FAIL' : 'PASS', consoleErrors.length ? consoleErrors.join(' | ') : 'No pageerror or console.error');
}

run().catch(error => {
  record('browser-harness', 'ERROR', error.stack || error.message);
}).finally(async () => {
  const cleanup = [];
  try {
    await closeBrowser(browser);
  } catch (error) {
    cleanup.push(`browser=${error.message}`);
  }
  for (const [name, instance] of [['server', server]]) {
    try {
      await closeServer(instance);
    } catch (error) {
      cleanup.push(`${name}=${error.message}`);
    }
  }
  if (cleanup.length) record('browser-cleanup', 'FAIL', cleanup.join('; '));
  console.log(JSON.stringify({checks}, null, 2));
  process.exitCode = checks.length && checks.every(item => item.status === 'PASS') ? 0 : 1;
});
