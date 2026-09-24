import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createI18n } from "../js/i18n.js";

const STORAGE_KEY = "void-survey.locale";
const english = JSON.parse(
  await readFile(new URL("../js/locales/en.json", import.meta.url), "utf8"),
);
const chinese = JSON.parse(
  await readFile(new URL("../js/locales/zh_cn.json", import.meta.url), "utf8"),
);

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
  };
}

function placeholders(message) {
  return [...message.matchAll(/\{([^{}]+)\}/g)].map((match) => match[1]).sort();
}

// 只模拟翻译所需的 DOM 接口；任何 innerHTML 写入都立即失败。
class TextElement {
  constructor(attributes = {}, children = []) {
    this.attributes = new Map(Object.entries(attributes));
    this.children = children;
    this.textContent = "";
    this.value = "Keep the form draft";
    this.nodeType = 1;
    this.dataset = Object.fromEntries(
      Object.entries(attributes)
        .filter(([name]) => name.startsWith("data-"))
        .map(([name, value]) => [
          name
            .slice(5)
            .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()),
          value,
        ]),
    );
  }
  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }
  hasAttribute(name) {
    return this.attributes.has(name);
  }
  matches(selector) {
    return selector
      .split(",")
      .some((part) => this.hasAttribute(part.trim().slice(1, -1)));
  }
  querySelectorAll(selector) {
    return this.children
      .flatMap((child) => [
        child,
        ...child.querySelectorAll(
          "[data-i18n], [data-i18n-title], [data-i18n-aria-label], [data-i18n-placeholder]",
        ),
      ])
      .filter((child) => child.matches(selector));
  }
  set innerHTML(_value) {
    throw new Error("Translations must not write innerHTML");
  }
}

test("English and Chinese catalogs have the same nonempty flat message keys", () => {
  const keys = Object.keys(english).sort();
  assert(keys.length > 0);
  assert.deepEqual(Object.keys(chinese).sort(), keys);
  assert(keys.some((key) => key.startsWith("ui.")));
  assert(keys.some((key) => key.startsWith("game.")));
  for (const key of keys) {
    for (const catalog of [english, chinese]) {
      assert.equal(typeof catalog[key], "string", key);
      assert(catalog[key].trim().length > 0, key);
    }
  }
});

test("translations preserve every interpolation placeholder", () => {
  for (const key of Object.keys(english)) {
    assert.deepEqual(
      placeholders(chinese[key]),
      placeholders(english[key]),
      key,
    );
  }
});

test("the first visit starts in English even when the browser prefers Chinese", () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { language: "zh-CN", languages: ["zh-CN", "en"] },
  });
  try {
    const i18n = createI18n({ storage: memoryStorage() });
    assert.equal(i18n.getLocale(), "en");
  } finally {
    if (descriptor) Object.defineProperty(globalThis, "navigator", descriptor);
    else delete globalThis.navigator;
  }
});

test("saved preferences restore and language changes persist under the namespaced key", () => {
  const storage = memoryStorage({
    [STORAGE_KEY]: "zh-CN",
    unrelated: "preserve",
  });
  const i18n = createI18n({ storage });
  assert.equal(i18n.getLocale(), "zh-CN");
  i18n.setLocale("en");
  assert.equal(i18n.getLocale(), "en");
  assert.equal(storage.getItem(STORAGE_KEY), "en");
  assert.equal(storage.getItem("unrelated"), "preserve");
  assert.equal(createI18n({ storage }).getLocale(), "en");
  i18n.setLocale("zh-CN");
  assert.equal(createI18n({ storage }).getLocale(), "zh-CN");
});

test("unsupported saved or requested locales fall back to English", () => {
  for (const locale of ["fr", "zh", "zh_cn", "", null, "constructor"]) {
    const i18n = createI18n({
      storage: memoryStorage({ [STORAGE_KEY]: locale }),
    });
    assert.equal(i18n.getLocale(), "en");
    i18n.setLocale("zh-CN");
    i18n.setLocale(locale);
    assert.equal(i18n.getLocale(), "en");
    const key = Object.keys(english).find(
      (item) => placeholders(english[item]).length === 0,
    );
    assert.equal(i18n.t(key), english[key]);
  }
});

test("storage read and write exceptions do not prevent translation or language switching", () => {
  const blocked = {
    getItem() {
      throw new Error("Storage access denied");
    },
    setItem() {
      throw new Error("Storage quota exceeded");
    },
  };
  const i18n = createI18n({ storage: blocked });
  assert.equal(i18n.getLocale(), "en");
  assert.doesNotThrow(() => i18n.setLocale("zh-CN"));
  assert.equal(i18n.getLocale(), "zh-CN");
  const key = Object.keys(chinese).find(
    (item) => placeholders(chinese[item]).length === 0,
  );
  assert.equal(i18n.t(key), chinese[key]);
  assert.doesNotThrow(() => i18n.setLocale("en"));
  assert.equal(i18n.getLocale(), "en");
});

test("a blocked global storage getter still allows a first visit and in-memory language changes", () => {
  const descriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    "localStorage",
  );
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get() {
      throw new Error("Storage is unavailable in this document");
    },
  });
  try {
    const i18n = createI18n();
    assert.equal(i18n.getLocale(), "en");
    assert.doesNotThrow(() => i18n.setLocale("zh-CN"));
    assert.equal(i18n.getLocale(), "zh-CN");
  } finally {
    if (descriptor)
      Object.defineProperty(globalThis, "localStorage", descriptor);
    else delete globalThis.localStorage;
  }
});

test("unknown message keys remain identifiable instead of producing empty copy", () => {
  const i18n = createI18n({ storage: memoryStorage() });
  for (const locale of ["en", "zh-CN"]) {
    i18n.setLocale(locale);
    for (const key of [
      "missing.message.key",
      "constructor",
      "toString",
      "__proto__",
    ]) {
      assert.equal(i18n.t(key), key);
    }
  }
});

test("catalog messages interpolate repeated parameters and preserve Chinese markup as plain text", () => {
  const i18n = createI18n({ storage: memoryStorage() });
  const payload = '<img src=x onerror="globalThis.injected=true">中文';
  for (const locale of ["en", "zh-CN"]) {
    i18n.setLocale(locale);
    const catalog = locale === "en" ? english : chinese;
    const parameterized = Object.entries(catalog).filter(
      ([, value]) => placeholders(value).length > 0,
    );
    assert(parameterized.length > 0);
    for (const [key, template] of parameterized) {
      const params = Object.fromEntries(
        placeholders(template).map((name, index) => [
          name,
          index === 0 ? payload : 0,
        ]),
      );
      const expected = template.replace(/\{([^{}]+)\}/g, (_, name) =>
        String(params[name]),
      );
      assert.equal(i18n.t(key, params), expected, key);
    }
  }
});

test("page translation changes text, accessible attributes, and document language without HTML or form resets", () => {
  const key = Object.keys(english).find(
    (item) =>
      english[item] !== chinese[item] &&
      placeholders(english[item]).length === 0,
  );
  assert(key);
  const copy = new TextElement({ "data-i18n": key });
  const input = new TextElement({
    "data-i18n-title": key,
    "data-i18n-aria-label": key,
    "data-i18n-placeholder": key,
  });
  const literal = '<img src=x onerror="globalThis.injected=true">中文';
  const untrusted = new TextElement({ "data-i18n": literal });
  const root = new TextElement({}, [copy, input, untrusted]);
  const documentElement = new TextElement();
  for (const node of [root, copy, input, untrusted])
    node.ownerDocument = { documentElement };
  const i18n = createI18n({ storage: memoryStorage() });
  for (const locale of ["en", "zh-CN", "en"]) {
    i18n.setLocale(locale);
    assert.doesNotThrow(() => i18n.translatePage(root));
    const expected = locale === "en" ? english[key] : chinese[key];
    assert.equal(copy.textContent, expected);
    assert.equal(input.getAttribute("title"), expected);
    assert.equal(input.getAttribute("aria-label"), expected);
    assert.equal(input.getAttribute("placeholder"), expected);
    assert.equal(input.value, "Keep the form draft");
    assert.equal(untrusted.textContent, literal);
    assert.equal(
      documentElement.lang ?? documentElement.getAttribute("lang"),
      locale,
    );
  }
});
