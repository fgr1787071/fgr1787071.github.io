// ==UserScript==
// @name         去他妈的大会员彩色弹幕
// @version      3.0.0
// @description  将大会员彩色弹幕变回普通弹幕
// @author       qianxu
// @match        https://www.bilibili.com/video/*
// @match        https://www.bilibili.com/list/*
// @match        https://www.bilibili.com/bangumi/play/*
// @icon         https://www.bilibili.com/favicon.ico
// @namespace    https://greasyfork.org/scripts/467808
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

; (function () {
    'use strict'

    // 读取配置
    const blockVipDm = GM_getValue('blockVipDm') // 是否彻底屏蔽大会员彩色弹幕
    const playerProfile = localStorage.getItem('bpx_player_profile') // 播放器配置

    // 注册菜单
    GM_registerMenuCommand(`${blockVipDm ? '✅' : '☑️'} 彻底屏蔽大会员彩色弹幕`, () => {
        if (blockVipDm) {
            GM_deleteValue('blockVipDm')
        } else {
            GM_setValue('blockVipDm', true)
        }
        location.reload()
    })

    // 配置样式
    let strokeType = 0 // 描边类型，默认为重墨
    // 判断是否有播放器配置，有则读取用户设置的描边类型
    if (playerProfile) {
        strokeType = JSON.parse(playerProfile).dmSetting.fontborder
    }
    let textShadow = '' // 文本阴影
    // 根据描边类型设置文本阴影
    switch (strokeType) {
        case 1: // 描边
            textShadow = '0px 0px 1px #000000, 0 0 1px #000000, 0 0 1px #000000'
            break
        case 2: // 45° 投影
            textShadow = '1px 1px 2px #000000, 0 0 1px #000000'
            break
        default: // 重墨
            textShadow = '1px 0 1px #000000, 0 1px 1px #000000, 0 -1px 1px #000000, -1px 0 1px #000000'
    }

    // 创建样式元素
    const styleElement = document.createElement('style')

    // 判断是否彻底屏蔽大会员彩色弹幕
    if (blockVipDm) {
        /*
        配置样式元素
        bili-dm-vip: 屏蔽大会员彩色弹幕
        */
        styleElement.innerHTML = `
    .bili-dm-vip {
      display: none;
    }
    `
    } else {
        /*
        配置样式元素
        1. bili-dm: 补上大会员彩色弹幕缺失的描边
        2. bili-dm-vip: 移除大会员彩色弹幕的彩色背景图片，并继承父元素的描边
        */
        styleElement.innerHTML = `
    .bili-dm {
      --textShadow: ${textShadow};
    }

    .bili-dm-vip {
      background-image: none !important;
      text-shadow: inherit !important;
    }
    `
    }

    // 将样式元素添加到页面中
    document.body.appendChild(styleElement)
})()
