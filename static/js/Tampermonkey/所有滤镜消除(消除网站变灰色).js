// ==UserScript==
// @name         所有滤镜消除(消除网站变灰色)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  重置滤镜属性
// @author       aotmd
// @match         *://*/*
// @grant        none
// ==/UserScript==

(function () {
    function addStyle(rules) {
        var styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(styleElement);
        styleElement.appendChild(document.createTextNode(rules));
    }
    addStyle('* {filter: none!important;}');
})()
