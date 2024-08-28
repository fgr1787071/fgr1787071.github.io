// ==UserScript==
// @name         115pan_aria2
// @namespace    115pan_aria2
// @version      1.1.7
// @author       f
// @description  115文件导出到 Aria2
// @icon         https://115.com/web_icon.jpg
// @match        *://115.com/?ct=file*
// @connect      115.com
// @connect      192.168.50.44
// @connect      *
// @grant        GM.xmlHttpRequest
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        unsafeWindow
// @grant        GM_addValueChangeListener
// @grant        GM_removeValueChangeListener
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    function skipAd() {
        var skipButton = document.querySelector('.ytp-ad-text.ytp-ad-skip-button-text');
        if (skipButton) {
            skipButton.click();
            console.log("Click button");
        }
    }

    // 设置检测时间间隔
    var timer = setInterval(skipAd, 1000); // 1000毫秒 = 1秒
})();





