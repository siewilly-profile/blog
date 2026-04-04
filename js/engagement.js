import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
    getFirestore,
    doc,
    getDoc,
    runTransaction,
    increment,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { ENGAGEMENT_CONFIG } from "./engagement-config.js";

var app = null;
var db = null;

function isEnabled() {
    return ENGAGEMENT_CONFIG && ENGAGEMENT_CONFIG.enabled === true;
}

function toPageId(pageKey) {
    var encoded = encodeURIComponent(pageKey);
    return encoded.length > 1200 ? encoded.slice(0, 1200) : encoded;
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

function ensureFirebase() {
    if (!isEnabled()) {
        return false;
    }

    if (!app) {
        app = initializeApp(ENGAGEMENT_CONFIG.firebase);
        db = getFirestore(app);
    }
    return true;
}

async function readViews(pageId) {
    var pageRef = doc(db, "pages", pageId);
    var snap = await getDoc(pageRef);
    if (!snap.exists()) return 0;
    var data = snap.data();
    return data.views || 0;
}

function setViewText(selector, views) {
    if (!selector) return;
    var el = document.querySelector(selector);
    if (!el) return;
    el.textContent = "瀏覽 " + views;
}

async function trackPageView(options) {
    var opts = options || {};
    if (!ensureFirebase()) {
        return 0;
    }

    var pageKey = getPageKey(opts.pageKey);
    var pageId = toPageId(pageKey);
    var throttleMinutes = opts.throttleMinutes || ENGAGEMENT_CONFIG.viewThrottleMinutes || 30;
    var pageRef = doc(db, "pages", pageId);

    if (shouldCountView(pageId, throttleMinutes)) {
        await runTransaction(db, async function (tx) {
            var snap = await tx.get(pageRef);
            if (!snap.exists()) {
                tx.set(pageRef, {
                    pageKey: pageKey,
                    views: 1,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
                return;
            }

            tx.update(pageRef, {
                views: increment(1),
                updatedAt: serverTimestamp()
            });
        });
    }

    var views = await readViews(pageId);
    setViewText(opts.displaySelector, views);
    return views;
}

window.Engagement = {
    trackPageView: trackPageView
};

export { trackPageView };
