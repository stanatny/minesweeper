import en from "./locales/en.json" with { type: "json" };
import zhCn from "./locales/zh_cn.json" with { type: "json" };

const MESSAGES = { en, "zh-CN": zhCn };
const STORAGE_KEY = "void-survey.locale";

/** 创建双语文案服务；storage 可传入浏览器存储，返回翻译、语言切换和静态页面更新方法。 */
export function createI18n({ storage = defaultStorage() } = {}) {
  let locale = "en";
  try {
    locale = supportedLocale(storage?.getItem(STORAGE_KEY));
  } catch {
    // 禁用存储或隐私模式不影响默认英文界面和本次语言切换。
  }

  function t(key, params = {}) {
    const message = Object.hasOwn(MESSAGES[locale], key)
      ? MESSAGES[locale][key]
      : Object.hasOwn(en, key)
        ? en[key]
        : key;
    return message.replace(/\{(\w+)\}/g, (placeholder, name) =>
      Object.hasOwn(params, name) ? String(params[name]) : placeholder,
    );
  }

  function setLocale(nextLocale) {
    locale = supportedLocale(nextLocale);
    try {
      storage?.setItem(STORAGE_KEY, locale);
    } catch {
      // 当前页面仍能切换语言，不把存储权限问题转成游戏错误。
    }
    return locale;
  }

  function translatePage(root = document) {
    const owner = root.ownerDocument || root;
    if (owner.documentElement) owner.documentElement.lang = locale;
    for (const element of root.querySelectorAll("[data-i18n]")) {
      element.textContent = t(element.getAttribute("data-i18n"));
    }
    for (const attribute of ["title", "aria-label", "placeholder"]) {
      const marker = `data-i18n-${attribute}`;
      for (const element of root.querySelectorAll(`[${marker}]`)) {
        element.setAttribute(attribute, t(element.getAttribute(marker)));
      }
    }
  }

  return { t, getLocale: () => locale, setLocale, translatePage };
}

function supportedLocale(locale) {
  return Object.hasOwn(MESSAGES, locale) ? locale : "en";
}

function defaultStorage() {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}
