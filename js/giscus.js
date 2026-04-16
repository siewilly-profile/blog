import { ensureEnvLoaded } from "./env-loader.js";
import { getGiscusConfig } from "./giscus-config.js";

function getConfig() {
    return getGiscusConfig();
}

function isReady(cfg) {
    return !!(
        cfg.enabled &&
        cfg.repo &&
        cfg.repoId &&
        cfg.category &&
        cfg.categoryId
    );
}

function showHint(target) {
    target.innerHTML = '' +
        '<div class="comments-card giscus-hint">' +
            '<h3 class="comments-title">留言板</h3>' +
            '<p>尚未啟用 giscus。請先在 <strong>.env</strong> 設定 GISCUS_* 變數。</p>' +
        '</div>';
}

async function mountGiscus(options) {
    var opts = options || {};
    var target = document.querySelector(opts.containerSelector || "#comments");
    if (!target) return;

    await ensureEnvLoaded();

    var cfg = getConfig();
    if (!isReady(cfg)) {
        showHint(target);
        return;
    }

    var hasExplicitTerm = typeof opts.term === "string" && opts.term.trim() !== "";
    var term = hasExplicitTerm ? opts.term.trim() : window.location.pathname;
    // When an explicit term is provided, force `specific` so each post keeps an independent thread.
    var mapping = hasExplicitTerm ? "specific" : (cfg.mapping || "pathname");
    target.innerHTML = '<div class="comments-card"><h3 class="comments-title">留言板</h3><div id="giscus-thread"></div></div>';

    var thread = target.querySelector("#giscus-thread");
    var script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";

    script.setAttribute("data-repo", cfg.repo);
    script.setAttribute("data-repo-id", cfg.repoId);
    script.setAttribute("data-category", cfg.category);
    script.setAttribute("data-category-id", cfg.categoryId);
    script.setAttribute("data-mapping", mapping);
    script.setAttribute("data-term", term);
    script.setAttribute("data-strict", cfg.strict || "1");
    script.setAttribute("data-reactions-enabled", cfg.reactionsEnabled || "1");
    script.setAttribute("data-emit-metadata", cfg.emitMetadata || "0");
    script.setAttribute("data-input-position", cfg.inputPosition || "top");
    script.setAttribute("data-theme", cfg.theme || "preferred_color_scheme");
    script.setAttribute("data-lang", cfg.lang || "zh-TW");

    thread.appendChild(script);
}

window.GiscusIntegration = {
    mountGiscus: mountGiscus
};

export { mountGiscus };
