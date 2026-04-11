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

var env = getRuntimeEnv();

export const GISCUS_CONFIG = {
    enabled: toBool(env.GISCUS_ENABLED, false),
    repo: env.GISCUS_REPO || "",
    repoId: env.GISCUS_REPO_ID || "",
    category: env.GISCUS_CATEGORY || "",
    categoryId: env.GISCUS_CATEGORY_ID || "",
    mapping: env.GISCUS_MAPPING || "pathname",
    strict: String(env.GISCUS_STRICT || "0"),
    reactionsEnabled: String(env.GISCUS_REACTIONS_ENABLED || "1"),
    emitMetadata: String(env.GISCUS_EMIT_METADATA || "0"),
    inputPosition: env.GISCUS_INPUT_POSITION || "bottom",
    theme: env.GISCUS_THEME || "preferred_color_scheme",
    lang: env.GISCUS_LANG || "zh-TW"
};
