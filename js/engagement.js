import { ensureEnvLoaded } from "./env-loader.js";
import { getEngagementConfig } from "./engagement-config.js";

var loaderPromise = null;

function isEnabled() {
    var cfg = getEngagementConfig();
    return cfg && cfg.enabled === true;
}

function getPageKey(defaultKey) {
    if (defaultKey) return defaultKey;

    var url = new URL(window.location.href);
    var post = url.searchParams.get("post");
    if (post) {
        return url.pathname + "?post=" + post;
    }
    return url.pathname;
}

function getThrottleKey(pageId) {
    return "engagement:view:" + pageId;
}

function shouldCountView(pageId, minutes) {
    try {
        var key = getThrottleKey(pageId);
        var now = Date.now();
        var old = localStorage.getItem(key);
        if (old) {
            var last = parseInt(old, 10);
            var gap = minutes * 60 * 1000;
            if (!Number.isNaN(last) && now - last < gap) {
                return false;
            }
        }
        localStorage.setItem(key, String(now));
        return true;
    } catch (_) {
        return true;
    }
}

function ensureGoatCounter() {
    if (!isEnabled()) {
        return Promise.resolve(false);
    }

    if (window.goatcounter && typeof window.goatcounter.count === "function") {
        return Promise.resolve(true);
    }

    if (loaderPromise) {
        return loaderPromise;
    }

    loaderPromise = new Promise(function (resolve, reject) {
        var cfg = getEngagementConfig();
        var endpoint = cfg.endpoint || "";
        var scriptSrc = cfg.scriptSrc || "https://gc.zgo.at/count.js";

        if (!endpoint) {
            resolve(false);
            return;
        }

        var existing = document.querySelector('script[data-goatcounter]');
        if (existing) {
            resolve(true);
            return;
        }

        // Disable automatic onload count; we count manually with throttling.
        window.goatcounter = window.goatcounter || {};
        window.goatcounter.no_onload = true;

        var script = document.createElement("script");
        script.async = true;
        script.src = scriptSrc;
        script.setAttribute("data-goatcounter", endpoint);
        script.addEventListener("load", function () { resolve(true); });
        script.addEventListener("error", function () { reject(new Error("Failed to load GoatCounter")); });
        document.head.appendChild(script);
    });

    return loaderPromise;
}

function setViewText(selector, text) {
    if (!selector) return;
    var el = document.querySelector(selector);
    if (!el) return;
    el.textContent = text;
}

async function trackPageView(options) {
    var opts = options || {};

    await ensureEnvLoaded();

    if (!isEnabled()) {
        setViewText(opts.displaySelector, "未啟用");
        return 0;
    }

    var pageKey = getPageKey(opts.pageKey);
    var pageId = encodeURIComponent(pageKey).slice(0, 1200);
    var cfg = getEngagementConfig();
    var throttleMinutes = opts.throttleMinutes || cfg.viewThrottleMinutes || 30;

    await ensureGoatCounter();

    if (shouldCountView(pageId, throttleMinutes) && window.goatcounter && typeof window.goatcounter.count === "function") {
        window.goatcounter.count({
            path: pageKey,
            title: document.title
        });
    }

    setViewText(opts.displaySelector, "已記錄");
    return 1;
}

window.Engagement = {
    trackPageView: trackPageView
};

export { trackPageView };
