import { GISCUS_CONFIG } from "./giscus-config.js";

function getConfig() {
    return GISCUS_CONFIG || {};
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
            '<p>尚未啟用 giscus。請先編輯 <strong>js/giscus-config.js</strong>。</p>' +
        '</div>';
}

function mountGiscus(options) {
    var opts = options || {};
    var target = document.querySelector(opts.containerSelector || "#comments");
    if (!target) return;

    var cfg = getConfig();
    if (!isReady(cfg)) {
        showHint(target);
        return;
    }

    var term = opts.term || window.location.pathname;
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
    script.setAttribute("data-mapping", cfg.mapping || "specific");
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
