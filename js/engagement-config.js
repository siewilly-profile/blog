function getRuntimeEnv() {
    if (typeof window === "undefined") {
        return {};
    }
    var env = window.__BLOG_ENV__;
    return env && typeof env === "object" ? env : {};
}

function toBool(value, fallbackValue) {
    if (value === true || value === "true" || value === "1") return true;
    if (value === false || value === "false" || value === "0") return false;
    return fallbackValue;
}

function toPositiveNumber(value, fallbackValue) {
    var n = Number(value);
    if (Number.isFinite(n) && n > 0) return n;
    return fallbackValue;
}

var env = getRuntimeEnv();

export const ENGAGEMENT_CONFIG = {
    enabled: toBool(env.ENGAGEMENT_ENABLED, false),
    endpoint: env.ENGAGEMENT_ENDPOINT || "",
    scriptSrc: env.ENGAGEMENT_SCRIPT_SRC || "https://gc.zgo.at/count.js",
    // Count at most once per page key in this period for the same browser.
    viewThrottleMinutes: toPositiveNumber(env.ENGAGEMENT_VIEW_THROTTLE_MINUTES, 30)
};
