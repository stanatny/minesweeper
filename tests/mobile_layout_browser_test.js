import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const BASE_URL = process.env.SURVEY_TEST_URL || "http://127.0.0.1:8765";
const checks = [],
  errors = [];
const browser = await chromium.launch({ channel: "chrome", headless: true });
await mkdir("artifacts", { recursive: true });

// 从首屏直接命中真实控件，避免 Playwright 自动滚动掩盖手机入口不可达的问题。
async function tapWithoutScrolling(page, id) {
  const box = await page.locator(`#${id}`).boundingBox();
  assert.ok(
    box && box.y >= 0 && box.y + box.height <= page.viewportSize().height,
    `${id} is reachable on the first screen`,
  );
  const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  assert.equal(
    await page.evaluate(
      ({ id, point }) =>
        document.elementFromPoint(point.x, point.y)?.closest("button")?.id ===
        id,
      { id, point },
    ),
    true,
  );
  await page.touchscreen.tap(point.x, point.y);
  assert.equal(await page.evaluate(() => scrollY), 0);
}

try {
  for (const [width, height] of [
    [320, 667],
    [375, 667],
    [375, 844],
    [390, 844],
    [760, 844],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${BASE_URL}/?test=1`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => window.__surveyTest?.getScene()?.renderer);
    assert.equal(await page.locator("#settings-panel").isVisible(), false);
    for (const locale of ["en", "zh-CN"]) {
      await page.selectOption("#language-select", locale);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      await tapWithoutScrolling(page, "flag-mode");
      assert.equal(
        await page.locator("#flag-mode").getAttribute("aria-pressed"),
        "true",
      );
      await tapWithoutScrolling(page, "reveal-mode");
      assert.equal(
        await page.locator("#reveal-mode").getAttribute("aria-pressed"),
        "true",
      );
      await tapWithoutScrolling(page, "surface-generate");
      await tapWithoutScrolling(page, "new-game");
      const stage = await page.locator("#scene-stage").boundingBox();
      const toolbar = await page.locator(".control-dock").boundingBox();
      assert.ok(
        toolbar.y + toolbar.height <= stage.y,
        "Toolbar never covers the board",
      );
      assert.ok(
        stage.height >= 300 && stage.y + stage.height <= height,
        "Complete board fits the first viewport",
      );
      assert.equal(
        await page.locator("#surface-draft-note").isVisible(),
        false,
      );
      await page.screenshot({
        path: `artifacts/mobile_play_${width}_${height}_${locale}.png`,
        fullPage: true,
      });
      checks.push({ width, height, locale, stage, toolbar });
    }
    await page.locator("#mobile-settings-toggle").tap();
    assert.equal(await page.locator("#settings-panel").isVisible(), true);
    await page.locator("#surface-irregularity").focus();
    await page.keyboard.press("End");
    assert.equal(await page.locator("#surface-draft-note").isVisible(), true);
    assert.match(
      await page.locator("#mobile-field-summary").innerText(),
      /75%/,
    );
    await page.locator("#mobile-settings-toggle").tap();
    assert.equal(await page.locator("#surface-draft-note").isVisible(), true);
    await page.locator("#surface-generate").tap();
    assert.match(
      await page.locator("#mobile-field-summary").innerText(),
      /100%/,
    );
    assert.equal(await page.locator("#surface-draft-note").isVisible(), false);
    await page.locator("#mobile-settings-toggle").tap();
    await page.selectOption("#board-mode", "plane");
    await page.locator("#mobile-settings-toggle").tap();
    assert.equal(await page.locator("#surface-generate").isVisible(), false);
    await page.evaluate(() => scrollTo(0, 0));
    await tapWithoutScrolling(page, "flag-mode");
    await tapWithoutScrolling(page, "reveal-mode");
    await context.close();
  }
  for (const width of [820, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${BASE_URL}/?test=1`, { waitUntil: "networkidle" });
    await page.locator("#scene-stage canvas").waitFor();
    assert.equal(await page.locator("#settings-panel").isVisible(), true);
    assert.equal(
      await page.locator("#mobile-settings-toggle").isVisible(),
      false,
    );
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.screenshot({
      path: `artifacts/mobile_play_desktop_${width}.png`,
      fullPage: true,
    });
    await page.close();
  }
  assert.deepEqual(errors, []);
  await writeFile(
    "artifacts/mobile_layout_checks.json",
    JSON.stringify({ checks, errors }, null, 2) + "\n",
  );
  console.log(
    "PASS mobile first-screen controls, complete board, draft/apply summary, planar controls, desktop layout and both languages",
  );
} finally {
  await browser.close();
}
