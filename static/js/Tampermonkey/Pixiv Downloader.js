// ==UserScript==
// @name         Pixiv Downloader
// @namespace    https://greasyfork.org/zh-CN/scripts/432150
// @version      0.9.6
// @description:en  Download the original images of Pixiv pages with one click. Supports：multiple illustrations, ugoira(animation), and batch downloads of artists' work. Ugoira support format conversion: Gif | Apng | Webp | Webm. The downloaded images will be saved in a separate folder named after the artist (you need to adjust the tampermonkey "Download" setting to "Browser API"). A record of downloaded images is kept.
// @description  一键下载Pixiv各页面原图。支持多图下载，动图下载，按作品标签下载，画师作品批量下载。动图支持格式转换：Gif | Apng | Webp | Webm。下载的图片将保存到以画师名命名的单独文件夹（需要调整tampermonkey“下载”设置为“浏览器API”）。保留已下载图片的记录。
// @description:zh-TW  一鍵下載Pixiv各頁面原圖。支持多圖下載，動圖下載，按作品標籤下載，畫師作品批次下載。動圖支持格式轉換：Gif | Apng | Webp | Webm。下載的圖片將保存到以畫師名命名的單獨文件夾（需要調整tampermonkey“下載”設置為“瀏覽器API”）。保留已下載圖片的紀錄。
// @author       ruaruarua
// @match        https://www.pixiv.net/*
// @icon         https://www.pixiv.net/favicon.ico
// @noframes
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_info
// @grant        GM_registerMenuCommand
// @connect      i.pximg.net
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js
// @require      https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js
// @require      https://greasyfork.org/scripts/455256-toanimatedwebp/code/toAnimatedWebp.js?version=1120088
// @downloadURL https://update.greasyfork.org/scripts/432150/Pixiv%20Downloader.user.js
// @updateURL https://update.greasyfork.org/scripts/432150/Pixiv%20Downloader.meta.js
// ==/UserScript==
(function (workerChunk, GIF, JSZip, dayjs) {
    'use strict';

    function _interopDefaultLegacy(e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var workerChunk__default = /*#__PURE__*/_interopDefaultLegacy(workerChunk);
    var GIF__default = /*#__PURE__*/_interopDefaultLegacy(GIF);
    var JSZip__default = /*#__PURE__*/_interopDefaultLegacy(JSZip);
    var dayjs__default = /*#__PURE__*/_interopDefaultLegacy(dayjs);

    var e = [], t$1 = []; function n(n, r) { if (n && "undefined" != typeof document) { var a, s = !0 === r.prepend ? "prepend" : "append", d = !0 === r.singleTag, i = "string" == typeof r.container ? document.querySelector(r.container) : document.getElementsByTagName("head")[0]; if (d) { var u = e.indexOf(i); -1 === u && (u = e.push(i) - 1, t$1[u] = {}), a = t$1[u] && t$1[u][s] ? t$1[u][s] : t$1[u][s] = c(); } else a = c(); 65279 === n.charCodeAt(0) && (n = n.substring(1)), a.styleSheet ? a.styleSheet.cssText += n : a.appendChild(document.createTextNode(n)); } function c() { var e = document.createElement("style"); if (e.setAttribute("type", "text/css"), r.attributes) for (var t = Object.keys(r.attributes), n = 0; n < t.length; n++)e.setAttribute(t[n], r.attributes[t[n]]); var a = "prepend" === s ? "afterbegin" : "beforeend"; return i.insertAdjacentElement(a, e), e } }

    var css$5 = ".pdl-hide{display:none!important}.pdl-unavailable{cursor:not-allowed!important;opacity:.5!important;pointer-events:none!important}.pdl-spacer{flex:1;margin:0;padding:0}:root{--pdl-btn-top:100;--pdl-btn-left:0;--pdl-btn-self-bookmark-top:75;--pdl-btn-self-bookmark-left:100}:root,:root[data-theme=default]{--pdl-bg1:#fff;--pdl-bg2-hover:rgba(0,0,0,.05);--pdl-bg3-hover:#1f1f1f;--pdl-btn1:rgba(0,0,0,.04);--pdl-btn1-hover:rgba(0,0,0,.12);--pdl-border1:rgba(0,0,0,.1);--pdl-text1:#1f1f1f}@media (prefers-color-scheme:light){:root{--pdl-bg1:#fff;--pdl-bg2-hover:rgba(0,0,0,.05);--pdl-bg3-hover:#1f1f1f;--pdl-btn1:rgba(0,0,0,.04);--pdl-btn1-hover:rgba(0,0,0,.12);--pdl-border1:rgba(0,0,0,.1);--pdl-text1:#1f1f1f}}:root[data-theme=dark]{--pdl-bg1:#1f1f1f;--pdl-bg2-hover:hsla(0,0%,100%,.1);--pdl-bg3-hover:#9b9b9b;--pdl-btn1:hsla(0,0%,100%,.4);--pdl-btn1-hover:hsla(0,0%,100%,.6);--pdl-border1:hsla(0,0%,100%,.3);--pdl-text1:#d6d6d6}:root[data-theme=dark] .pdl-btn-main{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23D6D6D6' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z'/%3E%3C/svg%3E\")}:root[data-theme=dark] .pdl-dlbar .pdl-btn-all:before{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23858585' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z'/%3E%3C/svg%3E\")}:root[data-theme=dark] .pdl-dlbar .pdl-btn-all:hover:before{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23D6D6D6' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z'/%3E%3C/svg%3E\")}:root[data-theme=dark] .pdl-dlbar .pdl-stop:before{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23858585' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z'/%3E%3C/svg%3E\")}:root[data-theme=dark] .pdl-dlbar .pdl-stop:hover:before{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23D6D6D6' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z'/%3E%3C/svg%3E\")}@media (prefers-color-scheme:dark){:root{--pdl-bg1:#1f1f1f;--pdl-bg2-hover:hsla(0,0%,100%,.1);--pdl-bg3-hover:#9b9b9b;--pdl-btn1:hsla(0,0%,100%,.4);--pdl-btn1-hover:hsla(0,0%,100%,.6);--pdl-border1:hsla(0,0%,100%,.3);--pdl-text1:#d6d6d6}:root .pdl-btn-main{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23D6D6D6' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z'/%3E%3C/svg%3E\")}:root .pdl-dlbar .pdl-btn-all:before{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23858585' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z'/%3E%3C/svg%3E\")}:root .pdl-dlbar .pdl-btn-all:hover:before{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23D6D6D6' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z'/%3E%3C/svg%3E\")}:root .pdl-dlbar .pdl-stop:before{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23858585' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z'/%3E%3C/svg%3E\")}:root .pdl-dlbar .pdl-stop:hover:before{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23D6D6D6' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z'/%3E%3C/svg%3E\")}}";
    n(css$5, {});

    var css$4 = ".pdl-checkbox{appearance:none;background-color:#858585;border:2px solid transparent;border-radius:14px;box-sizing:border-box;cursor:pointer;height:14px;position:relative;transition:background-color .2s ease 0s,box-shadow .2s ease 0s;vertical-align:top;width:28px}.pdl-checkbox:hover{background-color:var(--pdl-bg3-hover)}.pdl-checkbox:checked{background-color:#0096fa}.pdl-checkbox:after{background-color:#fff;border-radius:10px;content:\"\";display:block;height:10px;left:0;position:absolute;top:0;transform:translateX(0);transition:transform .2s ease 0s;width:10px}.pdl-checkbox:checked:after{transform:translateX(14px)}";
    n(css$4, {});

    var css$3 = "@property --pdl-progress{syntax:\"<percentage>\";inherits:true;initial-value:0}@keyframes pdl_loading{to{transform:translate(-50%,-50%) rotate(1turn)}}.pdl-btn{background:no-repeat 50%/85%;background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%233C3C3C' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z'/%3E%3C/svg%3E\");border:none;border-radius:4px;color:#01b468;cursor:pointer;display:inline-block;font-size:13px;font-weight:700;height:32px;line-height:32px;margin:0;overflow:hidden;padding:0;position:relative;text-align:center;text-decoration:none!important;text-overflow:ellipsis;user-select:none;white-space:nowrap;width:32px}.pdl-btn.pdl-btn-main{margin:0 0 0 10px}.pdl-btn.pdl-btn-sub{background-color:hsla(0,0%,100%,.5);left:calc((100% - 32px)*var(--pdl-btn-left)/100);position:absolute;top:calc((100% - 32px)*var(--pdl-btn-top)/100)}.pdl-btn.pdl-btn-sub.presentation{border-radius:8px;left:auto;position:fixed;right:20px;top:50px}.pdl-btn.pdl-btn-sub.self-bookmark{left:calc((100% - 32px)*var(--pdl-btn-self-bookmark-left)/100);top:calc((100% - 32px)*var(--pdl-btn-self-bookmark-top)/100)}.pdl-btn.pdl-error{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23EA0000' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z'/%3E%3C/svg%3E\")!important}.pdl-btn.pdl-complete{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%2301B468' d='M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 48c110.532 0 200 89.451 200 200 0 110.532-89.451 200-200 200-110.532 0-200-89.451-200-200 0-110.532 89.451-200 200-200m140.204 130.267-22.536-22.718c-4.667-4.705-12.265-4.736-16.97-.068L215.346 303.697l-59.792-60.277c-4.667-4.705-12.265-4.736-16.97-.069l-22.719 22.536c-4.705 4.667-4.736 12.265-.068 16.971l90.781 91.516c4.667 4.705 12.265 4.736 16.97.068l172.589-171.204c4.704-4.668 4.734-12.266.067-16.971z'/%3E%3C/svg%3E\")!important}.pdl-btn.pdl-progress{background-image:none!important;cursor:default!important}.pdl-btn.pdl-progress:after{border-radius:50%;content:\"\";display:inline-block;height:27px;left:50%;-webkit-mask:radial-gradient(transparent,transparent 54%,#000 57%,#000);mask:radial-gradient(transparent,transparent 54%,#000 57%,#000);position:absolute;top:50%;transform:translate(-50%,-50%);width:27px}.pdl-btn.pdl-progress:not(:empty):after{background:conic-gradient(#01b468 0,#01b468 var(--pdl-progress),transparent var(--pdl-progress),transparent);transition:--pdl-progress .2s ease}.pdl-btn.pdl-progress:empty:after{animation:pdl_loading 1.5s linear infinite;background:conic-gradient(#01b468 0,#01b468 25%,rgba(1,180,104,.2) 25%,rgba(1,180,104,.2))}.pdl-btn.pdl-tag{background-color:var(--pdl-btn1);border-bottom-right-radius:4px;border-top-right-radius:4px;height:auto;left:-1px;transition:background-image .5s}.pdl-btn.pdl-tag:hover{background-color:var(--pdl-btn1-hover)}.pdl-btn.pdl-modal-tag{background-color:var(--pdl-btn1);background-origin:content-box;border-radius:4px;height:50px;padding:5px;position:absolute;right:65px;top:6px;transition:background-color .25s;width:42px}.pdl-btn.pdl-modal-tag:hover{background-color:var(--pdl-btn1-hover)}.pdl-btn.pdl-tag-hide{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'/%3E\")!important;pointer-events:none!important}.pdl-wrap-artworks{bottom:0;margin-top:40px;position:absolute;right:8px;top:0}.pdl-wrap-artworks .pdl-btn-sub.artworks{left:0;position:sticky;top:40px}";
    n(css$3, {});

    var css$2 = ".pdl-modal *{font-family:'win-bug-omega, system-ui, -apple-system, \"Segoe UI\", Roboto, Ubuntu, Cantarell, \"Noto Sans\", \"Hiragino Kaku Gothic ProN\", Meiryo, sans-serif';line-height:1.15}.pdl-modal{background-color:rgba(0,0,0,.32);display:flex;height:100%;left:0;position:fixed;top:0;user-select:none;width:100%;z-index:99}.pdl-modal .pdl-dialog{background-color:var(--pdl-bg1);border-radius:24px;font-size:16px;margin:auto;max-width:1000px;min-width:600px;padding:20px 40px 30px;position:relative;width:50vw}.pdl-modal .pdl-dialog .pdl-dialog-header>h3{font-size:1.17em;font-weight:700;margin:1em 0}.pdl-modal .pdl-dialog .pdl-dialog-close{background-color:transparent;background:linear-gradient(#7d7d7d,#7d7d7d) 50%/18px 2px no-repeat,linear-gradient(#7d7d7d,#7d7d7d) 50%/2px 18px no-repeat;border:none;border-radius:50%;cursor:pointer;height:25px;margin:0;padding:0;position:absolute;right:10px;top:10px;transform:rotate(45deg);transition:background-color .25s;width:25px}.pdl-modal .pdl-dialog .pdl-dialog-close:hover{background-color:rgba(0,0,0,.05)}.pdl-modal .pdl-dialog .pdl-dialog-content a{color:#0096fa;text-decoration:underline}.pdl-modal .pdl-dialog .pdl-dialog-content input[type=radio],.pdl-modal .pdl-dialog .pdl-dialog-content input[type=radio]+label{cursor:pointer}.pdl-modal .pdl-dialog .pdl-dialog-content hr{border:none;border-top:1px solid var(--pdl-border1);height:0!important;margin:0}.pdl-modal .pdl-dialog .pdl-dialog-content hr.sub{margin-inline-start:1.5em}.pdl-modal .pdl-dialog .pdl-dialog-content hr.vertical{border:none;border-left:1px solid var(--pdl-border1);height:1.15em!important}.pdl-modal .pdl-dialog .pdl-dialog-content .pdl-dialog-button{background-color:#fff;border:1px solid #7d7d7d;border-radius:5px;cursor:pointer;font-size:16px;line-height:1.15;padding:.5em 1.5em;transition:opacity .2s}.pdl-modal .pdl-dialog .pdl-dialog-content .pdl-dialog-button[disabled]{background-color:#fff;border-color:#e4e7ed;color:#c0c4cc;cursor:not-allowed!important;opacity:1!important}.pdl-modal .pdl-dialog .pdl-dialog-content .pdl-dialog-button:hover{opacity:.7}.pdl-modal .pdl-dialog .pdl-dialog-content .pdl-dialog-button.primary{background-color:#0096fa;border-color:#0096fa;color:#fff}.pdl-modal .pdl-dialog .pdl-dialog-content .pdl-dialog-button.primary[disabled]{background-color:#a0cfff;border-color:#a0cfff}.pdl-modal .pdl-dialog .pdl-dialog-content .pdl-dialog-button.icon{padding:.5em .8em}.pdl-changelog h4{font-weight:700!important;margin:1em 0}.pdl-changelog ul{padding-inline-start:40px!important}.pdl-changelog ul li{line-height:2;list-style-type:disc!important}.pdl-changelog p{margin:.5em 0}.pdl-tabs-nav{align-items:center;border-bottom:1px solid #dcdfe6;display:flex;position:relative}.pdl-tabs-nav .pdl-tabs__active-bar{background-color:#0096fa;bottom:-1px;height:2px;left:0;position:absolute;transition:width .2s,transform .2s;z-index:1}.pdl-tabs-nav .pdl-tab-item{cursor:pointer;line-height:2.5;padding:0 16px;transition:color .2s}.pdl-tabs-nav .pdl-tab-item:hover{color:#0096fa}.pdl-tabs-nav .pdl-tab-item.active{color:#0096fa;font-weight:700}.pdl-tabs-nav .pdl-tab-item:nth-child(2){padding-left:0}.pdl-tabs-nav .pdl-tab-item:last-child{padding-right:0}.pdl-tabs-content{min-height:200px;padding:16px}.pdl-tabs-content .option-header{font-weight:700}.pdl-tabs-content #pdl-setting-filename .pdl-input-wrap,.pdl-tabs-content #pdl-setting-filename .tags-option{align-items:center;display:flex;gap:12px;margin:12px 0}.pdl-tabs-content #pdl-setting-filename .pdl-input-wrap label,.pdl-tabs-content #pdl-setting-filename .tags-option .tags-title{cursor:default;font-weight:700;min-width:5em}.pdl-tabs-content #pdl-setting-filename .pdl-input-wrap input[type=text]{border:1px solid #333;flex:1;font-size:16px;height:auto;line-height:1.5;padding:.5em}.pdl-tabs-content #pdl-setting-filename .pdl-input-wrap input[type=text]:focus{background-color:#fff!important}.pdl-tabs-content #pdl-setting-filename .pdl-input-wrap button{line-height:1.5}.pdl-tabs-content #pdl-setting-filename .tags-option .tags-content{display:flex;flex:1;gap:20px}.pdl-tabs-content #pdl-setting-filename .pdl-options{align-items:center;cursor:pointer;display:flex;justify-content:space-between;padding:.6em 0}.pdl-tabs-content #pdl-setting-filename .pdl-options:hover{background-color:var(--pdl-bg2-hover)}.pdl-tabs-content #pdl-setting-ugoria #pdl-ugoria-format-wrap{display:flex;flex-wrap:nowrap;justify-content:space-between;margin:1.5em 1em}.pdl-tabs-content #pdl-setting-ugoria #pdl-ugoria-format-wrap .pdl-ugoria-format-item label{padding-left:4px}.pdl-tabs-content #pdl-setting-history div{margin:1em 0;text-align:center}.pdl-tabs-content #pdl-setting-history div .btn-history{width:80%}.pdl-tabs-content #pdl-setting-others .pdl-options{align-items:center;border-radius:4px;cursor:pointer;display:flex;gap:20px;padding:1em .5em;transition:background-color .2s}.pdl-tabs-content #pdl-setting-others .pdl-options:hover{background-color:var(--pdl-bg2-hover)}.pdl-tabs-content #pdl-setting-others .pdl-options.sub-option{padding:.5em;padding-inline-start:2em}.pdl-tabs-content #pdl-setting-donate{text-align:center}.pdl-tabs-content #pdl-setting-donate p{margin:.5em 0}.pdl-tabs-content .pdl-adjust-button{display:flex;gap:32px;justify-content:space-between}.pdl-tabs-content .pdl-adjust-button .pdl-adjust-content{flex:2}.pdl-tabs-content .pdl-adjust-button .pdl-adjust-content .pdl-adjust-item{margin-bottom:1em}.pdl-tabs-content .pdl-adjust-button .pdl-adjust-content .pdl-adjust-item .pdl-adjust-title{font-weight:700;margin-bottom:.8em}.pdl-tabs-content .pdl-adjust-button .pdl-adjust-content .pdl-adjust-item .pdl-adjust-select{align-items:center;display:flex;gap:20px;margin:.6em 0;padding:0 .4em}.pdl-tabs-content .pdl-adjust-button .pdl-adjust-content .pdl-adjust-item .pdl-adjust-select input[type=range]{flex:1 1;max-width:450px}.pdl-tabs-content .pdl-adjust-button .pdl-adjust-preview{align-self:center;display:flex;flex:1}.pdl-tabs-content .pdl-adjust-button .pdl-adjust-preview .pdl-thumbnail-sample{background-color:rgba(0,150,250,.15);border-radius:4px;height:184px;position:relative;width:184px}";
    n(css$2, {});

    var css$1 = ".pdl-dlbar{display:flex;flex-grow:1}.pdl-dlbar.pdl-dlbar-follow_latest{padding:0 8px}.pdl-dlbar .pdl-dlbar-status_bar{color:#858585;cursor:default;flex-grow:1;font-size:16px;font-weight:700;height:46px;line-height:46px;padding-right:8px;text-align:right;white-space:nowrap}.pdl-dlbar .pdl-btn-all,.pdl-dlbar .pdl-stop{background-color:transparent;border:none;padding:0 8px}.pdl-dlbar .pdl-btn-all:hover,.pdl-dlbar .pdl-stop:hover{color:var(--pdl-text1)}.pdl-dlbar .pdl-btn-all:before,.pdl-dlbar .pdl-stop:before{background:no-repeat 50%/85%;content:\"\";height:24px;transition:background-image .2s ease 0s;width:24px}.pdl-dlbar .pdl-btn-all:before{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23858585' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z'/%3E%3C/svg%3E\")}.pdl-dlbar .pdl-btn-all:hover:before{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%231F1F1F' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm-32-316v116h-67c-10.7 0-16 12.9-8.5 20.5l99 99c4.7 4.7 12.3 4.7 17 0l99-99c7.6-7.6 2.2-20.5-8.5-20.5h-67V140c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12z'/%3E%3C/svg%3E\")}.pdl-dlbar .pdl-stop:before{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23858585' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z'/%3E%3C/svg%3E\")}.pdl-dlbar .pdl-stop:hover:before{background-image:url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%231F1F1F' d='M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z'/%3E%3C/svg%3E\")}.pdl-filter-wrap{color:#858585;display:flex;font-size:14px;font-weight:700;gap:12px;justify-content:flex-end;line-height:14px;margin:4px 0;transition:color .2s ease 0s}.pdl-filter-wrap .pdl-filter:hover{color:var(--pdl-text1)}.pdl-filter-wrap .pdl-filter label{cursor:pointer;padding-left:8px}";
    n(css$1, {});

    const regexp = {
        preloadData: /"meta-preload-data" content='(.*?)'>/,
        globalData: /"meta-global-data" content='(.*?)'>/,
        artworksPage: /artworks\/(\d+)$/,
        userPage: /users\/(\d+)/,
        bookmarkPage: /users\/(\d+)\/bookmarks\/artworks/,
        userPageTags: /users\/\d+\/(artworks|illustrations|manga|bookmarks(?!artworks))/,
        searchPage: /\/tags\/.*\/(artworks|illustrations|manga)/,
        suscribePage: /bookmark_new_illust/,
        activityHref: /illust_id=(\d+)/,
        originSrcPageNum: /(?<=_p)\d+/,
        followLatest: /\/bookmark_new_illust(?:_r18)?\.php/,
        historyPage: /\/history\.php/,
        historyThumbnailsId: /\d+(?=_p0)/
    };
    const depsUrls = {
        gifWorker: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js',
        pako: 'https://cdnjs.cloudflare.com/ajax/libs/pako/2.0.4/pako.min.js',
        upng: 'https://cdnjs.cloudflare.com/ajax/libs/upng-js/2.1.0/UPNG.min.js'
    };
    const creditCode = `<img style="display: block; margin: 1em auto; width: 200px"
src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAACxMAAAsTAQCanBgAADzWSURBVHhe7Z0HnBRF9sdrMyxZoiCegKCCOZ3xzKcCgp56CoqKohj+6pmznBGMGM+cQDALBgwneuZ4nieGU5KKIoqAIrCEDf1/3zddQ29vd09P2oD++BQzW93TXV316uWqLvhZUCowv8P8+OOP5uOPPzY9evQwvXr1MoWFhe6RYDiOY2bPnm2+/vprs+WWW5p27dq5R37bWCEwNTU1K6WDfvNYvny5M2LECKd58+bOjjvu6Hz77bfukXB88803zuabb+60aNHCueqqq5xVq1a5R+JB+t79tmZBnms5U7IqQWdrHhYvXmymTZvm/hWNlStXmpkzZxohMOVCcK9UKCkpMT/88INZtmyZqa6uNgUFBe6RaHzxxRdm6dKl7l9rJKqieX0Txi+//GKGDh1qhKOYs846y1RVRc+fsrIy0759eyWOyspK2Ll7JBxrr722ef31182ECRPMyJEjTXFxsXskHOeee67p27ev+b//+79Y92iqWGMJCy4yb9481YNeeOGFlBwINbNbt26qV8G94g567969lYDXWmsttyYatIM2iWqLGuLWrnlYYwmrdevWyoHATz/9ZL777jv9HgYIqmPHjqaoqEg5FmIUAsg1xo4dax588EFz/fXXm/Lycrd2zUOTIiy4CDqNKMluTThatmxpNt54YxVPiMXvv/8+JaF07dpVCYvrw1nywVHatm1rDjvsMLU64+hk6G60Jc4zNyY0GcJCPI0ePdoMGjTIiAWmXCUKDNr+++9vNthgA7PeeuupmEs1kB06dFDCgqDgcg0tqrj/zTffbAYPHmzGjRuXUk9sVJDGL5OZ3OghHMfZZpttYDmO6DXOl19+6R4JhwyEI7PdmTNnjn5PhX/9619Oq1at9B4nn3yyuiDiQvrR/ZY7VFRUOMJFtT177723s2TJEvdI44b0xZImw7FQjvv166cc5auvvjJTp05VMREFzu3UqZPp3r27fk8FxJQ9LxXH4t633Xab2XrrrVVfSsVBM0GzZs3MlVdeaf70pz+Z4cOHm+bNm7tHmgCaCscC77//vtOmTRudwZtuuqkjg+8eiQYz/7PPPnNk8N2aYMyePdvp3LmzXn+PPfZwfv31V/dIXcyfP9/Zbrvt9Ny+ffsqV4xC3DYEAU4lhOz+1fjRpDiWtNdstdVWZt9999W/P/30UzNlyhT9ngrXXHON2XHHHdWHFAUh2mRYZtGiRZEcCwcnliOAy6XyYV133XXahlGjRrk18dGiRYuU4aVGh8bAscTaiz0jZ8yYoSEUabrqWmLxuUfCIaJEzxcCcObNm+fW1gXtsHrcH/7wh0iO+MUXXzg9evTQc//4xz86QojukbrgulZXEmPCrQ0HoaFrr73WkYngiBUcW3+jD9PRC/OFRsGx3nvvPXPUUUeZ++67L5aesv7665tjjjlGvwuRmXvuuUe/R0EGXj/Ri15++WX9HgS87zvttJN+h3NFcSFcHzhhgYjPSP1HjAJ1kwARsfoZhaefflq565gxY8xTTz0Vyy1BKOqGG25QVwb6Z4OjoTnWgQce6EjHafD3zTffdGuj8c477ziiaMfiFkBEpiNEo+eLEhzKHeEMIt6cCy+8UC3EKC767rvvOq1bt9ZrCqG7tcE47rjj9DzKs88+69YGg/tvttlmei5t5j5xMHPmTGejjTbSvtxnn30y0uVyhUbBsbB40FGYccOGDdMwTCrgm8IaYyb/73//M//+97/dI8HgfOl09XSjR4VxAOrx2F922WVm1113jeQUePJFIdfv1sMfBvxjOGy32GILs+2227q1wXj44YfNl19+qd+HDBlixEjR76lAG0jd6dmzp+qhcazgvKKhORbWkrDv5Iw++OCDI60xi0cffVR1LazEl156ya0NBj6s//znP8ot0tFZoiDErHqTEIxytygsXLjQefHFF9UqTKVL3nXXXcq9hRidV155Ja22LliwQP176HQNCThWAYQlM7NBg1b//e9/zX777adcoFWrVkaIxuy99956LIxr4IV+5plnVNfBw17fPh70tY8++kitVThFrjgEz/PEE08ohxswYECsjInGBumTpQ3OsZiRzOKLLrrIKSkpUa5Fot3PP//snpFbYOkxo9PhBL8jPcCxGlzHgiPhozn99NONKPJah2ed2GBcEGT+8MMPk7E0eTb99IPcKeJuf//732OnxdQnPvnkkzUnAbChOZYX0qnO3/72N+eBBx5QX04criImv3PEEUeolYjfB+4X9jtSj+WRndLSUmfatGlubV288MILzvHHH+98+umnbk1d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"
/>`;

    const langZh = {
        button: {
            download_stop: '停止',
            download_works: '作品',
            download_bookmarks: '收藏',
            download_bookmarks_public: '公开',
            download_bookmarks_private: '不公开',
            download_all_one_page: '全部（单页）',
            download_all: '全部（批量）',
            download_r18_one_page: 'R-18（单页）',
            download_r18: 'R-18（批量）',
            fsa_change_dir: '更改',
            history_import: '导入记录（替换）',
            history_merge: '导入记录（合并）',
            history_export: '导出记录',
            history_clear: '清除记录'
        },
        checkbox: {
            filter_exclude_downloaded: '排除已下载图片',
            filter_illusts: '插画',
            filter_manga: '漫画',
            filter_ugoria: '动图'
        },
        radio: {
            filename_conflict_option_uniquify: '重命名',
            filename_conflict_option_overwrite: '覆盖',
            filename_conflict_option_prompt: '提示'
        },
        text: {
            feedback: '有问题or想建议？这里反馈',
            gm_menu: '设置',
            tab_title_filename: '文件名',
            tab_title_ugoria: '动图',
            tab_title_history: '历史记录',
            tab_title_button: '按钮',
            tab_title_others: '其它',
            tab_title_feedback: '反馈 / 赞赏',
            label_folder: '文件夹名：',
            label_filename: '文件名：',
            label_filename_conflict: '文件名重复时：',
            label_tag_lang: '标签语言：',
            label_fsa: '使用FileSystemAccess API',
            label_ugoria_format: '动图格式：',
            label_button_horizon: '水平：',
            label_button_vertical: '垂直：',
            title_button_preview: '预览图',
            title_button_preview_self_bookmark: '预览图（我的收藏）',
            placeholder_folder_subfolder_unused: '我不想保存到子文件夹',
            placeholder_folder_vm: 'Violentmonkey不支持',
            placeholder_folder_need_api: '需要Browser Api',
            placeholder_filename_requried: '你的名字？',
            placeholder_fsa_folder: '根文件夹名',
            tips_filename_pattern: '{artist}:作者, {artistID}:作者ID, {title}:作品标题, {id}:作品ID, {page}:页码, {tags}:作品标签，{date} / {date(占位符)}: 创建时间',
            tips_subfolder_unused: '如果不想保存到画师目录，文件夹名留空即可。',
            tips_tag_translation: '请注意：标签翻译不一定是你选择的语言，部分<a href="https://crowdin.com/project/pixiv-tags" target="_blank">无对应语言翻译的标签</a>仍可能是其他语言。',
            option_bundle_illusts: '将多页插图打包为.zip压缩包',
            option_bundle_manga: '将多页漫画作品打包为.zip压缩包',
            option_add_bookmark: '下载单个作品时收藏作品',
            option_add_bookmark_with_tags: '收藏时添加作品标签',
            option_add_bookmark_private_r18: '将R-18作品收藏到不公开类别',
            option_show_popup_button: '显示设置按钮',
            confirm_clear_history: '真的要清除历史记录吗？'
        }
    };
    const langEn = {
        button: {
            download_stop: 'Stop',
            download_works: 'Works',
            download_bookmarks: 'Bookmarks',
            download_bookmarks_public: 'Public',
            download_bookmarks_private: 'Private',
            download_all_one_page: 'All (one page)',
            download_all: 'All',
            download_r18_one_page: 'R-18 (one page)',
            download_r18: 'R-18',
            fsa_change_dir: 'Change',
            history_import: 'Import (Replace)',
            history_merge: 'Import (Merge)',
            history_export: 'Export',
            history_clear: 'Clear'
        },
        checkbox: {
            filter_exclude_downloaded: 'Exclude downloaded',
            filter_illusts: 'Illustrations',
            filter_manga: 'Manga',
            filter_ugoria: 'Ugoria'
        },
        radio: {
            filename_conflict_option_uniquify: 'Uniquify',
            filename_conflict_option_overwrite: 'Overwrite',
            filename_conflict_option_prompt: 'Prompt'
        },
        text: {
            feedback: 'Feedback',
            gm_menu: 'Setting',
            tab_title_filename: 'Filename',
            tab_title_ugoria: 'Ugoria',
            tab_title_history: 'History',
            tab_title_button: 'Button',
            tab_title_others: 'Others',
            tab_title_feedback: 'Feedback',
            label_folder: 'Folder:',
            label_filename: 'Filename:',
            label_filename_conflict: 'Conflict Action:',
            label_tag_lang: 'Tags language:',
            label_fsa: 'FileSystemAccess API',
            label_ugoria_format: 'Ugoria Format:',
            label_button_horizon: 'X:',
            label_button_vertical: 'Y:',
            title_button_preview: 'Thumbnail',
            title_button_preview_self_bookmark: 'Thumbnail(My bookmarks)',
            placeholder_folder_subfolder_unused: "I don't need subfolder",
            placeholder_folder_vm: "VM doesn't support",
            placeholder_folder_need_api: 'Need Browser Api',
            placeholder_filename_requried: 'Your Name?',
            placeholder_fsa_folder: 'Root directory',
            tips_filename_pattern: '{artist}, {artistID}, {title}, {id}, {page}, {tags}, {date} / {date(format)}',
            tips_subfolder_unused: "If you don't need a subfolder, just leave the folder name blank.",
            tips_tag_translation: 'Note: Tags language may not be the language you selected, <a href="https://crowdin.com/project/pixiv-tags" target="_blank">some tags without translations</a> may still be in other languages.',
            option_bundle_illusts: 'Pack multi-page illustrations into a .zip archive',
            option_bundle_manga: 'Pack manga into a .zip archive',
            option_add_bookmark: 'Bookmark work when downloading a single work',
            option_add_bookmark_with_tags: 'Add works tags',
            option_add_bookmark_private_r18: 'Bookmark R-18 works to private category',
            option_show_popup_button: 'Show setting button',
            confirm_clear_history: 'Do you really want to clear history?'
        }
    };
    const messages = {
        'zh-cn': langZh,
        'zh-tw': langZh,
        zh: langZh,
        en: langEn
    };
    const curLang = document.documentElement.getAttribute('lang')?.toLowerCase() || 'en';
    const defaultLang = 'en';
    function t(key) {
        const lang = (curLang in messages ? curLang : defaultLang);
        const paths = key.split('.');
        let last = messages[lang];
        for (let i = 0; i < paths.length; i++) {
            const value = last[paths[i]];
            if (value === undefined || value === null)
                return null;
            last = value;
        }
        return last;
    }

    function createHistory() {
        let records = (function getHistory() {
            const storage = localStorage.pixivDownloader || '[]';
            return new Set(JSON.parse(storage));
        })();
        function readHistoryFile(file, cb) {
            if (file.type === 'text/plain') {
                const reader = new FileReader();
                reader.readAsText(file);
                reader.onload = (readEvt) => {
                    const text = readEvt.target?.result;
                    try {
                        if (typeof text !== 'string')
                            throw new Error('Invalid file');
                        const history = JSON.parse(text);
                        if (!(history instanceof Array))
                            throw new Error('Invalid file');
                        cb(history);
                        location.reload();
                    }
                    catch (error) {
                        alert(error.message);
                    }
                };
            }
            else {
                alert('Invalid file');
            }
        }
        return {
            add(pixivId) {
                if (records.has(pixivId))
                    return;
                records.add(pixivId);
                localStorage.setItem(`pdlTemp-${pixivId}`, '');
            },
            has(pixivId) {
                return records.has(pixivId);
            },
            getAll() {
                return [...records];
            },
            updateHistory() {
                const validKeys = Object.keys(localStorage).filter((key) => /(?<=^pdlTemp-)\d+$/.test(key));
                if (!validKeys.length)
                    return;
                validKeys.forEach((key) => {
                    const [id] = /(?<=^pdlTemp-)\d+$/.exec(key);
                    records.add(id);
                    localStorage.removeItem(key);
                });
                this.saveHistory();
            },
            saveHistory(historyArr) {
                if (historyArr) {
                    if (historyArr.length && !historyArr.every((id) => typeof id === 'string')) {
                        throw new Error('Invalid id type');
                    }
                    this.updateHistory();
                    localStorage.pixivDownloader = JSON.stringify(historyArr);
                }
                else {
                    localStorage.pixivDownloader = JSON.stringify([...records]);
                }
            },
            clearHistory() {
                const isConfirm = confirm(t('text.confirm_clear_history'));
                if (!isConfirm)
                    return;
                this.updateHistory();
                records = new Set();
                localStorage.pixivDownloader = '[]';
                location.reload();
            },
            replace(file) {
                readHistoryFile(file, this.saveHistory.bind(this));
            },
            merge(file) {
                readHistoryFile(file, (historyArr) => {
                    if (!historyArr.length)
                        throw new Error('No id found');
                    if (!historyArr.every((id) => typeof id === 'string')) {
                        throw new Error('Invalid id type');
                    }
                    historyArr.forEach((id) => records.add(id));
                    this.saveHistory();
                });
            }
        };
    }
    const pixivHistory = createHistory();

    function getSelfId() {
        return document.querySelector('#qualtrics_user-id')?.textContent ?? '';
    }

    function getIllustId(node) {
        const isLinkToArtworksPage = regexp.artworksPage.exec(node.getAttribute('href') || '');
        if (isLinkToArtworksPage) {
            if (node.getAttribute('data-gtm-value') ||
                [
                    'gtm-illust-recommend-node-node',
                    'gtm-discover-user-recommend-node',
                    'work',
                    '_history-item',
                    '_history-related-item'
                ].some((className) => node.classList.contains(className))) {
                return isLinkToArtworksPage[1];
            }
        }
        else if (node.className.includes('_history-item')) {
            const result = regexp.historyThumbnailsId.exec(node.getAttribute('style') || '');
            if (result)
                return result[0];
        }
        else {
            const isActivityThumb = regexp.activityHref.exec(node.getAttribute('href') || '');
            if (isActivityThumb && node.classList.contains('work')) {
                return isActivityThumb[1];
            }
        }
        return '';
    }

    function getLogger() {
        const methods = ['info', 'warn', 'error'];
        const style = ['color: green;', 'color: orange;', 'color: red;'];
        const logLevel = 2;
        const namePrefix = '[Pixiv Downlaoder] ';
        function log(level, args) {
            if (logLevel <= level)
                console[methods[level]]('%c[Pixiv Downloader]', style[level], ...args);
        }
        return {
            info(...args) {
                log(0, args);
            },
            warn(...args) {
                log(1, args);
            },
            error(...args) {
                log(2, args);
            },
            time(label) {
                console.time(namePrefix + label);
            },
            timeLog(label) {
                console.timeLog(namePrefix + label);
            },
            timeEnd(label) {
                console.timeEnd(namePrefix + label);
            }
        };
    }
    const logger = getLogger();

    var IllustType;
    (function (IllustType) {
        IllustType[IllustType["illusts"] = 0] = "illusts";
        IllustType[IllustType["manga"] = 1] = "manga";
        IllustType[IllustType["ugoira"] = 2] = "ugoira";
    })(IllustType || (IllustType = {}));
    var BookmarkRestrict;
    (function (BookmarkRestrict) {
        BookmarkRestrict[BookmarkRestrict["public"] = 0] = "public";
        BookmarkRestrict[BookmarkRestrict["private"] = 1] = "private";
    })(BookmarkRestrict || (BookmarkRestrict = {}));

    function sleep(delay) {
        return new Promise((resolve) => {
            setTimeout(resolve, delay);
        });
    }
    function wakeableSleep(delay) {
        let wake = () => void {};
        const sleep = new Promise((r) => {
            setTimeout(r, delay);
            wake = r;
        });
        return {
            wake,
            sleep
        };
    }
    function replaceInvalidChar(str) {
        if (typeof str !== 'string')
            throw new TypeError('expect string but got ' + typeof str);
        if (!str)
            return '';
        return str
            .replace(/\p{C}/gu, '')
            .replace(/\\/g, '＼')
            .replace(/\//g, '／')
            .replace(/:/g, '：')
            .replace(/\*/g, '＊')
            .replace(/\?/g, '？')
            .replace(/\|/g, '｜')
            .replace(/"/g, '＂')
            .replace(/</g, '﹤')
            .replace(/>/g, '﹥')
            .replace(/~/g, '～')
            .trim()
            .replace(/^\.|\.$/g, '．');
    }
    function unescapeHtml(str) {
        if (typeof str !== 'string')
            throw new TypeError('expect string but got ' + typeof str);
        if (!str)
            return '';
        const el = document.createElement('p');
        el.innerHTML = str;
        return el.innerText;
    }
    function stringToFragment(string) {
        const renderer = document.createElement('template');
        renderer.innerHTML = string;
        return renderer.content;
    }

    function loadConfig() {
        const defaultConfig = Object.freeze({
            version: "0.9.6",
            ugoriaFormat: 'zip',
            folderPattern: 'pixiv/{artist}',
            filenamePattern: '{artist}_{title}_{id}_p{page}',
            tagLang: 'ja',
            showMsg: true,
            filterExcludeDownloaded: false,
            filterIllusts: true,
            filterManga: true,
            filterUgoria: true,
            bundleIllusts: false,
            bundleManga: false,
            addBookmark: false,
            addBookmarkWithTags: false,
            privateR18: false,
            useFileSystemAccess: false,
            fileSystemFilenameConflictAction: 'uniquify',
            showPopupButton: true
        });
        const config = (() => {
            if (!localStorage.pdlSetting)
                return {};
            let config;
            try {
                config = JSON.parse(localStorage.pdlSetting);
            }
            catch (error) {
                console.log(error);
                return {};
            }
            if (config.version !== defaultConfig.version) {
                config.version = defaultConfig.version;
                config.showMsg = true;
            }
            return config;
        })();
        return {
            get(key) {
                return config[key] ?? defaultConfig[key];
            },
            set(key, value) {
                if (config[key] !== value) {
                    config[key] = value;
                    localStorage.pdlSetting = JSON.stringify(config);
                    logger.info('Config set:', key, value);
                }
            }
        };
    }
    const config = loadConfig();

    const handleWorker = `
let webpApi = {};
Module.onRuntimeInitialized = () => {
  webpApi = {
    init: Module.cwrap('init', '', ['number', 'number', 'number']),
    createBuffer: Module.cwrap('createBuffer', 'number', ['number']),
    addFrame: Module.cwrap('addFrame', 'number', ['number', 'number', 'number']),
    generate: Module.cwrap('generate', 'number', []),
    freeResult: Module.cwrap('freeResult', '', []),
    getResultPointer: Module.cwrap('getResultPointer', 'number', []),
    getResultSize: Module.cwrap('getResultSize', 'number', []),
  };

  postMessage('ok');
};

onmessage = (evt) => {
  const { data, delays, lossless = 1, quality = 75, method = 4} = evt.data;

  webpApi.init(lossless, quality, method);
  data.forEach((u8a, idx) => {
    const pointer = webpApi.createBuffer(u8a.length);
    Module.HEAPU8.set(u8a, pointer);
    webpApi.addFrame(pointer, u8a.length, delays[idx]);
    postMessage(idx);
  });

  webpApi.generate();
  const resultPointer = webpApi.getResultPointer();
  const resultSize = webpApi.getResultSize();
  const result = new Uint8Array(Module.HEAP8.buffer, resultPointer, resultSize);
  postMessage(result);
  webpApi.freeResult();
};`;

    class RequestError extends Error {
        response;
        constructor(message, response) {
            super(message);
            this.name = 'RequestError';
            this.response = response;
        }
    }
    class CancelError extends Error {
        constructor() {
            super('User aborted');
            this.name = 'CancelError';
        }
    }
    class JsonDataError extends Error {
        constructor(msg) {
            super(msg);
            this.name = 'JsonDataError';
        }
    }

    function createService() {
        async function _requestJson(url, init) {
            logger.info('fetch url:', url);
            const res = await fetch(url, init);
            if (!res.ok)
                throw new RequestError('Request ' + url + ' failed with status code ' + res.status, res);
            const data = await res.json();
            if (data.error)
                throw new JsonDataError(data.message);
            return data.body;
        }
        async function _getDeps(url) {
            return fetch(url).then((res) => {
                if (res.ok)
                    return res.text();
                throw new RequestError(`Fetch dependency ${url} failed with status code ${res.status}`, res);
            });
        }
        return {
            async getJson(url) {
                let json;
                let retry = 0;
                const MAX_RETRY = 3;
                do {
                    try {
                        json = await _requestJson(url);
                    }
                    catch (error) {
                        logger.error(error);
                        retry++;
                        if (retry === MAX_RETRY)
                            throw error;
                        sleep(3000);
                    }
                } while (!json);
                return json;
            },
            async getArtworkHtml(illustId) {
                logger.info('Fetch illust:', illustId);
                let params = '';
                const tagLang = config.get('tagLang');
                if (tagLang !== 'ja')
                    params = '?lang=' + tagLang;
                const res = await fetch('https://www.pixiv.net/artworks/' + illustId + params);
                if (!res.ok)
                    throw new RequestError('Request failed with status code ' + res.status, res);
                return await res.text();
            },
            async getGifWS() {
                let gifWS;
                if (!(gifWS = await GM_getValue('gifWS'))) {
                    gifWS = await _getDeps(depsUrls.gifWorker);
                    GM_setValue('gifWS', gifWS);
                }
                return gifWS;
            },
            async getApngWS() {
                let apngWS;
                if (!(apngWS = await GM_getValue('apngWS'))) {
                    const [pako, upng] = await Promise.all([_getDeps(depsUrls.pako), _getDeps(depsUrls.upng)]);
                    const upngScript = upng.replace('window.UPNG', 'UPNG').replace('window.pako', 'pako');
                    const workerEvt = `onmessage = (evt) => {
          const {data, width, height, delay } = evt.data;
          const png = UPNG.encode(data, width, height, 0, delay, {loop: 0});
          if (!png) console.error('Convert Apng failed.');
          postMessage(png);
        };`;
                    apngWS = workerEvt + pako + upngScript;
                    GM_setValue('apngWS', apngWS);
                }
                return apngWS;
            },
            getWebpWS() {
                return workerChunk__default["default"] + handleWorker;
            },
            addBookmark(illustId, token, tags = [], restrict = BookmarkRestrict.public) {
                return _requestJson('/ajax/illusts/bookmarks/add', {
                    method: 'POST',
                    headers: {
                        accept: 'application/json',
                        'content-type': 'application/json; charset=utf-8',
                        'x-csrf-token': token
                    },
                    body: JSON.stringify({
                        illust_id: illustId,
                        restrict,
                        comment: '',
                        tags
                    })
                });
            },
            getFollowLatestWorks(page, mode = 'all') {
                return _requestJson(`/ajax/follow_latest/illust?p=${page}&mode=${mode}&lang=jp`);
            },
            getUserAllProfile(userId) {
                return _requestJson('/ajax/user/' + userId + '/profile/all');
            },
            getUgoriaMeta(illustId) {
                return _requestJson('/ajax/illust/' + illustId + '/ugoira_meta');
            },
            getArtworkDetail(illustId) {
                let params = '';
                const tagLang = config.get('tagLang');
                if (tagLang !== 'ja')
                    params = '?lang=' + tagLang;
                return _requestJson('/ajax/illust/' + illustId + params);
            }
        };
    }
    const api = createService();

    function addBookmark(pdlBtn, illustId, token, tags) {
        if (!config.get('addBookmark'))
            return;
        api
            .addBookmark(illustId, token, config.get('addBookmarkWithTags') ? tags : [], config.get('privateR18') && tags.includes('R-18') ? BookmarkRestrict.private : BookmarkRestrict.public)
            .then(() => {
                const bookmarkBtnRef = findBookmarkBtn(pdlBtn);
                if (!bookmarkBtnRef)
                    return;
                switch (bookmarkBtnRef.kind) {
                    case "main": {
                        const pathBorder = bookmarkBtnRef.button.querySelector('svg g path');
                        pathBorder && (pathBorder.style.color = 'rgb(255, 64, 96)');
                        break;
                    }
                    case "sub": {
                        const pathBorder = bookmarkBtnRef.button.querySelector('path');
                        pathBorder && (pathBorder.style.color = 'rgb(255, 64, 96)');
                        break;
                    }
                    case "rank": {
                        bookmarkBtnRef.button.style.backgroundColor = 'rgb(255, 64, 96)';
                        break;
                    }
                }
            })
            .catch((reason) => {
                logger.error(reason.message);
            });
    }
    function findBookmarkBtn(pdlBtn) {
        const bookmarkBtnRef = {};
        if (pdlBtn.classList.contains('pdl-btn-sub')) {
            const btn = pdlBtn.parentElement?.nextElementSibling?.querySelector('button[type="button"]');
            if (btn) {
                bookmarkBtnRef.kind = "sub";
                bookmarkBtnRef.button = btn;
            }
            else {
                const btn = pdlBtn.parentElement?.querySelector('div._one-click-bookmark');
                if (btn) {
                    bookmarkBtnRef.kind = "rank";
                    bookmarkBtnRef.button = btn;
                }
            }
        }
        else if (pdlBtn.classList.contains('pdl-btn-main')) {
            const btn = pdlBtn.parentElement?.parentElement?.querySelector('button.gtm-main-bookmark');
            if (btn) {
                bookmarkBtnRef.kind = "main";
                bookmarkBtnRef.button = btn;
            }
        }
        else {
            return logger.error(new Error('Can not find bookmark button.'));
        }
        return bookmarkBtnRef;
    }

    const env = {
        isFirefox() {
            return navigator.userAgent.includes('Firefox');
        },
        isViolentmonkey() {
            return GM_info.scriptHandler === 'Violentmonkey';
        },
        isTampermonkey() {
            return GM_info.scriptHandler === 'Tampermonkey';
        },
        isBlobDlAvaliable() {
            return !this.isFirefox() || (this.isFirefox() && this.isTampermonkey() && parseFloat(GM_info.version ?? '') < 4.18);
        },
        isSupportSubpath() {
            return this.isBrowserDownloadMode();
        },
        isBrowserDownloadMode() {
            return GM_info.downloadMode === 'browser';
        },
        isConflictActionEnable() {
            return this.isTampermonkey() && parseFloat(GM_info.version ?? '') >= 4.18 && this.isBrowserDownloadMode();
        },
        isConflictActionPromptEnable() {
            return !this.isFirefox() && this.isConflictActionEnable();
        },
        isFileSystemAccessAvaliable() {
            return (typeof unsafeWindow.showDirectoryPicker === 'function' && typeof unsafeWindow.showSaveFilePicker === 'function');
        }
    };

    function createCompressor() {
        const zip = new JSZip__default["default"]();
        return {
            add(id, name, data) {
                zip.folder(id)?.file(name, data);
            },
            bundle(id) {
                const folder = zip.folder(id);
                if (!folder)
                    throw new TypeError('no such folder:' + id);
                return folder.generateAsync({ type: 'blob' });
            },
            remove(ids) {
                if (typeof ids === 'string') {
                    zip.remove(ids);
                }
                else {
                    const dirs = zip.filter((_, file) => file.dir).map((dir) => dir.name);
                    const dirsToDel = ids.filter((id) => dirs.some((dir) => dir.includes(id)));
                    dirsToDel.forEach((dir) => zip.remove(dir));
                    logger.info('Compressor: Remove', zip);
                }
            },
            fileCount(id) {
                let count = 0;
                zip.folder(id)?.forEach(() => count++);
                return count;
            },
            async unzip(data) {
                const id = Math.random().toString(36);
                let folder = zip.folder(id);
                if (!folder)
                    throw TypeError('Can not get new root folder');
                const filesPromises = [];
                folder = await folder.loadAsync(data);
                folder.forEach((_, file) => {
                    filesPromises.push(file.async('blob'));
                });
                const files = await Promise.all(filesPromises);
                zip.remove(id);
                return files;
            }
        };
    }
    const compressor = createCompressor();

    function createConverter() {
        const freeApngWorkers = [];
        const freeWebpWorkers = [];
        const MAX_CONVERT = 2;
        let isStop = false;
        let queue = [];
        let active = [];
        const cachedQueue = {
            gif: [],
            png: []
        };
        const depsUrl = {
            gif: '',
            png: '',
            webp: URL.createObjectURL(new Blob([api.getWebpWS()], { type: 'text/javascript' }))
        };
        let LoadStatus;
        (function (LoadStatus) {
            LoadStatus[LoadStatus["unloaded"] = 0] = "unloaded";
            LoadStatus[LoadStatus["loading"] = 1] = "loading";
            LoadStatus[LoadStatus["loaded"] = 2] = "loaded";
        })(LoadStatus || (LoadStatus = {}));
        const depsStatus = {
            gif: {
                loaded: LoadStatus.unloaded,
                load() {
                    logger.info('开始加载gif依赖');
                    this.loaded = LoadStatus.loading;
                    return api.getGifWS().then((str) => {
                        depsUrl.gif = URL.createObjectURL(new Blob([str], { type: 'text/javascript' }));
                        this.loaded = LoadStatus.loaded;
                        logger.info('加载gif依赖完成');
                    });
                }
            },
            png: {
                loaded: LoadStatus.unloaded,
                load() {
                    logger.info('开始加载png依赖');
                    this.loaded = LoadStatus.loading;
                    return api.getApngWS().then((str) => {
                        depsUrl.png = URL.createObjectURL(new Blob([str], { type: 'text/javascript' }));
                        this.loaded = LoadStatus.loaded;
                        logger.info('加载png依赖完成');
                    });
                }
            }
        };
        const convertTo = {
            webp: (frames, convertMeta) => {
                return new Promise((resolve, reject) => {
                    let worker;
                    let reuse = false;
                    logger.time(convertMeta.id);
                    if (freeWebpWorkers.length) {
                        logger.info('Reuse webp workers.');
                        worker = freeWebpWorkers.shift();
                        reuse = true;
                    }
                    else {
                        worker = new Worker(depsUrl.webp);
                    }
                    convertMeta.abort = () => {
                        logger.timeEnd(convertMeta.id);
                        logger.warn('Convert stop manually.' + convertMeta.id);
                        reject(new CancelError());
                        convertMeta.isAborted = true;
                        worker.terminate();
                    };
                    const workerLoad = new Promise((onLoaded) => {
                        if (reuse)
                            return onLoaded();
                        worker.onmessage = (evt) => {
                            if (evt.data === 'ok') {
                                logger.info('Webp worker loaded.');
                                onLoaded();
                            }
                        };
                    });
                    const delays = convertMeta.source.framesInfo.map((frameInfo) => {
                        return Number(frameInfo.delay);
                    });
                    const data = [];
                    let completed = 0;
                    frames.forEach((frame, idx) => {
                        const canvas = document.createElement('canvas');
                        const width = (canvas.width = frame.naturalWidth);
                        const height = (canvas.height = frame.naturalHeight);
                        const context = canvas.getContext('2d');
                        if (!context)
                            return;
                        context.drawImage(frame, 0, 0, width, height);
                        data.push(new Promise((onFulfilled, onRejected) => {
                            canvas.toBlob((blob) => {
                                if (!blob)
                                    return onRejected(new TypeError('Convert failed when invoke canvas.toBlob() ' + idx));
                                blob.arrayBuffer().then((buffer) => {
                                    const u8a = new Uint8Array(buffer);
                                    onFulfilled(u8a);
                                    convertMeta.onProgress?.((++completed / frames.length) * 0.5, 'webp');
                                });
                            }, 'image/webp', 1);
                        }));
                    });
                    workerLoad
                        .then(() => Promise.all(data))
                        .then((u8arrs) => {
                            if (convertMeta.isAborted)
                                return;
                            logger.timeLog(convertMeta.id);
                            worker.onmessage = (evt) => {
                                const data = evt.data;
                                if (typeof data !== 'object') {
                                    convertMeta.onProgress?.(0.5 + (evt.data / frames.length) * 0.5, 'webp');
                                }
                                else {
                                    logger.timeEnd(convertMeta.id);
                                    freeWebpWorkers.push(worker);
                                    resolve(new Blob([evt.data], { type: 'image/webp' }));
                                }
                            };
                            worker.postMessage({ data: u8arrs, delays });
                        }, (reason) => {
                            logger.timeLog(convertMeta.id);
                            reject(reason);
                        });
                });
            },
            gif: (frames, convertMeta) => {
                return new Promise((resolve, reject) => {
                    const gif = new GIF__default["default"]({
                        workers: 2,
                        quality: 10,
                        workerScript: depsUrl.gif
                    });
                    convertMeta.abort = () => {
                        gif.abort();
                    };
                    logger.info('Start convert:', convertMeta.id);
                    logger.time(convertMeta.id);
                    frames.forEach((frame, i) => {
                        gif.addFrame(frame, {
                            delay: convertMeta.source.framesInfo[i].delay
                        });
                    });
                    gif.on('progress', (progress) => {
                        if (typeof convertMeta.onProgress === 'function')
                            convertMeta.onProgress(progress, 'gif');
                    });
                    gif.on('finished', (gifBlob) => {
                        logger.timeEnd(convertMeta.id);
                        resolve(gifBlob);
                    });
                    gif.on('abort', () => {
                        logger.timeEnd(convertMeta.id);
                        logger.warn('Convert stop manually. ' + convertMeta.id);
                        convertMeta.isAborted = true;
                        reject(new CancelError());
                    });
                    gif.render();
                });
            },
            png: (frames, convertMeta) => {
                return new Promise((resolve, reject) => {
                    const canvas = document.createElement('canvas');
                    const width = (canvas.width = frames[0].naturalWidth);
                    const height = (canvas.height = frames[0].naturalHeight);
                    const context = canvas.getContext('2d', { willReadFrequently: true });
                    if (!context)
                        return reject(new TypeError('Can not get canvas context'));
                    const data = [];
                    const delay = convertMeta.source.framesInfo.map((frameInfo) => {
                        return Number(frameInfo.delay);
                    });
                    logger.info('Start convert:', convertMeta.id);
                    logger.time(convertMeta.id);
                    for (const frame of frames) {
                        if (convertMeta.isAborted) {
                            logger.timeEnd(convertMeta.id);
                            logger.warn('Convert stop manually. ' + convertMeta.id);
                            return reject(new CancelError());
                        }
                        context.clearRect(0, 0, width, height);
                        context.drawImage(frame, 0, 0, width, height);
                        data.push(context.getImageData(0, 0, width, height).data);
                    }
                    logger.timeLog(convertMeta.id);
                    let worker;
                    if (freeApngWorkers.length) {
                        worker = freeApngWorkers.shift();
                        logger.info('Reuse apng workers.');
                    }
                    else {
                        worker = new Worker(depsUrl.png);
                    }
                    convertMeta.abort = () => {
                        logger.timeEnd(convertMeta.id);
                        logger.warn('Convert stop manually. ' + convertMeta.id);
                        reject(new CancelError());
                        convertMeta.isAborted = true;
                        worker.terminate();
                    };
                    worker.onmessage = function (e) {
                        freeApngWorkers.push(worker);
                        logger.timeEnd(convertMeta.id);
                        if (!e.data) {
                            return reject(new TypeError('Failed to get png data. ' + convertMeta.id));
                        }
                        const pngBlob = new Blob([e.data], { type: 'image/png' });
                        resolve(pngBlob);
                    };
                    const cfg = { data, width, height, delay };
                    worker.postMessage(cfg);
                });
            },
            webm: (frames, convertMeta) => {
                return new Promise((resolve, reject) => {
                    const canvas = document.createElement('canvas');
                    const width = (canvas.width = frames[0].naturalWidth);
                    const height = (canvas.height = frames[0].naturalHeight);
                    const context = canvas.getContext('2d');
                    if (!context)
                        return reject(new TypeError('Can not get canvas context'));
                    const stream = canvas.captureStream();
                    const recorder = new MediaRecorder(stream, {
                        mimeType: 'video/webm',
                        videoBitsPerSecond: 80000000
                    });
                    const delay = convertMeta.source.framesInfo.map((frame) => {
                        return Number(frame.delay);
                    });
                    const data = [];
                    let frame = 0;
                    const displayFrame = () => {
                        context.clearRect(0, 0, width, height);
                        context.drawImage(frames[frame], 0, 0);
                        if (convertMeta.isAborted) {
                            return recorder.stop();
                        }
                        setTimeout(() => {
                            if (typeof convertMeta.onProgress === 'function')
                                convertMeta.onProgress((frame + 1) / frames.length, 'webm');
                            if (frame === frames.length - 1) {
                                return recorder.stop();
                            }
                            else {
                                frame++;
                            }
                            displayFrame();
                        }, delay[frame]);
                    };
                    recorder.ondataavailable = (event) => {
                        if (event.data && event.data.size) {
                            data.push(event.data);
                        }
                    };
                    recorder.onstop = () => {
                        if (convertMeta.isAborted) {
                            logger.warn('Convert stop manually.' + convertMeta.id);
                            return reject(new CancelError());
                        }
                        resolve(new Blob(data, { type: 'video/webm' }));
                    };
                    displayFrame();
                    recorder.start();
                });
            }
        };
        const convert = (convertMeta) => {
            const { id, source, resolve, reject } = convertMeta;
            let frames;
            active.push(convertMeta);
            if (typeof convertMeta.onProgress === 'function')
                convertMeta.onProgress(0, 'zip');
            compressor
                .unzip(source.data)
                .then((files) => {
                    const imagePromises = files.map((blob) => {
                        return new Promise((resolve) => {
                            const image = new Image();
                            image.onload = () => {
                                resolve(image);
                            };
                            image.src = URL.createObjectURL(blob);
                        });
                    });
                    return Promise.all(imagePromises);
                })
                .then((imgEles) => {
                    frames = imgEles;
                    if (convertMeta.isAborted) {
                        logger.warn('Convert stop manually.' + id);
                        throw new CancelError();
                    }
                    return convertTo[source.format](frames, convertMeta);
                })
                .then(resolve, reject)
                .finally(() => {
                    frames.forEach((frame) => URL.revokeObjectURL(frame.src));
                    active.splice(active.indexOf(convertMeta), 1);
                    if (queue.length)
                        convert(queue.shift());
                });
        };
        return {
            add: (convertSource, handler) => {
                logger.info('Converter add', convertSource.id);
                return new Promise((resolve, reject) => {
                    const meta = {
                        id: convertSource.id,
                        isAborted: false,
                        source: convertSource,
                        onProgress: handler?.onProgress,
                        resolve,
                        reject,
                        abort() {
                            this.isAborted = true;
                        }
                    };
                    const format = convertSource.format;
                    if ((format === 'gif' || format === 'png') && depsStatus[format].loaded !== LoadStatus.loaded) {
                        switch (depsStatus[format].loaded) {
                            case LoadStatus.unloaded:
                                cachedQueue[format].push(meta);
                                depsStatus[format].load().then(() => {
                                    logger.info(`添加${cachedQueue[format].length}个任务`);
                                    queue.push(...cachedQueue[format]);
                                    cachedQueue[format].length = 0;
                                    while (active.length < MAX_CONVERT && queue.length && !isStop) {
                                        convert(queue.shift());
                                    }
                                }, (reason) => {
                                    cachedQueue[format].forEach((meta) => {
                                        meta.reject(reason);
                                    });
                                    depsStatus[format].loaded = LoadStatus.unloaded;
                                    cachedQueue[format].length = 0;
                                });
                                break;
                            case LoadStatus.loading:
                                cachedQueue[format].push(meta);
                                break;
                            default:
                                throw new RangeError('Invalid deps status.');
                        }
                    }
                    else {
                        queue.push(meta);
                        while (active.length < MAX_CONVERT && queue.length && !isStop) {
                            convert(queue.shift());
                        }
                    }
                });
            },
            del: (taskIds) => {
                if (!taskIds.length)
                    return;
                logger.info('Converter del, active:', active.map((meta) => meta.id), 'queue:', queue.map((meta) => meta.id));
                isStop = true;
                active = active.filter((convertMeta) => {
                    if (taskIds.includes(convertMeta.id)) {
                        convertMeta.abort();
                    }
                    else {
                        return true;
                    }
                });
                queue = queue.filter((convertMeta) => !taskIds.includes(convertMeta.id));
                isStop = false;
                while (active.length < MAX_CONVERT && queue.length) {
                    convert(queue.shift());
                }
            }
        };
    }
    const converter = createConverter();

    const updateDirHandleChannel = new BroadcastChannel('update_dir_channel');
    updateDirHandleChannel.onmessage = (evt) => {
        const data = evt.data;
        switch (data.kind) {
            case 1:
                dirHandleStatus = 1;
                logger.info('正在选择目录');
                break;
            case 0:
                logger.warn('取消更新dirHandle');
                if (dirHandle) {
                    dirHandleStatus = 2;
                    processCachedSave();
                }
                else {
                    dirHandleStatus = 0;
                    rejectCachedSave();
                }
                break;
            case 2:
                dirHandleStatus = 2;
                dirHandle = data.handle;
                logger.info('更新dirHandle', dirHandle);
                processCachedSave();
                break;
            case 'request':
                if (dirHandle) {
                    updateDirHandleChannel.postMessage({
                        kind: 'response',
                        handle: dirHandle
                    });
                    logger.info('响应请求dirHandle');
                }
                break;
            case 'response':
                if (!dirHandle) {
                    if (dirHandleStatus === 0)
                        dirHandleStatus = 2;
                    dirHandle = data.handle;
                    logger.info('首次获取dirHandle', dirHandle);
                }
                break;
            default:
                throw new Error('Invalid data kind.');
        }
    };
    updateDirHandleChannel.postMessage({ kind: 'request' });
    async function getDirHandleRecursive(dirs) {
        let handler = dirHandle;
        if (typeof dirs === 'string') {
            if (dirs.indexOf('/') === -1)
                return await handler.getDirectoryHandle(dirs, { create: true });
            dirs = dirs.split('/').filter((dir) => !!dir);
        }
        for await (const dir of dirs) {
            handler = await handler.getDirectoryHandle(dir, { create: true });
        }
        return handler;
    }
    const duplicateFilenameCached = {};
    async function getFilenameHandle(dirHandle, filename) {
        const conflictAction = config.get('fileSystemFilenameConflictAction');
        if (conflictAction === 'overwrite')
            return await dirHandle.getFileHandle(filename, { create: true });
        if (!(filename in duplicateFilenameCached)) {
            duplicateFilenameCached[filename] = [];
            try {
                await dirHandle.getFileHandle(filename);
                logger.warn('存在同名文件', filename);
            }
            catch (error) {
                return await dirHandle.getFileHandle(filename, { create: true });
            }
        }
        const extIndex = filename.lastIndexOf('.');
        const ext = filename.slice(extIndex + 1);
        const name = filename.slice(0, extIndex);
        if (conflictAction === 'prompt') {
            return await unsafeWindow.showSaveFilePicker({
                suggestedName: filename,
                types: [{ description: 'Image file', accept: { ['image/' + ext]: ['.' + ext] } }]
            });
        }
        else {
            for (let suffix = 1; suffix < 1000; suffix++) {
                const newName = `${name} (${suffix}).${ext}`;
                try {
                    await dirHandle.getFileHandle(newName);
                }
                catch (error) {
                    if (duplicateFilenameCached[filename].includes(newName)) {
                        continue;
                    }
                    else {
                        duplicateFilenameCached[filename].push(newName);
                    }
                    logger.info('使用文件名:', newName);
                    return await dirHandle.getFileHandle(newName, { create: true });
                }
            }
            throw new RangeError('Oops, you have too many duplicate files.');
        }
    }
    function clearFilenameCached(duplicateName, actualName) {
        if (!(duplicateName in duplicateFilenameCached))
            return;
        const usedNameArr = duplicateFilenameCached[duplicateName];
        logger.info('清理重名文件名', usedNameArr, actualName);
        if (usedNameArr.length === 0) {
            delete duplicateFilenameCached[duplicateName];
            return;
        }
        const index = usedNameArr.indexOf(actualName);
        if (index === -1)
            return;
        usedNameArr.splice(index, 1);
        if (usedNameArr.length === 0)
            delete duplicateFilenameCached[duplicateName];
    }
    async function updateDirHandle() {
        try {
            dirHandleStatus = 1;
            updateDirHandleChannel.postMessage({ kind: 1 });
            dirHandle = await unsafeWindow.showDirectoryPicker({ id: 'pdl', mode: 'readwrite' });
            logger.info('更新dirHandle', dirHandle);
            dirHandleStatus = 2;
            updateDirHandleChannel.postMessage({
                kind: 2,
                handle: dirHandle
            });
            processCachedSave();
            return true;
        }
        catch (error) {
            logger.warn(error);
            updateDirHandleChannel.postMessage({ kind: 0 });
            if (dirHandle) {
                dirHandleStatus = 2;
                processCachedSave();
            }
            else {
                dirHandleStatus = 0;
                rejectCachedSave();
            }
            return false;
        }
    }
    let dirHandleStatus = 0;
    let dirHandle;
    const cachedSaveProcess = [];
    async function saveWithFileSystemAccess(blob, downloadMeta) {
        try {
            if (downloadMeta.state === 0)
                return;
            if (dirHandleStatus === 1) {
                cachedSaveProcess.push([blob, downloadMeta]);
                return;
            }
            if (dirHandleStatus === 0) {
                const isSuccess = await updateDirHandle();
                if (!isSuccess)
                    throw new TypeError('Failed to get dir handle.');
            }
            let currenDirHandle;
            let filename;
            const path = downloadMeta.source.path;
            const index = path.lastIndexOf('/');
            if (index === -1) {
                filename = path;
                currenDirHandle = dirHandle;
            }
            else {
                filename = path.slice(index + 1);
                currenDirHandle = await getDirHandleRecursive(path.slice(0, index));
            }
            const fileHandle = await getFilenameHandle(currenDirHandle, filename);
            const writableStream = await fileHandle.createWritable();
            await writableStream.write(blob);
            await writableStream.close();
            clearFilenameCached(filename, fileHandle.name);
            downloadMeta.resolve(downloadMeta.taskId);
            logger.info('Download complete:', downloadMeta.source.path);
        }
        catch (error) {
            downloadMeta.reject(error);
            logger.error(error);
        }
        downloadMeta.state = 2;
    }
    function processCachedSave() {
        cachedSaveProcess.forEach((args) => saveWithFileSystemAccess(...args));
        logger.info(`执行${cachedSaveProcess.length}个缓存任务`);
        cachedSaveProcess.length = 0;
    }
    function rejectCachedSave() {
        cachedSaveProcess.forEach(([, downloadMeta]) => downloadMeta.reject(new CancelError()));
        logger.info(`取消${cachedSaveProcess.length}个缓存任务`);
        cachedSaveProcess.length = 0;
    }
    function getCurrentDirName() {
        return dirHandle?.name ?? '';
    }
    function isShouldGetDirHandle() {
        return isUseFileSystemAccess() && dirHandleStatus === 0;
    }
    function isUseFileSystemAccess() {
        return env.isFileSystemAccessAvaliable() && config.get('useFileSystemAccess');
    }

    const _saveWithoutSubpath = (blob, downloadMeta) => {
        const dlEle = document.createElement('a');
        dlEle.href = URL.createObjectURL(blob);
        dlEle.download = downloadMeta.source.path;
        dlEle.click();
        URL.revokeObjectURL(dlEle.href);
        downloadMeta.state = 2;
        downloadMeta.resolve(downloadMeta.taskId);
    };
    const _saveWithSubpath = (blob, downloadMeta) => {
        const imgUrl = URL.createObjectURL(blob);
        const request = {
            url: imgUrl,
            name: downloadMeta.source.path,
            onerror: (error) => {
                if (downloadMeta.state !== 0) {
                    downloadMeta.reject(new Error(`Download error when saving ${downloadMeta.source.path} because ${error.error} ${error.details ?? ''} `));
                }
                URL.revokeObjectURL(imgUrl);
            },
            onload: () => {
                if (typeof downloadMeta.onLoad === 'function')
                    downloadMeta.onLoad();
                URL.revokeObjectURL(imgUrl);
                downloadMeta.state = 2;
                downloadMeta.resolve(downloadMeta.taskId);
                logger.info('Download complete:', downloadMeta.source.path);
            }
        };
        downloadMeta.abort = GM_download(request).abort;
    };
    function createDownloader() {
        const MAX_DOWNLOAD = 5;
        const MAX_RETRY = 3;
        const INTERVAL = 500;
        const TIMEOUT = 20000;
        let isStop = false;
        let queue = [];
        let active = [];
        let save;
        if (env.isBlobDlAvaliable() && env.isSupportSubpath()) {
            save = _saveWithSubpath;
        }
        else {
            logger.warn('Download function not full support:', GM_info.scriptHandler, GM_info.version);
            save = _saveWithoutSubpath;
        }
        const download = (downloadMeta) => {
            const { taskId, source } = downloadMeta;
            logger.info('Start download:', source.path);
            active.push(downloadMeta);
            let fileSaveFn = save;
            const isUseFSA = isUseFileSystemAccess();
            if (isUseFSA) {
                fileSaveFn = saveWithFileSystemAccess;
            }
            let abortObj;
            const errorHandler = errorHandlerFactory(downloadMeta);
            if ((!env.isBlobDlAvaliable() || (env.isViolentmonkey() && !isUseFSA)) && !('kind' in source)) {
                abortObj = GM_download({
                    url: source.src,
                    name: source.path,
                    headers: {
                        referer: 'https://www.pixiv.net'
                    },
                    ontimeout: errorHandler,
                    onerror: errorHandler,
                    onload: async () => {
                        logger.info('Download complete:', taskId, source.path);
                        if (typeof downloadMeta.onLoad === 'function')
                            downloadMeta.onLoad();
                        downloadMeta.resolve(taskId);
                        await sleep(INTERVAL);
                        active.splice(active.indexOf(downloadMeta), 1);
                        if (queue.length && !isStop)
                            download(queue.shift());
                    }
                });
            }
            else {
                abortObj = GM_xmlhttpRequest({
                    url: source.src,
                    timeout: TIMEOUT,
                    method: 'GET',
                    headers: {
                        referer: 'https://www.pixiv.net'
                    },
                    responseType: 'blob',
                    ontimeout: errorHandler,
                    onerror: errorHandler,
                    onprogress: (e) => {
                        if (e.lengthComputable && typeof downloadMeta.onProgress === 'function') {
                            downloadMeta.onProgress(e.loaded / e.total);
                        }
                    },
                    onload: async (e) => {
                        logger.info('Xhr complete:', source.path);
                        if (downloadMeta.state === 0)
                            return logger.warn('Download was canceled.', taskId, source.path);
                        if (!('kind' in source)) {
                            fileSaveFn(e.response, downloadMeta);
                        }
                        else if (source.kind === 'convert') {
                            const convertSource = {
                                id: taskId,
                                data: e.response,
                                format: source.format,
                                framesInfo: source.ugoiraMeta?.frames
                            };
                            converter.add(convertSource, { onProgress: downloadMeta.onProgress }).then((blob) => {
                                fileSaveFn(blob, downloadMeta);
                            }, downloadMeta.reject);
                        }
                        else if (source.kind === 'bundle') {
                            compressor.add(taskId, source.filename, e.response);
                            if (compressor.fileCount(taskId) === source.pageCount) {
                                compressor.bundle(taskId).then((blob) => {
                                    fileSaveFn(blob, downloadMeta);
                                    compressor.remove(taskId);
                                });
                            }
                            else {
                                downloadMeta.resolve(taskId);
                                if (typeof downloadMeta.onLoad === 'function')
                                    downloadMeta.onLoad();
                            }
                        }
                        await sleep(INTERVAL);
                        active.splice(active.indexOf(downloadMeta), 1);
                        if (queue.length && !isStop)
                            download(queue.shift());
                    }
                });
            }
            downloadMeta.abort = abortObj.abort;
        };
        function errorHandlerFactory(downloadMeta) {
            return function (error) {
                const { taskId, source, state } = downloadMeta;
                if (state === 0)
                    return;
                if (error) {
                    logger.error('Download ' + taskId + ' error', error.error ? ' with reason: ' + error.error : '', 'details' in error ? error.details : error);
                    if ('status' in error && error.status === 429) {
                        downloadMeta.reject(new RequestError('Too many request', error));
                        active.splice(active.indexOf(downloadMeta), 1);
                        return;
                    }
                }
                else {
                    logger.warn('Download timeout:', source.src);
                }
                downloadMeta.retry++;
                if (downloadMeta.retry > MAX_RETRY) {
                    downloadMeta.reject(new Error('Download failed: ' + source.src));
                    active.splice(active.indexOf(downloadMeta), 1);
                    if (queue.length && !isStop)
                        download(queue.shift());
                }
                else {
                    logger.info('Download retry:', downloadMeta.retry, source.src);
                    download(downloadMeta);
                }
            };
        }
        return {
            add(metas, handler = {}) {
                logger.info('Downloader add:', metas);
                if (metas.length < 1)
                    return Promise.resolve('');
                const promises = [];
                metas.forEach((source) => {
                    promises.push(new Promise((resolve, reject) => {
                        const downloadMeta = {
                            taskId: source.taskId,
                            source,
                            state: 1,
                            retry: 0,
                            onProgress: handler.onProgress,
                            onLoad: handler.onLoad,
                            resolve,
                            reject
                        };
                        queue.push(downloadMeta);
                    }));
                });
                while (active.length < MAX_DOWNLOAD && queue.length && !isStop) {
                    download(queue.shift());
                }
                return Promise.all(promises).then(([taskId]) => taskId);
            },
            del(taskIds) {
                if (!taskIds.length)
                    return;
                isStop = true;
                logger.info('Downloader delete. active:', active.length, 'queue', queue.length);
                active = active.filter((downloadMeta) => {
                    if (taskIds.includes(downloadMeta.taskId) && downloadMeta.state !== 2) {
                        downloadMeta.abort?.();
                        downloadMeta.state = 0;
                        downloadMeta.reject(new CancelError());
                        logger.warn('Download abort manually.', downloadMeta.source.path);
                    }
                    else {
                        return true;
                    }
                });
                converter.del(taskIds);
                compressor.remove(taskIds);
                queue = queue.filter((downloadMeta) => !taskIds.includes(downloadMeta.taskId));
                isStop = false;
                while (active.length < MAX_DOWNLOAD && queue.length) {
                    download(queue.shift());
                }
            }
        };
    }
    const downloader = createDownloader();

    const needBundle = (type) => {
        return ((type === IllustType.manga && config.get('bundleManga')) ||
            (type === IllustType.illusts && config.get('bundleIllusts')));
    };
    const getFilePath = ({ user, userId, title, tagStr, illustId, createDate, page, ext }, option = { needBundle: false, needConvert: false }) => {
        let pathPattern;
        const folderPattern = config.get('folderPattern');
        const filenamePattern = config.get('filenamePattern');
        const isUseFSA = isUseFileSystemAccess();
        const shouldAddFolder = !!folderPattern &&
            !option.needBundle &&
            ((env.isSupportSubpath() && (!option.needConvert || env.isBlobDlAvaliable())) || isUseFSA);
        if (shouldAddFolder) {
            pathPattern = folderPattern + '/' + filenamePattern;
        }
        else {
            pathPattern = filenamePattern;
        }
        if (option.needBundle && !filenamePattern.includes('{page}')) {
            pathPattern += '_{page}';
        }
        function replaceDate(match, p1) {
            const format = p1 || 'YYYY-MM-DD';
            return dayjs__default["default"](createDate).format(format);
        }
        return (pathPattern
            .replaceAll(/\{date\((.*?)\)\}|\{date\}/g, replaceDate)
            .replaceAll('{artist}', user)
            .replaceAll('{artistID}', userId)
            .replaceAll('{title}', title)
            .replaceAll('{tags}', tagStr)
            .replaceAll('{page}', String(page))
            .replaceAll('{id}', illustId) + ext);
    };
    const makeTagsStr = (prev, cur, index, tagsArr) => {
        const tag = config.get('tagLang') === 'ja' ? cur.tag : cur.translation?.['en'] || cur.tag;
        if (index < tagsArr.length - 1) {
            return prev + tag + '_';
        }
        else {
            return prev + tag;
        }
    };
    function isValidIllustType(illustType, option) {
        switch (illustType) {
            case IllustType.illusts:
                if (option.filterIllusts)
                    return true;
                break;
            case IllustType.manga:
                if (option.filterManga)
                    return true;
                break;
            case IllustType.ugoira:
                if (option.filterUgoria)
                    return true;
                break;
            default:
                throw new Error('Invalid filter type');
        }
        return false;
    }
    function filterWorks(works, option) {
        const obj = {
            unavaliable: [],
            avaliable: [],
            invalid: []
        };
        works.forEach((work) => {
            if (!work.isBookmarkable) {
                obj.unavaliable.push(work.id);
            }
            else if (option.filterExcludeDownloaded && pixivHistory.has(work.id)) {
                obj.invalid.push(work.id);
            }
            else if (!isValidIllustType(work.illustType, option)) {
                obj.invalid.push(work.id);
            }
            else {
                obj.avaliable.push(work.id);
            }
        });
        return obj;
    }
    async function getFollowLatestGenerator(filterOption, mode, page) {
        const MAX_PAGE = 34;
        const MAX_ILLUSTS_PER_PAGE = 60;
        let lastId;
        let total;
        let data;
        let cache;
        function findLastId(ids) {
            return Math.min(...ids.map((id) => Number(id)));
        }
        if (page === undefined) {
            data = await api.getFollowLatestWorks(1, mode);
            const ids = data.page.ids;
            total = ids.length;
            lastId = findLastId(ids);
            if (total === MAX_ILLUSTS_PER_PAGE) {
                const secondPageData = await api.getFollowLatestWorks(2, mode);
                const secondIds = secondPageData.page.ids;
                const secondLastId = findLastId(secondIds);
                if (secondLastId < lastId) {
                    lastId = secondLastId;
                    cache = secondPageData;
                    total += secondIds.length;
                }
            }
        }
        else {
            data = await api.getFollowLatestWorks(page, mode);
            total = data.page.ids.length;
        }
        async function* generateIds() {
            yield filterWorks(data.thumbnails.illust, filterOption);
            if (page === undefined) {
                if (total === MAX_ILLUSTS_PER_PAGE)
                    return;
                if (total < MAX_ILLUSTS_PER_PAGE * 2) {
                    yield filterWorks(cache.thumbnails.illust, filterOption);
                    return;
                }
                let currentPage = 3;
                while (currentPage <= MAX_PAGE) {
                    const data = await api.getFollowLatestWorks(currentPage, mode);
                    const ids = data.page.ids;
                    const pageLastId = findLastId(ids);
                    if (pageLastId >= lastId) {
                        logger.info('getFollowLatestGenerator: got duplicate works');
                        yield filterWorks(cache.thumbnails.illust, filterOption);
                        break;
                    }
                    lastId = pageLastId;
                    total += ids.length;
                    yield { ...filterWorks(cache.thumbnails.illust, filterOption), total };
                    cache = data;
                    currentPage++;
                    await sleep(3000);
                }
            }
        }
        return {
            total,
            generator: generateIds()
        };
    }
    async function getChunksGenerator(userId, category, tag, rest, filterOption) {
        const OFFSET = 48;
        let requestUrl;
        if (category === 'bookmarks') {
            requestUrl = `https://www.pixiv.net/ajax/user/${userId}/illusts/bookmarks?tag=${tag}&offset=0&limit=${OFFSET}&rest=${rest}&lang=ja`;
        }
        else {
            requestUrl = `https://www.pixiv.net/ajax/user/${userId}/${category}/tag?tag=${tag}&offset=0&limit=${OFFSET}&lang=ja`;
        }
        let head = 0;
        const firstPageData = await api.getJson(requestUrl);
        const total = firstPageData.total;
        async function* generateIds() {
            yield filterWorks(firstPageData.works, filterOption);
            head += OFFSET;
            while (head < total) {
                const data = await api.getJson(requestUrl.replace('offset=0', 'offset=' + head));
                head += OFFSET;
                await sleep(3000);
                yield filterWorks(data.works, filterOption);
            }
        }
        return {
            total,
            generator: generateIds()
        };
    }
    async function getAllWorksGenerator(userId, filterOption) {
        const profile = await api.getUserAllProfile(userId);
        let illustIds = [];
        let mangaIds = [];
        if ((filterOption.filterIllusts || filterOption.filterUgoria) && typeof profile.illusts === 'object') {
            illustIds.push(...Object.keys(profile.illusts).reverse());
        }
        if (filterOption.filterManga && typeof profile.manga === 'object') {
            mangaIds.push(...Object.keys(profile.manga).reverse());
        }
        if (filterOption.filterExcludeDownloaded) {
            illustIds = illustIds.filter((id) => !pixivHistory.has(id));
            mangaIds = mangaIds.filter((id) => !pixivHistory.has(id));
        }
        async function* generateIds() {
            const OFFSET = 48;
            const baseUrl = 'https://www.pixiv.net/ajax/user/' + userId + '/profile/illusts';
            let workCategory = 'illust';
            while (illustIds.length > 0) {
                let searchStr = '?';
                const chunk = illustIds.splice(0, OFFSET);
                searchStr +=
                    chunk.map((id) => 'ids[]=' + id).join('&') + `&work_category=${workCategory}&is_first_page=0&lang=ja`;
                const data = await api.getJson(baseUrl + searchStr);
                await sleep(3000);
                yield filterWorks(Object.values(data.works).reverse(), filterOption);
            }
            workCategory = 'manga';
            while (mangaIds.length > 0) {
                let searchStr = '?';
                const chunk = mangaIds.splice(0, OFFSET);
                searchStr +=
                    chunk.map((id) => 'ids[]=' + id).join('&') + `&work_category=${workCategory}&is_first_page=0&lang=ja`;
                const data = await api.getJson(baseUrl + searchStr);
                await sleep(3000);
                yield filterWorks(Object.values(data.works).reverse(), filterOption);
            }
        }
        return {
            total: illustIds.length + mangaIds.length,
            generator: generateIds()
        };
    }
    async function getArtworkData(illustId) {
        const htmlText = await api.getArtworkHtml(illustId);
        const preloadDataText = htmlText.match(regexp.preloadData);
        if (!preloadDataText)
            throw new Error('Fail to parse preload data.');
        const preloadData = JSON.parse(preloadDataText[1]);
        const illustData = preloadData.illust[illustId];
        const globalDataText = htmlText.match(regexp.globalData);
        if (!globalDataText)
            throw new Error('Fail to parse global data.');
        const globalData = JSON.parse(globalDataText[1]);
        let ugoiraMeta;
        if (illustData.illustType === IllustType.ugoira) {
            ugoiraMeta = await api.getUgoriaMeta(illustId);
        }
        return {
            illustData,
            globalData,
            ugoiraMeta
        };
    }
    async function getAjaxArtworkData(illustId) {
        const illustData = await api.getArtworkDetail(illustId);
        let ugoiraMeta;
        if (illustData.illustType === IllustType.ugoira) {
            ugoiraMeta = await api.getUgoriaMeta(illustId);
        }
        return {
            illustData,
            ugoiraMeta
        };
    }
    function getDownloadSource(artworkData, seletedPage) {
        const { illustData, ugoiraMeta } = artworkData;
        const { illustType, userName, userId, illustTitle, illustId, tags, pageCount, createDate } = illustData;
        const pathInfo = {
            user: replaceInvalidChar(unescapeHtml(userName)) || 'userId-' + userId,
            title: replaceInvalidChar(unescapeHtml(illustTitle)) || 'illustId-' + illustId,
            tagStr: replaceInvalidChar(unescapeHtml(tags.tags.reduce(makeTagsStr, ''))),
            illustId,
            userId,
            createDate,
            ext: '',
            page: 0
        };
        const metas = [];
        const taskId = illustId + '_' + Math.random().toString(36).slice(2);
        if (illustType === IllustType.illusts || illustType === IllustType.manga) {
            const firstImgSrc = illustData.urls.original;
            const srcPrefix = firstImgSrc.slice(0, firstImgSrc.indexOf('_') + 2);
            const extendName = firstImgSrc.slice(-4);
            pathInfo.ext = extendName;
            if (pageCount > 1 && seletedPage === undefined) {
                if (needBundle(illustType)) {
                    const path = getFilePath({ ...pathInfo, ext: '.zip', page: pageCount });
                    for (let i = 0; i < pageCount; i++) {
                        pathInfo.page = i;
                        metas.push({
                            kind: 'bundle',
                            taskId,
                            path,
                            src: srcPrefix + i + extendName,
                            filename: getFilePath(pathInfo, { needBundle: true }),
                            pageCount
                        });
                    }
                }
                else {
                    for (let i = 0; i < pageCount; i++) {
                        pathInfo.page = i;
                        metas.push({
                            taskId,
                            path: getFilePath(pathInfo),
                            src: srcPrefix + i + extendName
                        });
                    }
                }
            }
            else {
                let src = firstImgSrc;
                if (seletedPage !== undefined) {
                    src = srcPrefix + seletedPage + extendName;
                    pathInfo.page = seletedPage;
                }
                metas.push({
                    taskId,
                    path: getFilePath(pathInfo),
                    src
                });
            }
        }
        else if (illustType === IllustType.ugoira && ugoiraMeta) {
            const ugoriaFormat = config.get('ugoriaFormat');
            pathInfo.ext = '.' + ugoriaFormat;
            if (ugoriaFormat !== 'zip') {
                metas.push({
                    kind: 'convert',
                    format: ugoriaFormat,
                    ugoiraMeta,
                    taskId,
                    src: ugoiraMeta.originalSrc,
                    path: getFilePath(pathInfo, { needConvert: true })
                });
            }
            else {
                metas.push({
                    taskId,
                    src: ugoiraMeta.originalSrc,
                    path: getFilePath(pathInfo)
                });
            }
        }
        return metas;
    }
    const parser = {
        getChunksGenerator,
        getAllWorksGenerator,
        getFollowLatestGenerator,
        getArtworkData,
        getDownloadSource,
        getAjaxArtworkData
    };

    function handleDownload(pdlBtn, illustId) {
        if (isShouldGetDirHandle())
            updateDirHandle();
        let pageCount;
        let pageComplete = 0;
        let shouldDownloadPage;
        let downloading = true;
        const pageAttr = pdlBtn.getAttribute('should-download');
        if (pageAttr) {
            shouldDownloadPage = Number(pageAttr);
        }
        const onProgress = (progress = 0, type = null) => {
            if (pageCount > 1 || !downloading)
                return;
            progress = Math.floor(progress * 100);
            switch (type) {
                case null:
                    pdlBtn.style.setProperty('--pdl-progress', progress + '%');
                case 'gif':
                case 'webm':
                case 'webp':
                    pdlBtn.textContent = String(progress);
                    break;
                case 'zip':
                    pdlBtn.textContent = '';
                    break;
            }
        };
        const onLoad = function () {
            if (pageCount < 2 || !downloading)
                return;
            const progress = Math.floor((++pageComplete / pageCount) * 100);
            pdlBtn.textContent = String(progress);
            pdlBtn.style.setProperty('--pdl-progress', progress + '%');
        };
        pdlBtn.classList.add('pdl-progress');
        parser
            .getArtworkData(illustId)
            .then((artworkData) => {
                const { illustData, globalData } = artworkData;
                const { illustId, tags, bookmarkData } = illustData;
                if (!bookmarkData) {
                    const { token } = globalData;
                    const tagsArr = tags.tags.map((item) => item.tag);
                    addBookmark(pdlBtn, illustId, token, tagsArr);
                }
                return parser.getDownloadSource(artworkData, shouldDownloadPage);
            })
            .then((sources) => {
                pageCount = sources.length;
                return downloader.add(sources, { onLoad, onProgress });
            })
            .then(() => {
                pixivHistory.add(illustId);
                pdlBtn.classList.remove('pdl-error');
                pdlBtn.classList.add('pdl-complete');
            })
            .catch((err) => {
                if (err)
                    logger.error(err);
                pdlBtn.classList.remove('pdl-complete');
                pdlBtn.classList.add('pdl-error');
            })
            .finally(() => {
                downloading = false;
                pdlBtn.innerHTML = '';
                pdlBtn.style.removeProperty('--pdl-progress');
                pdlBtn.classList.remove('pdl-progress');
            });
    }

    function createPdlBtn(attributes, textContent = '', { addEvent } = { addEvent: true }) {
        const ele = document.createElement('button');
        ele.textContent = textContent;
        if (!attributes)
            return ele;
        const { attrs, classList } = attributes;
        if (classList && classList.length > 0) {
            for (const cla of classList) {
                ele.classList.add(cla);
            }
        }
        if (attrs) {
            for (const key in attrs) {
                ele.setAttribute(key, attrs[key]);
            }
        }
        if (addEvent) {
            ele.addEventListener('click', (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                const ele = evt.currentTarget;
                if (!ele.classList.contains('pdl-progress')) {
                    handleDownload(ele, ele.getAttribute('pdl-id'));
                }
            });
        }
        return ele;
    }

    function createThumbnailsBtn(nodes) {
        let isSelfBookmark = false;
        const inBookmarkPage = regexp.bookmarkPage.exec(location.pathname);
        inBookmarkPage && inBookmarkPage[1] === getSelfId() && (isSelfBookmark = true);
        nodes.forEach((e) => {
            let illustId;
            if ((e.childElementCount !== 0 ||
                e.className.includes('_history-item') ||
                e.className.includes('_history-related-item')) &&
                !e.querySelector('.pdl-btn-sub') &&
                (illustId = getIllustId(e))) {
                const attrs = {
                    attrs: { 'pdl-id': illustId },
                    classList: ['pdl-btn', 'pdl-btn-sub']
                };
                if (pixivHistory.has(illustId))
                    attrs.classList.push('pdl-complete');
                if (isSelfBookmark)
                    attrs.classList.push('self-bookmark');
                if (e.className.includes('_history-related-item'))
                    e.style.position = 'relative';
                e.appendChild(createPdlBtn(attrs));
            }
        });
    }

    function fixPixivPreviewer(nodes) {
        const isPpSearchPage = regexp.searchPage.test(location.pathname);
        if (!isPpSearchPage)
            return;
        nodes.forEach((node) => {
            const pdlEle = node.querySelector('.pdl-btn');
            if (!pdlEle)
                return false;
            pdlEle.remove();
        });
    }

    function getFilterOption() {
        return {
            filterExcludeDownloaded: config.get('filterExcludeDownloaded'),
            filterIllusts: config.get('filterIllusts'),
            filterManga: config.get('filterManga'),
            filterUgoria: config.get('filterUgoria')
        };
    }
    function downloadAndRetry(chunksGenerators) {
        useDownloadBar(chunksGenerators).then((failed) => {
            if (failed instanceof Array && failed.length) {
                const gen = async function* () {
                    yield {
                        avaliable: failed,
                        unavaliable: [],
                        invalid: []
                    };
                };
                console.log('[Pixiv Downloader] Retry...');
                useDownloadBar({ total: failed.length, generator: gen() });
            }
        });
    }
    function downloadWorks(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if (isDownloading)
            return;
        const btn = evt.target;
        const userId = btn.getAttribute('pdl-userid');
        const filterOption = getFilterOption();
        if (isShouldGetDirHandle())
            updateDirHandle();
        const ids = parser.getAllWorksGenerator(userId, filterOption);
        downloadAndRetry(ids);
    }
    async function downloadBookmarksOrTags(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if (isDownloading)
            return;
        const btn = evt.target;
        const userId = btn.getAttribute('pdl-userid');
        const category = btn.getAttribute('category');
        const tag = btn.getAttribute('tag') || '';
        const rest = (btn.getAttribute('rest') || 'show');
        if (isShouldGetDirHandle())
            updateDirHandle();
        const filterOption = getFilterOption();
        let idsGenerators;
        if (rest === 'all') {
            const idsShowPromise = parser.getChunksGenerator(userId, 'bookmarks', '', 'show', filterOption);
            const idsHidePromise = parser.getChunksGenerator(userId, 'bookmarks', '', 'hide', filterOption);
            idsGenerators = [idsShowPromise, idsHidePromise];
        }
        else {
            idsGenerators = parser.getChunksGenerator(userId, category, tag, rest, filterOption);
        }
        downloadAndRetry(idsGenerators);
    }
    function downloadFollowLatest(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if (isDownloading)
            return;
        const btn = evt.target;
        const mode = location.pathname.includes('r18') ? 'r18' : 'all';
        const filterOption = getFilterOption();
        let idsGenerators;
        if (btn.classList.contains('pdl-dl-all')) {
            idsGenerators = parser.getFollowLatestGenerator(filterOption, mode);
        }
        else {
            const params = new URLSearchParams(location.search);
            const page = Number(params.get('p')) || 1;
            idsGenerators = parser.getFollowLatestGenerator(filterOption, mode, page);
        }
        downloadAndRetry(idsGenerators);
    }
    function downloadSearchResult(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if (isDownloading)
            return;
        const pdlNodes = document.querySelectorAll('section ul li button.pdl-btn-sub');
        if (!pdlNodes.length)
            return;
        let ids = Array.prototype.map.call(pdlNodes, (node) => node.getAttribute('pdl-id'));
        if (getFilterOption().filterExcludeDownloaded) {
            ids = ids.filter((id) => !pixivHistory.has(id));
        }
        const idsGenerators = {
            total: ids.length,
            generator: (async function* () {
                yield {
                    avaliable: ids,
                    unavaliable: [],
                    invalid: []
                };
            })()
        };
        downloadAndRetry(idsGenerators);
    }

    const dlBarRef = {
        filter: {
            filterExcludeDownloaded: undefined,
            filterIllusts: undefined,
            filterManga: undefined,
            filterUgoria: undefined
        },
        statusBar: undefined,
        abortBtn: undefined
    };
    function updateStatus(str) {
        dlBarRef.statusBar && (dlBarRef.statusBar.textContent = str);
    }
    function createFilterEl(id, filterType, text) {
        const checkbox = document.createElement('input');
        const label = document.createElement('label');
        checkbox.id = id;
        checkbox.type = 'checkbox';
        checkbox.classList.add('pdl-checkbox');
        checkbox.setAttribute('category', String(filterType));
        checkbox.checked = config.get(filterType);
        label.setAttribute('for', id);
        label.setAttribute('category', String(filterType));
        label.textContent = text;
        checkbox.addEventListener('change', (evt) => {
            const checkbox = evt.currentTarget;
            const category = checkbox.getAttribute('category');
            config.set(category, checkbox.checked);
        });
        dlBarRef.filter[filterType] = checkbox;
        const wrap = document.createElement('div');
        wrap.classList.add('pdl-filter');
        wrap.appendChild(checkbox);
        wrap.appendChild(label);
        return wrap;
    }
    function createFilter() {
        const wrapper = document.createElement('div');
        wrapper.classList.add('pdl-filter-wrap');
        wrapper.appendChild(createFilterEl('pdl-filter-exclude_downloaded', 'filterExcludeDownloaded', t('checkbox.filter_exclude_downloaded')));
        wrapper.appendChild(createFilterEl('pdl-filter-illusts', 'filterIllusts', t('checkbox.filter_illusts')));
        wrapper.appendChild(createFilterEl('pdl-filter-manga', 'filterManga', t('checkbox.filter_manga')));
        wrapper.appendChild(createFilterEl('pdl-filter-ugoria', 'filterUgoria', t('checkbox.filter_ugoria')));
        return wrapper;
    }
    function createExcludeDownloadedFilter() {
        const wrapper = document.createElement('div');
        wrapper.classList.add('pdl-filter-wrap');
        wrapper.appendChild(createFilterEl('pdl-filter-exclude_downloaded', 'filterExcludeDownloaded', t('checkbox.filter_exclude_downloaded')));
        return wrapper;
    }
    function createDownloadBar(userId) {
        const nav = document.querySelector('nav[class~="sc-192ftwf-0"]');
        if (!nav)
            return;
        const dlBtn = nav.querySelector('.pdl-btn-all');
        if (dlBtn) {
            if (dlBtn.getAttribute('pdl-userid') === userId)
                return;
            removeDownloadBar();
        }
        const dlBar = document.createElement('div');
        dlBar.classList.add('pdl-dlbar');
        const statusBar = document.createElement('div');
        statusBar.classList.add('pdl-dlbar-status_bar');
        dlBarRef.statusBar = dlBar.appendChild(statusBar);
        const baseClasses = nav.querySelector('a:not([aria-current])').classList;
        dlBarRef.abortBtn = dlBar.appendChild(createPdlBtn({
            attrs: { 'pdl-userId': userId },
            classList: [...baseClasses, 'pdl-stop', 'pdl-hide']
        }, t('button.download_stop'), { addEvent: false }));
        if (userId !== getSelfId()) {
            const hasWorks = ["a[href$='illustrations']", "a[href$='manga']"].some((selector) => !!nav.querySelector(selector));
            if (hasWorks) {
                const el = createPdlBtn({
                    attrs: { 'pdl-userid': userId },
                    classList: [...baseClasses, 'pdl-btn-all']
                }, t('button.download_works'), { addEvent: false });
                el.addEventListener('click', downloadWorks);
                dlBar.appendChild(el);
            }
            if (nav.querySelector("a[href*='bookmarks']")) {
                const el = createPdlBtn({
                    attrs: { 'pdl-userid': userId, category: 'bookmarks' },
                    classList: [...baseClasses, 'pdl-btn-all']
                }, t('button.download_bookmarks'), { addEvent: false });
                el.addEventListener('click', downloadBookmarksOrTags);
                dlBar.appendChild(el);
            }
        }
        else {
            if (nav.querySelector("a[href*='bookmarks']")) {
                dlBar.appendChild(createPdlBtn({
                    attrs: { 'pdl-userid': userId, category: 'bookmarks', rest: 'all' },
                    classList: [...baseClasses, 'pdl-btn-all']
                }, t('button.download_bookmarks'), { addEvent: false }));
                dlBar.appendChild(createPdlBtn({
                    attrs: {
                        'pdl-userid': userId,
                        category: 'bookmarks',
                        rest: 'show'
                    },
                    classList: [...baseClasses, 'pdl-btn-all']
                }, t('button.download_bookmarks_public'), { addEvent: false }));
                dlBar.appendChild(createPdlBtn({
                    attrs: {
                        'pdl-userid': userId,
                        category: 'bookmarks',
                        rest: 'hide'
                    },
                    classList: [...baseClasses, 'pdl-btn-all']
                }, t('button.download_bookmarks_private'), { addEvent: false }));
                dlBar.querySelectorAll('.pdl-btn-all').forEach((node) => {
                    node.addEventListener('click', downloadBookmarksOrTags);
                });
            }
        }
        const filter = createFilter();
        nav.parentElement.insertBefore(filter, nav);
        nav.appendChild(dlBar);
    }
    function removeDownloadBar() {
        const dlBarWrap = document.querySelector('.pdl-dlbar');
        if (dlBarWrap) {
            dlBarWrap.remove();
            document.querySelector('.pdl-filter-wrap')?.remove();
        }
    }
    function updateFollowLatestDownloadBarBtnText(prevDlBtn, prevDlAllBtn) {
        if (location.pathname.includes('r18') && prevDlBtn.textContent !== t('button.download_r18_one_page')) {
            prevDlBtn.textContent = t('button.download_r18_one_page');
            prevDlAllBtn.textContent = t('button.download_r18');
        }
        else if (!location.pathname.includes('r18') && prevDlBtn.textContent !== t('button.download_all_one_page')) {
            prevDlBtn.textContent = t('button.download_all_one_page');
            prevDlAllBtn.textContent = t('button.download_all');
        }
    }
    function createFollowLatestDownloadBar() {
        const prevDlBtn = document.querySelector('.pdl-btn-all');
        if (prevDlBtn) {
            const prevDlAllBtn = document.querySelector('.pdl-dl-all');
            updateFollowLatestDownloadBarBtnText(prevDlBtn, prevDlAllBtn);
            return;
        }
        const nav = document.querySelector('nav');
        if (!nav || nav.parentElement.childElementCount === 1)
            return;
        const navBar = nav.parentElement;
        const modeSwitch = nav.nextElementSibling;
        const filter = createFilter();
        navBar.parentElement.insertBefore(filter, navBar);
        const dlBar = document.createElement('div');
        dlBar.classList.add('pdl-dlbar');
        dlBar.classList.add('pdl-dlbar-follow_latest');
        const statusBar = document.createElement('div');
        statusBar.classList.add('pdl-dlbar-status_bar');
        dlBarRef.statusBar = dlBar.appendChild(statusBar);
        const baseClasses = nav.querySelector('a:not([aria-current])').classList;
        dlBarRef.abortBtn = dlBar.appendChild(createPdlBtn({
            attrs: { 'pdl-userid': '' },
            classList: [...baseClasses, 'pdl-stop', 'pdl-hide']
        }, t('button.download_stop'), { addEvent: false }));
        const dlBtn = createPdlBtn({
            attrs: { 'pdl-userid': '' },
            classList: [...baseClasses, 'pdl-btn-all']
        }, t('button.download_works'), { addEvent: false });
        dlBtn.addEventListener('click', downloadFollowLatest);
        dlBar.appendChild(dlBtn);
        const dlAllBtn = createPdlBtn({
            attrs: { 'pdl-userid': '' },
            classList: [...baseClasses, 'pdl-btn-all', 'pdl-dl-all']
        }, t('button.download_works'), { addEvent: false });
        dlAllBtn.addEventListener('click', downloadFollowLatest);
        dlBar.appendChild(dlAllBtn);
        navBar.insertBefore(dlBar, modeSwitch);
    }
    function createSearchDownloadbar() {
        if (document.querySelector('.pdl-dlbar'))
            return;
        const sections = document.querySelectorAll('section');
        const worksSection = sections[sections.length - 1];
        const styleRefEle = document.querySelector('nav a:not([aria-current])');
        if (!worksSection || !styleRefEle)
            return;
        const dlBarContainer = worksSection.firstElementChild.firstElementChild;
        const dlBar = document.createElement('div');
        dlBar.classList.add('pdl-dlbar');
        dlBar.classList.add('pdl-dlbar-search');
        const statusBar = document.createElement('div');
        statusBar.classList.add('pdl-dlbar-status_bar');
        dlBarRef.statusBar = dlBar.appendChild(statusBar);
        const baseClasses = styleRefEle.classList;
        dlBarRef.abortBtn = dlBar.appendChild(createPdlBtn({
            attrs: { 'pdl-userid': '' },
            classList: [...baseClasses, 'pdl-stop', 'pdl-hide']
        }, t('button.download_stop'), { addEvent: false }));
        const dlBtn = createPdlBtn({
            attrs: { 'pdl-userid': '' },
            classList: [...baseClasses, 'pdl-btn-all']
        }, t('button.download_all_one_page'), { addEvent: false });
        dlBtn.addEventListener('click', downloadSearchResult);
        const filter = createExcludeDownloadedFilter();
        dlBarContainer.parentElement.insertBefore(filter, dlBarContainer);
        dlBar.appendChild(dlBtn);
        dlBarContainer.appendChild(dlBar);
    }
    function changeDlbarDisplay() {
        document.querySelectorAll('.pdl-dlbar .pdl-btn-all').forEach((ele) => {
            ele.classList.toggle('pdl-hide');
        });
        document.querySelector('.pdl-dlbar .pdl-stop')?.classList.toggle('pdl-hide');
        document.querySelectorAll('.pdl-tag').forEach((ele) => {
            ele.classList.toggle('pdl-tag-hide');
        });
        document.querySelector('.pdl-filter-wrap')?.classList.toggle('pdl-unavailable');
    }

    function onProgressCB(progressData) {
        if (typeof progressData === 'string') {
            updateStatus(progressData);
        }
        else {
            logger.info('Update progress by', progressData.illustId, ', completed: ', progressData.completed);
            updateStatus(`Downloading: ${progressData.completed} / ${progressData.avaliable}`);
        }
    }
    async function downloadByIds(total, idsGenerators, signal, onProgress) {
        signal.throwIfAborted();
        const failed = [];
        const unavaliable = [];
        const invalid = [];
        const tasks = [];
        let completed = 0;
        let tooManyRequests = false;
        let wakeTooManyRequest;
        let wakeInterval;
        let resolve;
        let reject;
        const done = new Promise((r, j) => {
            resolve = r;
            reject = j;
        });
        signal.addEventListener('abort', () => {
            if (tasks.length) {
                downloader.del(tasks);
                tasks.length = 0;
            }
            wakeTooManyRequest?.();
            wakeInterval?.();
            reject(signal.aborted ? signal.reason : 'unexpected generator error');
        }, { once: true });
        const afterEach = (illustId) => {
            const avaliable = total - failed.length - unavaliable.length - invalid.length;
            onProgress({
                illustId,
                avaliable,
                completed
            });
            if (completed === avaliable) {
                resolve({ failed, unavaliable });
            }
        };
        onProgress('Downloading...');
        try {
            for (const idsGenerator of idsGenerators) {
                for await (const ids of idsGenerator) {
                    logger.info('Got ids:', ids);
                    signal.throwIfAborted();
                    if (ids.unavaliable.length) {
                        unavaliable.push(...ids.unavaliable);
                    }
                    if (ids.invalid.length) {
                        invalid.push(...ids.invalid);
                    }
                    if (typeof ids.total === 'number' && !Number.isNaN(ids.total)) {
                        total = ids.total;
                    }
                    if (ids.avaliable.length) {
                        for (const id of ids.avaliable) {
                            signal.throwIfAborted();
                            if (tooManyRequests) {
                                onProgress('Too many requests, wait 30s');
                                const { wake, sleep } = wakeableSleep(30000);
                                wakeTooManyRequest = wake;
                                await sleep;
                                signal.throwIfAborted();
                                tooManyRequests = false;
                                onProgress('Downloading...');
                            }
                            parser
                                .getAjaxArtworkData(id)
                                .then((data) => {
                                    signal.throwIfAborted();
                                    const sources = parser.getDownloadSource(data);
                                    tasks.push(sources[0].taskId);
                                    return downloader.add(sources);
                                })
                                .then((taskId) => {
                                    pixivHistory.add(id);
                                    if (!signal.aborted) {
                                        tasks.splice(tasks.indexOf(taskId), 1);
                                        completed++;
                                        afterEach(id);
                                    }
                                }, (reason) => {
                                    if (!signal.aborted) {
                                        reason && logger.error(reason);
                                        if (reason instanceof RequestError && reason.response.status === 429) {
                                            tooManyRequests = true;
                                        }
                                        if (reason instanceof JsonDataError) {
                                            unavaliable.push(id);
                                        }
                                        else {
                                            failed.push(id);
                                        }
                                        afterEach(id);
                                    }
                                });
                            const { wake, sleep } = wakeableSleep(1000);
                            wakeInterval = wake;
                            await sleep;
                        }
                    }
                    else {
                        afterEach('no avaliable id');
                    }
                }
            }
        }
        catch (error) {
            if (!signal.aborted) {
                done.catch((reason) => {
                    logger.info('catch unexpected abort: ', reason);
                });
                signal.dispatchEvent(new Event('abort'));
                throw error;
            }
        }
        return done;
    }
    let isDownloading = false;
    async function useDownloadBar(chunksGenerators) {
        if (!dlBarRef.abortBtn)
            return;
        let total = 0;
        let failedResult;
        const idsGenerators = [];
        !Array.isArray(chunksGenerators) && (chunksGenerators = [chunksGenerators]);
        isDownloading = true;
        changeDlbarDisplay();
        try {
            await Promise.all(chunksGenerators).then((gens) => {
                gens.forEach((val) => {
                    total += val.total;
                    idsGenerators.push(val.generator);
                });
            });
        }
        catch (error) {
            logger.error(error);
            updateStatus('Network error, see console');
            changeDlbarDisplay();
            isDownloading = false;
            return;
        }
        if (total === 0) {
            updateStatus('No works');
        }
        else {
            try {
                logger.info('Total works:', total);
                const controller = new AbortController();
                const signal = controller.signal;
                !signal.throwIfAborted &&
                    (signal.throwIfAborted = function () {
                        if (this.aborted) {
                            throw this.reason;
                        }
                    });
                if (!('reason' in signal)) {
                    const abort = controller.abort;
                    controller.abort = function (reason) {
                        this.signal.reason = reason ? reason : new DOMException('signal is aborted without reason');
                        abort.apply(this);
                    };
                }
                dlBarRef.abortBtn?.addEventListener('click', () => {
                    controller.abort();
                }, { once: true });
                const { failed, unavaliable } = await downloadByIds(total, idsGenerators, signal, onProgressCB);
                if (failed.length || unavaliable.length) {
                    updateStatus(`Failed: ${failed.length + unavaliable.length}. See console.`);
                    console.log('[Pixiv Downloader] Failed: ', failed.join(', '));
                    console.log('[Pixiv Downloader] Unavaliable: ', unavaliable.join(', '));
                    if (failed.length)
                        failedResult = failed;
                }
                else {
                    console.log('[Pixiv Downloader] Download complete');
                    updateStatus('Complete');
                }
            }
            catch (error) {
                if (error instanceof DOMException) {
                    updateStatus('Stop');
                }
                else {
                    updateStatus('Error, see console');
                    logger.error(error);
                }
            }
        }
        changeDlbarDisplay();
        isDownloading = false;
        return failedResult;
    }

    function createTagsBtn(userId, category) {
        const tagsEles = document.querySelectorAll('section> div:nth-child(2) > div > div');
        if (!tagsEles.length)
            return;
        let cate;
        if (category === 'illustrations' || category === 'artworks') {
            cate = 'illusts';
        }
        else {
            cate = category;
        }
        let rest = 'show';
        if (userId === getSelfId() && category === 'bookmarks' && location.search.includes('rest=hide'))
            rest = 'hide';
        tagsEles.forEach((ele) => {
            const tagBtn = ele.querySelector('.pdl-btn');
            if (tagBtn) {
                const btnRest = tagBtn.getAttribute('rest');
                if (rest !== btnRest)
                    tagBtn.setAttribute('rest', rest);
                return;
            }
            let tag;
            const tagLink = ele.querySelector('a');
            if (!tagLink)
                return;
            if (tagLink.getAttribute('status') !== 'active') {
                if (rest === 'hide') {
                    tag = tagLink.href.slice(tagLink.href.lastIndexOf('/') + 1, tagLink.href.lastIndexOf('?'));
                }
                else {
                    tag = tagLink.href.slice(tagLink.href.lastIndexOf('/') + 1);
                }
            }
            else {
                const tagTextEles = ele.querySelectorAll('div[title]');
                if (!tagTextEles.length)
                    return logger.info('No Tags Element found.');
                tag = tagTextEles[tagTextEles.length - 1].getAttribute('title').slice(1);
            }
            const attrs = {
                attrs: { 'pdl-userId': userId, category: cate, tag, rest },
                classList: ['pdl-btn', 'pdl-tag']
            };
            if (isDownloading)
                attrs.classList.push('pdl-tag-hide');
            const dlBtn = createPdlBtn(attrs, '', { addEvent: false });
            if (!(tagLink.href.includes('bookmarks') && tagLink.getAttribute('status') !== 'active')) {
                dlBtn.style.backgroundColor = tagLink.getAttribute('color') + '80';
            }
            dlBtn.addEventListener('click', downloadBookmarksOrTags);
            ele.appendChild(dlBtn);
        });
        let modalTagsEles;
        let modal;
        if (category === 'bookmarks') {
            modal = document.querySelector('div[role="presentation"]');
            if (!modal)
                return;
            modalTagsEles = modal.querySelectorAll('a');
        }
        else {
            const charcoalTokens = document.querySelectorAll('.charcoal-token');
            modal = charcoalTokens[charcoalTokens.length - 1];
            if (!modal)
                return;
            modalTagsEles = modal.querySelectorAll('a');
        }
        if (!regexp.userPageTags.exec(modalTagsEles[0]?.href))
            return;
        modalTagsEles.forEach((ele) => {
            if (ele.querySelector('.pdl-btn'))
                return;
            let tag;
            if (rest === 'hide') {
                tag = ele.href.slice(ele.href.lastIndexOf('/') + 1, ele.href.lastIndexOf('?'));
            }
            else {
                tag = ele.href.slice(ele.href.lastIndexOf('/') + 1);
            }
            const attrs = {
                attrs: { 'pdl-userId': userId, category: cate, tag, rest },
                classList: ['pdl-btn', 'pdl-modal-tag']
            };
            if (isDownloading)
                attrs.classList.push('pdl-tag-hide');
            const dlBtn = createPdlBtn(attrs, '', { addEvent: false });
            dlBtn.addEventListener('click', (evt) => {
                modal.querySelector('svg').parentElement.click();
                downloadBookmarksOrTags(evt);
            });
            ele.appendChild(dlBtn);
        });
    }

    function createToolbarBtn(id) {
        if (document.querySelector('.pdl-btn-main'))
            return;
        const handleBar = document.querySelector('main section section');
        if (handleBar) {
            const pdlBtnWrap = handleBar.lastElementChild.cloneNode();
            const attrs = {
                attrs: { 'pdl-id': id },
                classList: ['pdl-btn', 'pdl-btn-main']
            };
            if (pixivHistory.has(id))
                attrs.classList.push('pdl-complete');
            pdlBtnWrap.appendChild(createPdlBtn(attrs));
            handleBar.appendChild(pdlBtnWrap);
        }
    }

    function createWorkScrollBtn(id) {
        const works = document.querySelectorAll("[role='presentation'] > a");
        if (works.length < 2)
            return;
        const containers = Array.from(works).map((node) => node.parentElement.parentElement);
        if (containers[0].querySelector('.pdl-btn'))
            return;
        containers.forEach((node, idx) => {
            const wrapper = document.createElement('div');
            wrapper.classList.add('pdl-wrap-artworks');
            const attrs = {
                attrs: { 'pdl-id': id, 'should-download': String(idx) },
                classList: ['pdl-btn', 'pdl-btn-sub', 'artworks']
            };
            wrapper.appendChild(createPdlBtn(attrs));
            node.appendChild(wrapper);
        });
    }

    const createPresentationBtn = (() => {
        let observer, btn;
        function cb(mutationList) {
            const newImg = mutationList[1]['addedNodes'][0];
            const [pageNum] = regexp.originSrcPageNum.exec(newImg.src) ?? [];
            if (!pageNum)
                throw new Error('[Error]Invalid Image Element.');
            btn?.setAttribute('should-download', String(pageNum));
        }
        return (id) => {
            const containers = document.querySelector("body > [role='presentation'] > div");
            if (!containers) {
                if (observer) {
                    observer.disconnect();
                    observer = null;
                    btn = null;
                }
                return;
            }
            if (containers.querySelector('.pdl-btn'))
                return;
            const img = containers.querySelector('img');
            if (!img)
                return;
            const isOriginImg = regexp.originSrcPageNum.exec(img.src);
            if (!isOriginImg)
                return;
            const [pageNum] = isOriginImg;
            const attrs = {
                attrs: { 'pdl-id': id, 'should-download': pageNum },
                classList: ['pdl-btn', 'pdl-btn-sub', 'presentation']
            };
            btn = createPdlBtn(attrs);
            containers.appendChild(btn);
            if (!img.parentElement)
                return;
            observer = new MutationObserver(cb);
            observer.observe(img.parentElement, { childList: true, subtree: true });
        };
    })();

    function createPreviewModalBtn() {
        const illustModalBtn = document.querySelectorAll('.gtm-manga-viewer-preview-modal-open');
        const mangaModalBtn = document.querySelectorAll('.gtm-manga-viewer-open-preview');
        const mangaViewerModalBtn = document.querySelectorAll('.gtm-manga-viewer-close-icon')?.[1];
        if (!illustModalBtn.length && !mangaModalBtn.length)
            return;
        const btns = [...illustModalBtn, ...mangaModalBtn];
        if (mangaViewerModalBtn)
            btns.push(mangaViewerModalBtn);
        btns.forEach((node) => {
            node.addEventListener('click', handleModalClick);
        });
    }
    function handleModalClick() {
        const timer = setInterval(() => {
            logger.info('Start to find modal.');
            const ulList = document.querySelectorAll('ul');
            const previewList = ulList[ulList.length - 1];
            if (getComputedStyle(previewList).display !== 'grid')
                return;
            clearInterval(timer);
            const [, id] = regexp.artworksPage.exec(location.pathname) ?? [];
            previewList.childNodes.forEach((node, idx) => {
                node.style.position = 'relative';
                const attrs = {
                    attrs: { 'pdl-id': id, 'should-download': String(idx) },
                    classList: ['pdl-btn', 'pdl-btn-sub']
                };
                node.appendChild(createPdlBtn(attrs));
            });
        }, 300);
    }

    function pageActions() {
        const pathname = location.pathname;
        let param;
        switch (true) {
            case !!(param = regexp.artworksPage.exec(pathname)): {
                const id = param[1];
                createToolbarBtn(id);
                createWorkScrollBtn(id);
                createPresentationBtn(id);
                createPreviewModalBtn();
                break;
            }
            case !!(param = regexp.userPage.exec(pathname)): {
                const id = param[1];
                createDownloadBar(id);
                const matchTag = regexp.userPageTags.exec(pathname);
                if (matchTag) {
                    createTagsBtn(id, matchTag[1]);
                }
                break;
            }
            case regexp.followLatest.test(pathname): {
                createFollowLatestDownloadBar();
                break;
            }
            case regexp.searchPage.test(pathname): {
                createSearchDownloadbar();
                break;
            }
            case regexp.historyPage.test(pathname): {
                createThumbnailsBtn(document.querySelectorAll('span[style]._history-item'));
                break;
            }
            default:
                removeDownloadBar();
                break;
        }
    }
    let firstRun = true;
    function observerCallback(records) {
        const addedNodes = [];
        records.forEach((record) => {
            if (!record.addedNodes.length)
                return;
            record.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BUTTON' && node.tagName !== 'IMG') {
                    addedNodes.push(node);
                }
            });
        });
        if (!addedNodes.length)
            return;
        if (firstRun) {
            createThumbnailsBtn(document.querySelectorAll('a'));
            firstRun = false;
        }
        else {
            fixPixivPreviewer(addedNodes);
            const thunmnails = addedNodes.reduce((prev, current) => {
                return prev.concat(current instanceof HTMLAnchorElement ? [current] : Array.from(current.querySelectorAll('a')));
            }, []);
            createThumbnailsBtn(thunmnails);
        }
        pageActions();
    }

    function createModal(args, option = { closeOnClickModal: false }) {
        const modalHtml = `
<div class="pdl-modal">
  <div class="pdl-dialog">
    <button class="pdl-dialog-close"></button>
    <header class="pdl-dialog-header"></header>
    <div class="pdl-dialog-content"></div>
    <footer class="pdl-dialog-footer"></footer>
  </div>
</div>`;
        const fragment = stringToFragment(modalHtml);
        const modal = fragment.querySelector('.pdl-modal');
        const dialog = modal.querySelector('.pdl-dialog');
        const closeBtn = modal.querySelector('.pdl-dialog-close');
        const header = modal.querySelector('.pdl-dialog-header');
        const content = modal.querySelector('.pdl-dialog-content');
        const footer = modal.querySelector('.pdl-dialog-footer');
        if (option.closeOnClickModal) {
            dialog.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            modal.addEventListener('click', () => {
                modal.remove();
            });
        }
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        args.header && header.appendChild(args.header);
        args.footer && footer.appendChild(args.footer);
        content.appendChild(args.content);
        return fragment;
    }

    function showUpgradeMsg() {
        const headerHtml = `<h3>Pixiv Downloader ${config.get('version')}</h3>`;
        const contentHtml = `
<div class="pdl-changelog">
  <ul>
    <li>支持<a target="_blank" href="https://www.pixiv.net/history.php">浏览记录页</a>。</li>
    <li>一些调整。</li>
  </ul>
</div>`;
        const footerHtml = `
<style>
  .pdl-dialog-footer {
    position: relative;
    font-size: 12px;
  }
</style>
<details style="margin-top: 1.5em">
  <summary style="display: inline-block; list-style: none; cursor: pointer; color: #0096fa; text-decoration: underline">
    脚本还行？请我喝杯可乐吧！
  </summary>
  ${creditCode}
  <p style="text-align: center">愿你每天都能找到对的色图，就像我每天都能喝到香草味可乐</p>
</details>
<a
  target="_blank"
  style="position: absolute; right: 0px; top: 0px; color: #0096fa; text-decoration: underline"
  href="https://greasyfork.org/zh-CN/scripts/432150-pixiv-downloader/feedback"
  >${t('text.feedback')}
</a>`;
        document.body.appendChild(createModal({
            header: stringToFragment(headerHtml),
            content: stringToFragment(contentHtml),
            footer: stringToFragment(footerHtml)
        }));
    }

    function createTabUgoria() {
        const tabHtml = `<div class="pdl-tab-item">${t('text.tab_title_ugoria')}</div>`;
        const paneHtml = `
<div class="pdl-tab-pane">
  <div id="pdl-setting-ugoria">
    <p class="option-header">${t('text.label_ugoria_format')}</p>
    <div id="pdl-ugoria-format-wrap">
      <div class="pdl-ugoria-format-item">
        <input type="radio" id="pdl-ugoria-zip" value="zip" name="format" /><label for="pdl-ugoria-zip">Zip</label>
      </div>
      <div class="pdl-ugoria-format-item">
        <input type="radio" id="pdl-ugoria-gif" value="gif" name="format" /><label for="pdl-ugoria-gif">Gif</label>
      </div>
      <div class="pdl-ugoria-format-item">
        <input type="radio" id="pdl-ugoria-apng" value="png" name="format" /><label for="pdl-ugoria-apng">Png</label>
      </div>
      <div class="pdl-ugoria-format-item">
        <input type="radio" id="pdl-ugoria-webm" value="webm" name="format" /><label for="pdl-ugoria-webm">Webm</label>
      </div>
      <div class="pdl-ugoria-format-item">
        <input type="radio" id="pdl-ugoria-webp" value="webp" name="format" /><label for="pdl-ugoria-webp">Webp</label>
      </div>
    </div>
  </div>
</div>`;
        const tab = stringToFragment(tabHtml);
        const pane = stringToFragment(paneHtml);
        const ugoriaFormat = config.get('ugoriaFormat');
        pane.querySelectorAll('.pdl-ugoria-format-item input[type="radio"]').forEach((el) => {
            if (ugoriaFormat === el.value)
                el.checked = true;
            el.addEventListener('change', (ev) => {
                config.set('ugoriaFormat', ev.currentTarget.value);
            });
        });
        return {
            tab,
            pane
        };
    }

    function createTabFilename() {
        const tabHtml = `<div class="pdl-tab-item">${t('text.tab_title_filename')}</div>`;
        const paneHtml = `
<div class="pdl-tab-pane">
  <div id="pdl-setting-filename">
    <div>
      <div class="pdl-input-wrap">
        <label for="pdlfolder">${t('text.label_folder')}</label>
        <input type="text" id="pdlfolder" maxlength="100" />
        <button id="pdl-filename-folder-reset" class="pdl-dialog-button icon" disabled>↺</button>
        <button id="pdl-filename-folder-confirm" class="pdl-dialog-button icon primary" disabled>✓</button>
      </div>
      <div class="pdl-input-wrap">
        <label for="pdlfilename">${t('text.label_filename')}</label>
        <input type="text" id="pdlfilename" placeholder="${t('text.placeholder_folder_subfolder_unused')}" required maxlength="100" />
        <button id="pdl-filename-filename-reset" class="pdl-dialog-button icon" disabled>↺</button>
        <button id="pdl-filename-filename-confirm" class="pdl-dialog-button icon primary" disabled>✓</button>
      </div>
    </div>
    <div class="tags-option">
      <span class="tags-title">${t('text.label_tag_lang')}</span>
      <div class="tags-content">
        <div class="tags-item">
          <input class="pdl-option-tag" type="radio" name="lang" id="lang_ja" value="ja" />
          <label for="lang_ja">日本語(default)</label>
        </div>
        <div class="tags-item">
          <input class="pdl-option-tag" type="radio" name="lang" id="lang_zh" value="zh" />
          <label for="lang_zh">简中</label>
        </div>
        <div class="tags-item">
          <input class="pdl-option-tag" type="radio" name="lang" id="lang_zh_tw" value="zh_tw" />
          <label for="lang_zh_tw">繁中</label>
        </div>
        <div class="tags-item">
          <input class="pdl-option-tag" type="radio" name="lang" id="lang_en" value="en" />
          <label for="lang_en">English</label>
        </div>
      </div>
    </div>
    <p style="font-size: 14px; margin: 0.5em 0">${t('text.tips_filename_pattern')}</p>
    <p style="font-size: 14px; margin: 0.5em 0">${t('text.tips_subfolder_unused')}</p>
    <p style="font-size: 14px; margin: 0.5em 0">${t('text.tips_tag_translation')}</p>
    <hr />
    <div ${env.isFileSystemAccessAvaliable() ? '' : 'class="pdl-unavailable"'}>
      <div style="display: flex; justify-content: space-between; align-items: center; margin: 12px 0; gap: 12px">
        <label class="pdl-options" style="padding: 0.6em 4px">
          <span style="font-weight: 700">${t('text.label_fsa')}</span>
          <input id="pdl-options-file-system-access" type="checkbox" class="pdl-checkbox" style="margin-left: 8px" />
        </label>
        <hr class="vertical" />
        <div class="pdl-input-wrap" style="flex: 1; margin: 0">
          <input id="pdl-fsa-show-directory" type="text" placeholder="${t('text.placeholder_fsa_folder')}" style="font-size: 14px; padding: 8px 0.5em; line-height: 1.15" disabled/>
        </div>
        <button id="pdl-fsa-change-directory" class="pdl-dialog-button primary">${t('button.fsa_change_dir')}</button>
      </div>
      <div class="tags-option">
        <span class="tags-title">${t('text.label_filename_conflict')}</span>
        <div class="tags-content">
          <div class="tags-item">
            <input class="pdl-option-conflict" type="radio" name="conflict_action" id="action_uniquify" value="uniquify"/>
            <label for="action_uniquify">${t('radio.filename_conflict_option_uniquify')}</label>
          </div>
          <div class="tags-item">
            <input class="pdl-option-conflict" type="radio" name="conflict_action" id="action_overwrite" value="overwrite"/>
            <label for="action_overwrite">${t('radio.filename_conflict_option_overwrite')}</label>
          </div>
          <div class="tags-item">
            <input class="pdl-option-conflict" type="radio" name="conflict_action" id="action_prompt" value="prompt"/>
            <label for="action_prompt">${t('radio.filename_conflict_option_prompt')}</label>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;
        const tab = stringToFragment(tabHtml);
        const pane = stringToFragment(paneHtml);
        const folder = pane.querySelector('#pdlfolder');
        const folderReset = pane.querySelector('#pdl-filename-folder-reset');
        const folderUpdate = pane.querySelector('#pdl-filename-folder-confirm');
        const filename = pane.querySelector('#pdlfilename');
        const filenameReset = pane.querySelector('#pdl-filename-filename-reset');
        const filenameUpdate = pane.querySelector('#pdl-filename-filename-confirm');
        const filenamePattern = config.get('filenamePattern');
        const folderPattern = config.get('folderPattern');
        if (!folder || !filename)
            throw new Error('[Error]Can not create modal.');
        filename.value = filenamePattern;
        if (!env.isSupportSubpath()) {
            folder.setAttribute('disabled', '');
            folder.value = '';
        }
        else {
            folder.value = folderPattern;
        }
        folder.placeholder = env.isViolentmonkey()
            ? t('text.placeholder_folder_vm')
            : !env.isSupportSubpath()
                ? t('text.placeholder_folder_need_api')
                : t('text.placeholder_folder_subfolder_unused');
        folder.addEventListener('input', () => {
            folderReset?.removeAttribute('disabled');
            folderUpdate?.removeAttribute('disabled');
        });
        folderReset?.addEventListener('click', () => {
            folder.value = config.get('folderPattern');
            folderReset?.setAttribute('disabled', '');
            folderUpdate?.setAttribute('disabled', '');
        });
        folderUpdate?.addEventListener('click', () => {
            const folderPattern = folder.value
                .split('/')
                .map(replaceInvalidChar)
                .filter((path) => !!path)
                .join('/');
            config.set('folderPattern', folderPattern);
            folder.value = folderPattern;
            folderReset?.setAttribute('disabled', '');
            folderUpdate?.setAttribute('disabled', '');
        });
        filename.addEventListener('input', () => {
            filenameReset?.removeAttribute('disabled');
            filenameUpdate?.removeAttribute('disabled');
        });
        filenameReset?.addEventListener('click', () => {
            filename.value = config.get('filenamePattern');
            filenameReset?.setAttribute('disabled', '');
            filenameUpdate?.setAttribute('disabled', '');
        });
        filenameUpdate?.addEventListener('click', () => {
            const filenamePattern = replaceInvalidChar(filename.value);
            if (filenamePattern === '')
                return filenameReset?.click();
            config.set('filenamePattern', filenamePattern);
            filename.value = filenamePattern;
            filenameReset?.setAttribute('disabled', '');
            filenameUpdate?.setAttribute('disabled', '');
        });
        const tagLang = config.get('tagLang');
        pane.querySelectorAll('.tags-content .tags-item input.pdl-option-tag').forEach((input) => {
            if (tagLang === input.value)
                input.checked = true;
            input.addEventListener('change', (ev) => {
                config.set('tagLang', ev.currentTarget.value);
            });
        });
        if (env.isFileSystemAccessAvaliable()) {
            const enableFSA = pane.querySelector('#pdl-options-file-system-access');
            const showDir = pane.querySelector('#pdl-fsa-show-directory');
            const changeDirBtn = pane.querySelector('#pdl-fsa-change-directory');
            const actionInput = pane.querySelectorAll('.tags-content .tags-item input.pdl-option-conflict');
            const interactElems = [changeDirBtn, ...actionInput];
            const isUseFSA = config.get('useFileSystemAccess');
            const conflictAction = config.get('fileSystemFilenameConflictAction');
            if (isUseFSA) {
                folder.placeholder = t('text.placeholder_folder_subfolder_unused');
                folder.removeAttribute('disabled');
                folder.value = folderPattern;
            }
            enableFSA.checked = isUseFSA;
            if (!isUseFSA) {
                interactElems.forEach((el) => el.setAttribute('disabled', ''));
            }
            enableFSA.addEventListener('change', (ev) => {
                const isEnabled = ev.target.checked;
                config.set('useFileSystemAccess', isEnabled);
                if (isEnabled) {
                    folder.placeholder = t('text.placeholder_folder_subfolder_unused');
                    if (folder.hasAttribute('disabled')) {
                        folder.removeAttribute('disabled');
                        folder.value = config.get('folderPattern');
                    }
                    interactElems.forEach((el) => el.removeAttribute('disabled'));
                }
                else {
                    if (env.isViolentmonkey()) {
                        folder.placeholder = t('text.placeholder_folder_vm');
                        folder.setAttribute('disabled', '');
                        folder.value = '';
                    }
                    else if (!env.isSupportSubpath()) {
                        folder.placeholder = t('text.placeholder_folder_need_api');
                        folder.setAttribute('disabled', '');
                        folder.value = '';
                    }
                    interactElems.forEach((el) => el.setAttribute('disabled', ''));
                }
            });
            showDir.value = getCurrentDirName();
            changeDirBtn.addEventListener('click', async () => {
                await updateDirHandle();
                showDir.value = getCurrentDirName();
            });
            actionInput.forEach((input) => {
                if (conflictAction === input.value)
                    input.checked = true;
                input.addEventListener('change', (ev) => {
                    config.set('fileSystemFilenameConflictAction', ev.currentTarget.value);
                });
            });
        }
        return {
            tab,
            pane
        };
    }

    function createTabAdjustButtonPosition() {
        const style = getComputedStyle(document.documentElement);
        const tabHtml = `<div class="pdl-tab-item">${t('text.tab_title_button')}</div>`;
        const paneHtml = `
<div class="pdl-tab-pane">
  <div class="pdl-adjust-button">
    <div class="pdl-adjust-content">
      <datalist id="pdl-adjust-tickmarks">
        <option value="0"></option>
        <option value="25"></option>
        <option value="50"></option>
        <option value="75"></option>
        <option value="100"></option>
      </datalist>
      <div class="pdl-adjust-item">
        <p class="pdl-adjust-title">${t('text.title_button_preview_self_bookmark')}</p>
        <div class="pdl-adjust-select">
          <span>${t('text.label_button_horizon')}</span
          ><input
            id="pdl-btn-self-bookmark-left"
            type="range"
            max="100"
            min="0"
            step="1"
            list="pdl-adjust-tickmarks"
            value="${style.getPropertyValue('--pdl-btn-self-bookmark-left')}"
          />
        </div>
        <div class="pdl-adjust-select">
          <span>${t('text.label_button_vertical')}</span
          ><input
            id="pdl-btn-self-bookmark-top"
            type="range"
            max="100"
            min="0"
            step="1"
            list="pdl-adjust-tickmarks"
            value="${style.getPropertyValue('--pdl-btn-self-bookmark-top')}"
          />
        </div>
      </div>
      <div class="pdl-adjust-item">
        <p class="pdl-adjust-title">${t('text.title_button_preview')}</p>
        <div class="pdl-adjust-select">
          <span>${t('text.label_button_horizon')}</span
          ><input
            id="pdl-btn-left"
            type="range"
            max="100"
            min="0"
            step="1"
            list="pdl-adjust-tickmarks"
            value="${style.getPropertyValue('--pdl-btn-left')}"
          />
        </div>
        <div class="pdl-adjust-select">
          <span>${t('text.label_button_vertical')}</span
          ><input
            id="pdl-btn-top"
            type="range"
            max="100"
            min="0"
            step="1"
            list="pdl-adjust-tickmarks"
            value="${style.getPropertyValue('--pdl-btn-top')}"
          />
        </div>
      </div>
    </div>
    <div class="pdl-adjust-preview">
      <div class="pdl-spacer"></div>
      <div class="pdl-thumbnail-sample">
        <button class="pdl-btn pdl-btn-sub"></button>
        <button class="pdl-btn pdl-btn-sub self-bookmark pdl-complete"></button>
      </div>
      <div class="pdl-spacer"></div>
    </div>
  </div>
</div>`;
        const tab = stringToFragment(tabHtml);
        const pane = stringToFragment(paneHtml);
        pane.querySelectorAll('.pdl-adjust-select input[type="range"]').forEach((el) => {
            el.addEventListener('input', (ev) => {
                const el = ev.target;
                const val = el.value;
                document.documentElement.style.setProperty('--' + el.id, val);
            });
            el.addEventListener('change', (ev) => {
                const el = ev.target;
                const key = el.id;
                config.set(key, el.value);
            });
        });
        return {
            tab,
            pane
        };
    }

    function createTabHistory() {
        const tabHtml = `<div class="pdl-tab-item">${t('text.tab_title_history')}</div>`;
        const paneHtml = `
<div class="pdl-tab-pane">
  <div id="pdl-setting-history">
    <div>
      <button id="pdl-export" class="btn-history pdl-dialog-button primary">
        ${t('button.history_export')}
      </button>
    </div>
    <div>
      <input type="file" id="pdl-import" accept=".txt" style="display: none" />
      <button id="pdl-import-btn" class="btn-history pdl-dialog-button primary">
        ${t('button.history_import')}
      </button>
    </div>
    <div>
      <input type="file" id="pdl-merge" accept=".txt" style="display: none" />
      <button id="pdl-merge-btn" class="btn-history pdl-dialog-button primary">
        ${t('button.history_merge')}
      </button>
    </div>
    <div>
      <button id="pdl-clear-history" class="btn-history pdl-dialog-button primary">
        ${t('button.history_clear')}
      </button>
    </div>
  </div>
</div>`;
        const tab = stringToFragment(tabHtml);
        const pane = stringToFragment(paneHtml);
        const importFile = pane.querySelector('#pdl-import');
        importFile?.addEventListener('change', (evt) => {
            const file = evt.currentTarget.files?.[0];
            if (!file)
                return;
            pixivHistory.replace(file);
        });
        const mergeFile = pane.querySelector('#pdl-merge');
        mergeFile?.addEventListener('change', (evt) => {
            const file = evt.currentTarget.files?.[0];
            if (!file)
                return;
            pixivHistory.merge(file);
        });
        const importBtn = pane.querySelector('#pdl-import-btn');
        importBtn?.addEventListener('click', () => importFile?.click());
        const mergeBtn = pane.querySelector('#pdl-merge-btn');
        mergeBtn?.addEventListener('click', () => mergeFile?.click());
        const exportBtn = pane.querySelector('#pdl-export');
        exportBtn?.addEventListener('click', () => {
            const dlEle = document.createElement('a');
            const history = JSON.stringify(pixivHistory.getAll());
            dlEle.href = URL.createObjectURL(new Blob([history], { type: 'text/plain' }));
            dlEle.download = 'Pixiv Downloader ' + new Date().toLocaleString() + '.txt';
            dlEle.click();
            URL.revokeObjectURL(dlEle.href);
        });
        const clearBtn = pane.querySelector('#pdl-clear-history');
        clearBtn?.addEventListener('click', () => pixivHistory.clearHistory());
        return {
            tab,
            pane
        };
    }

    var css = ".pdl-popup-button{background-color:rgba(0,150,250,.5);border:none;border-radius:50%;bottom:100px;color:#fff;cursor:pointer;line-height:0;margin:0;opacity:.32;padding:12px;position:fixed;right:28px;transition:opacity .3s ease 0s;z-index:1}.pdl-popup-button:hover{opacity:1}.pdl-popup-button svg{fill:currentColor;height:24px;width:24px}";
    n(css, {});

    function showPopupBtn() {
        if (document.querySelector('.pdl-popup-button'))
            return;
        const btn = document.createElement('button');
        btn.className = 'pdl-popup-button';
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" /></svg>`;
        btn.addEventListener('click', () => {
            showSettings();
        });
        document.body.appendChild(btn);
    }
    function removePopupBtn() {
        document.querySelector('button.pdl-popup-button')?.remove();
    }

    function createTabOthers() {
        const tabHtml = `<div class="pdl-tab-item">${t('text.tab_title_others')}</div>`;
        const paneHtml = `
<div class="pdl-tab-pane">
  <div id="pdl-setting-others">
    <div>
      <label class="pdl-options">
        <input id="pdl-options-bundle-illusts" type="checkbox" class="pdl-checkbox" />
        <span>${t('text.option_bundle_illusts')}</span>
      </label>
    </div>
    <hr />
    <div>
      <label class="pdl-options">
        <input id="pdl-options-bundle-manga" type="checkbox" class="pdl-checkbox" />
        <span>${t('text.option_bundle_manga')}</span>
      </label>
    </div>
    <hr />
    <div>
      <label class="pdl-options">
        <input id="pdl-options-add-bookmark" type="checkbox" class="pdl-checkbox" />
        <span>${t('text.option_add_bookmark')}</span>
      </label>
    </div>
    <hr />
    <div>
      <label class="pdl-options sub-option">
        <input id="pdl-options-add-bookmark-tags" type="checkbox" class="pdl-checkbox" />
        <span>${t('text.option_add_bookmark_with_tags')}</span>
      </label>
    </div>
    <hr class="sub" />
    <div>
      <label class="pdl-options sub-option">
        <input id="pdl-options-add-bookmark-private-r18" type="checkbox" class="pdl-checkbox" />
        <span>${t('text.option_add_bookmark_private_r18')}</span>
      </label>
    </div>
    <hr />
    <div>
      <label class="pdl-options">
        <input id="pdl-options-show-popup-button" type="checkbox" class="pdl-checkbox" />
        <span>${t('text.option_show_popup_button')}</span>
      </label>
    </div>
  </div>
</div>`;
        const tab = stringToFragment(tabHtml);
        const pane = stringToFragment(paneHtml);
        [
            { selector: '#pdl-options-bundle-illusts', settingKey: 'bundleIllusts' },
            { selector: '#pdl-options-bundle-manga', settingKey: 'bundleManga' },
            { selector: '#pdl-options-add-bookmark', settingKey: 'addBookmark' },
            {
                selector: '#pdl-options-add-bookmark-tags',
                settingKey: 'addBookmarkWithTags'
            },
            {
                selector: '#pdl-options-add-bookmark-private-r18',
                settingKey: 'privateR18'
            },
            { selector: '#pdl-options-show-popup-button', settingKey: 'showPopupButton' }
        ].forEach(({ selector, settingKey }) => {
            const optionEl = pane.querySelector(selector);
            if (!optionEl)
                return;
            optionEl.checked = config.get(settingKey);
            optionEl.addEventListener('change', (ev) => {
                config.set(settingKey, ev.currentTarget.checked);
            });
        });
        pane.querySelector('#pdl-options-show-popup-button').addEventListener('change', (ev) => {
            if (ev.currentTarget.checked) {
                showPopupBtn();
            }
            else {
                removePopupBtn();
            }
        });
        return {
            tab,
            pane
        };
    }

    function createTabFeedback() {
        const tabHtml = `<div class="pdl-tab-item">${t('text.tab_title_feedback')}</div>`;
        const paneHtml = `
<div class="pdl-tab-pane">
  <div id="pdl-setting-donate">
    ${creditCode}
    <p>如果脚本有帮助到你，欢迎扫码请我喝杯可乐 ^_^</p>
    <p>
      <a
        target="_blank"
        style="color: #0096fa; text-decoration: underline"
        href="https://greasyfork.org/zh-CN/scripts/432150-pixiv-downloader/feedback"
        >${t('text.feedback')}</a
      >
    </p>
  </div>
</div>`;
        return {
            tab: stringToFragment(tabHtml),
            pane: stringToFragment(paneHtml)
        };
    }

    function showSettings() {
        if (document.querySelector('.pdl-modal'))
            return;
        const contentHtml = `
<div>
  <div class="pdl-tabs-nav">
    <div class="pdl-tabs__active-bar"></div>
  </div>
  <div class="pdl-tabs-content"></div>
</div>`;
        const modal = createModal({
            content: stringToFragment(contentHtml)
        });
        const tabsNav = modal.querySelector('.pdl-tabs-nav');
        const tabContent = modal.querySelector('.pdl-tabs-content');
        [
            createTabFilename(),
            createTabUgoria(),
            createTabHistory(),
            createTabAdjustButtonPosition(),
            createTabOthers(),
            createTabFeedback()
        ].forEach(({ tab, pane }) => {
            tabsNav.appendChild(tab);
            tabContent.appendChild(pane);
        });
        const panes = Array.from(tabContent.querySelectorAll('.pdl-tab-pane'));
        panes.forEach((el) => {
            el.style.setProperty('display', 'none');
        });
        const activeBar = tabsNav.querySelector('.pdl-tabs__active-bar');
        const tabs = Array.from(modal.querySelectorAll('.pdl-tabs-nav .pdl-tab-item'));
        tabs.forEach((el) => {
            el.addEventListener('click', (ev) => {
                const tab = ev.currentTarget;
                if (!tab)
                    return;
                tabs.forEach((tab) => tab.classList.remove('active'));
                tab.classList.add('active');
                activeBar.style.width = getComputedStyle(tab).width;
                activeBar.style.transform = `translateX(${tab.offsetLeft + parseFloat(getComputedStyle(tab).paddingLeft)}px)`;
                panes.forEach((pane) => pane.style.setProperty('display', 'none'));
                panes[tabs.indexOf(tab)].style.removeProperty('display');
            });
        });
        tabs[0].classList.add('active');
        panes[0].style.removeProperty('display');
        document.body.appendChild(modal);
        activeBar.style.width = getComputedStyle(tabs[0]).width;
        activeBar.style.transform = `translateX(${tabs[0].offsetLeft + parseFloat(getComputedStyle(tabs[0]).paddingLeft)}px)`;
    }

    pixivHistory.updateHistory();
    GM_registerMenuCommand(t('text.gm_menu'), showSettings, 's');
    if (config.get('showMsg')) {
        showUpgradeMsg();
        config.set('showMsg', false);
    }
    if (config.get('showPopupButton')) {
        showPopupBtn();
    }
    ['pdl-btn-self-bookmark-left', 'pdl-btn-self-bookmark-top', 'pdl-btn-left', 'pdl-btn-top'].forEach((key) => {
        let val;
        if ((val = config.get(key)) !== undefined) {
            document.documentElement.style.setProperty('--' + key, val);
        }
    });
    new MutationObserver(observerCallback).observe(document.body, {
        childList: true,
        subtree: true
    });
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'q') {
            const pdlMainBtn = document.querySelector('.pdl-btn-main');
            if (pdlMainBtn) {
                e.preventDefault();
                if (!e.repeat) {
                    pdlMainBtn.dispatchEvent(new MouseEvent('click'));
                }
            }
        }
    });

})(workerChunk, GIF, JSZip, dayjs);
