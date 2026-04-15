var ENV_CACHE = null;
var ENV_LOADING_PROMISE = null;

function getEnvCandidates() {
    if (typeof window === 'undefined' || !window.location) {
        return ['.env'];
    }

    var path = window.location.pathname || '/';
    var fromPages = path.indexOf('/pages/') >= 0;

    if (fromPages) {
        return ['../.env', '/.env', '.env'];
    }

    return ['.env', '/.env', '../.env'];
}

function getPublicEnvCandidates() {
    if (typeof window === 'undefined' || !window.location) {
        return ['env.public.json'];
    }

    var path = window.location.pathname || '/';
    var fromPages = path.indexOf('/pages/') >= 0;

    if (fromPages) {
        return ['../env.public.json', '/env.public.json', 'env.public.json'];
    }

    return ['env.public.json', '/env.public.json', '../env.public.json'];
}

function tryFetchText(candidates) {
    var list = candidates || [];
    var index = 0;

    function next() {
        if (index >= list.length) {
            return Promise.resolve('');
        }

        var url = list[index++];
        return fetch(url, { cache: 'no-store' })
            .then(function (response) {
                if (!response.ok) {
                    return next();
                }
                return response.text();
            })
            .catch(function () {
                return next();
            });
    }

    return next();
}

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

    ENV_LOADING_PROMISE = tryFetchText(getEnvCandidates())
        .then(function (text) {
            var parsed = parseDotEnv(text);
            if (Object.keys(parsed).length > 0) {
                ENV_CACHE = mergeRuntimeEnv(parsed);
                return ENV_CACHE;
            }

            return tryFetchText(getPublicEnvCandidates()).then(function (publicText) {
                var publicParsed = {};
                try {
                    publicParsed = publicText ? JSON.parse(publicText) : {};
                } catch (e) {
                    publicParsed = {};
                }
                ENV_CACHE = mergeRuntimeEnv(publicParsed);
                return ENV_CACHE;
            });
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
