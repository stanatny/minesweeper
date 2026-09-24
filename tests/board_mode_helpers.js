import assert from "node:assert/strict";

/** 首屏必须是真实的 216 格深凹立体，不经过测试专用启动参数或模式切换。 */
export async function assertDefaultSurface(page) {
  await page.waitForFunction(() => window.__surveyTest?.getScene()?.renderer);
  assert.deepEqual(
    await page
      .locator("#board-mode option")
      .evaluateAll((options) => options.map((option) => option.value)),
    ["surface", "plane"],
    "The faceted field must be the first of the two real mode choices",
  );
  assert.equal(await page.locator("#board-mode").inputValue(), "surface");
  const initial = await page.evaluate(() => {
    const game = window.__surveyTest.getGame();
    return {
      mode: document.body.dataset.boardMode,
      status: game.status,
      kind: game.topology?.kind,
      shape: game.topology?.shape,
      resolution: game.topology?.resolution,
      irregularity: game.topology?.irregularity,
      count: game.cells.length,
    };
  });
  assert.deepEqual(initial, {
    mode: "surface",
    status: "ready",
    kind: "surface",
    shape: "stepped",
    resolution: 6,
    irregularity: 0.75,
    count: 216,
  });
}

/** 通过真实设置控件进入平面测试前置条件，不改变产品默认模式。 */
export async function selectPlanarBoard(
  page,
  { keepSettingsOpen = false } = {},
) {
  await page.waitForFunction(() => window.__surveyTest?.getScene()?.renderer);
  const settingsWereOpen = await page.locator("#settings-panel").isVisible();
  if (!(await page.locator("#board-mode").isVisible()))
    await page.locator("#settings-btn").click();
  await page.locator("#board-mode").selectOption("plane");
  await page.waitForFunction(() => {
    const test = window.__surveyTest;
    return (
      document.body.dataset.boardMode === "plane" &&
      !test.getGame().topology &&
      test.getScene()?.renderer
    );
  });
  assert.equal(await page.locator("#board-mode").inputValue(), "plane");
  if (!settingsWereOpen && !keepSettingsOpen)
    await page.locator("#settings-btn").click();
  await page.locator("#scene-stage canvas").waitFor({ state: "visible" });
}
