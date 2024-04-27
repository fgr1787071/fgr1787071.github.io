// ==UserScript==
// @name         修复 minecraft.net 页面无法滚动
// @version      0.1
// @description  修复 minecraft.net 某些情况下页面无法滚动问题
// @author       瓜瓜
// @match        https://www.minecraft.net/*
// @icon         https://www.minecraft.net/etc.clientlibs/minecraft/clientlibs/main/resources/apple-icon-60x60.png
// @grant        none
// ==/UserScript==

(function () {
    jQuery("body").removeClass("modal-open");
})();
