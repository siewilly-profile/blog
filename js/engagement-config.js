import { getRuntimeEnv } from "./env-loader.js";

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

function getEngagementConfig() {
    var env = getRuntimeEnv();
    return {
        enabled: toBool(env.ENGAGEMENT_ENABLED, false),
        endpoint: env.ENGAGEMENT_ENDPOINT || "",
        scriptSrc: env.ENGAGEMENT_SCRIPT_SRC || "https://gc.zgo.at/count.js",
        // Count at most once per page key in this period for the same browser.
        viewThrottleMinutes: toPositiveNumber(env.ENGAGEMENT_VIEW_THROTTLE_MINUTES, 30)
    };
}

export { getEngagementConfig };
