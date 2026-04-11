var ENV_CACHE = null;
var ENV_LOADING_PROMISE = null;

function parseDotEnv(text) {
    var out = {};
    if (!text) return out;

    var lines = text.split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
        var raw = lines[i].trim();
        if (!raw || raw.charAt(0) === '#') continue;

        var eq = raw.indexOf('=');
        if (eq <= 0) continue;

        var key = raw.slice(0, eq).trim();
        var value = raw.slice(eq + 1).trim();

        if (
            (value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') ||
            (value.charAt(0) === "'" && value.charAt(value.length - 1) === "'")
        ) {
            value = value.slice(1, -1);
        }

        out[key] = value;
    }

    return out;
}

function mergeRuntimeEnv(values) {
    if (typeof window === 'undefined') {
        return values || {};
    }

    window.__BLOG_ENV__ = window.__BLOG_ENV__ || {};
    var target = window.__BLOG_ENV__;
    var source = values || {};
    var keys = Object.keys(source);

    for (var i = 0; i < keys.length; i++) {
        target[keys[i]] = source[keys[i]];
    }

    return target;
}

function ensureEnvLoaded() {
    if (ENV_CACHE) {
        return Promise.resolve(ENV_CACHE);
    }

    if (ENV_LOADING_PROMISE) {
        return ENV_LOADING_PROMISE;
    }

    if (typeof window === 'undefined' || typeof fetch !== 'function') {
        ENV_CACHE = {};
        return Promise.resolve(ENV_CACHE);
    }

    ENV_LOADING_PROMISE = fetch('../.env', { cache: 'no-store' })
        .then(function (response) {
            if (!response.ok) return '';
            return response.text();
        })
        .then(function (text) {
            var parsed = parseDotEnv(text);
            ENV_CACHE = mergeRuntimeEnv(parsed);
            return ENV_CACHE;
        })
        .catch(function () {
            ENV_CACHE = mergeRuntimeEnv({});
            return ENV_CACHE;
        })
        .finally(function () {
            ENV_LOADING_PROMISE = null;
        });

    return ENV_LOADING_PROMISE;
}

function getRuntimeEnv() {
    if (ENV_CACHE) return ENV_CACHE;
    if (typeof window === 'undefined') return {};
    var env = window.__BLOG_ENV__;
    return env && typeof env === 'object' ? env : {};
}

export { ensureEnvLoaded, getRuntimeEnv };
