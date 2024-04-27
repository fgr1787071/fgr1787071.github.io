// ==UserScript==
// @name         mikananiBgmScore
// @namespace    https://github.com/kjtsune/UserScripts
// @version      0.4
// @description  Mikan 蜜柑计划首页显示 Bangumi 评分及跳转链接。
// @author       kjtsune
// @match        https://mikanani.me/
// @match        https://mikanime.tv/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mikanani.me
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @license MIT
// @downloadURL https://update.greasyfork.org/scripts/458298/mikananiBgmScore.user.js
// @updateURL https://update.greasyfork.org/scripts/458298/mikananiBgmScore.meta.js
// ==/UserScript==
'use strict';

let config = { logLevel: 2, minScore: 0 };

let logger = {
    error: function (...args) {
        if (config.logLevel >= 1) {
            console.log('%cerror', 'color: yellow; font-style: italic; background-color: blue;', ...args);
        }
    },
    info: function (...args) {
        if (config.logLevel >= 2) {
            console.log('%cinfo', 'color: yellow; font-style: italic; background-color: blue;', ...args);
        }
    },
    debug: function (...args) {
        if (config.logLevel >= 3) {
            console.log('%cdebug', 'color: yellow; font-style: italic; background-color: blue;', ...args);
        }
    },
}

function createElementFromHTML(htmlString) {
    let div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstElementChild;
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getJSON(url) {
    try {
        const response = await fetch(url);
        logger.info(`fetch ${url}`)
        if (response.status >= 200 && response.status < 400)
            return await response.json();
        console.error(`Error fetching ${url}:`, response.status, response.statusText, await response.text());
    }
    catch (e) {
        console.error(`Error fetching ${url}:`, e);
    }
}

async function getBgmJson(bgmId) {
    let url = `https://api.bgm.tv/v0/subjects/${bgmId}`
    return await getJSON(url)
}

async function getParsedBgmInfo(bgmId, stringify = false) {
    let bgmJson = await getBgmJson(bgmId);
    let score = (bgmJson) ? bgmJson.rating.score : 0.1;
    let summary = (bgmJson) ? bgmJson.summary : "maybe 18x";
    let res = { score: score, summary: summary }
    res = (stringify) ? JSON.stringify(res) : res;
    return res
}

function queryAllForArray(seletor, elementArray) {
    let result = [];
    for (const element of elementArray) {
        let res = element.querySelectorAll(seletor);
        if (!res) logger.error("queryAllForArray not result", seletor, element);
        result.push(...res);
    }
    return result
}

function multiTimesSeletor(storage = null, seletorAll = false, ...cssSeletor) {
    const seletor = cssSeletor[0]
    const restSeletor = cssSeletor.slice(1)
    if (!seletor) return storage;

    if (seletorAll) {
        storage = storage || [document]
        let res = queryAllForArray(seletor, storage);
        if (res) storage = res;
        storage && logger.debug('storage', storage.length, seletor, restSeletor);
        if (!restSeletor) {
            return storage;
        } else {
            return multiTimesSeletor(storage, true, ...restSeletor);
        }
    } else {
        storage = storage || document;
        const lastRes = storage;
        storage = storage.querySelector(seletor);
        storage && logger.debug('storage', storage, seletor);
        if (!storage) logger.error("not result", seletor, lastRes);
        if (!restSeletor) {
            return storage;
        } else {
            return multiTimesSeletor(storage, false, ...restSeletor);
        }
    }
}

async function myFetch(url, selector = null, selectAll = false) {
    let response = await fetch(url);
    let text = await response.text();
    const parser = new DOMParser();
    const htmlDocument = parser.parseFromString(text, "text/html");
    const element = htmlDocument.documentElement;
    if (!selector) return element;
    if (selectAll) {
        return element.querySelectorAll(selector);
    } else {
        return element.querySelector(selector);
    }
}

async function getBgmId(mikanUrl) {
    let selector = "p.bangumi-info > a[href*='tv/subject']";
    let bgm = await myFetch(mikanUrl, selector);
    if (bgm) bgm = bgm.href.split("/").slice(-1)[0];
    return bgm
}

class MyStorage {
    constructor(prefix, splitStr = '|', expireDay = 0, useGM = false) {
        this.prefix = prefix;
        this.splitStr = splitStr;
        this.expireMs = expireDay * 864E5;
        this._getItem = (useGM) ? GM_getValue : localStorage.getItem.bind(localStorage);
        this._setItem = (useGM) ? GM_setValue : localStorage.setItem.bind(localStorage);
        this._removeItem = (useGM) ? GM_deleteValue : localStorage.removeItem.bind(localStorage);
    }

    _keyGenerator(key) {
        return `${this.prefix}${this.splitStr}${key}`
    }

    get(key, defalut = null) {
        key = this._keyGenerator(key);
        let res = this._getItem(key);
        if (this.expireMs && res) {
            res = JSON.parse(this._getItem(key)).value;
        }
        res = res || defalut;
        return res
    }

    set(key, value) {
        key = this._keyGenerator(key);
        if (this.expireMs) {
            value = JSON.stringify({ timestamp: Date.now(), value: value })
        }
        this._setItem(key, value)
    }

    del(key) {
        key = this._keyGenerator(key);
        try {
            this._removeItem(key);
        } catch (error) {
            // pass
        }
    }

    checkIsExpire(key) {
        key = this._keyGenerator(key);
        let exists = this.useGM ? (this._getItem(key) !== undefined) : (key in localStorage)
        if (!exists) return true;
        if (!this.expireMs && exists) { return false };
        let timestamp = JSON.parse(this._getItem(key)).timestamp;
        if (!timestamp) throw `checkIsExpire not work , not timestamp, key: ${key}`;
        if (timestamp + this.expireMs < Date.now()) {
            logger.info(key, "IsExpire, old", timestamp, "now", Date.now());
            return true;
        } else {
            return false;
        }
    }
}

async function addScoreSummaryToHtml(mikanElementList) {
    let bgmIco = `<img style="width:16px;" src="data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAQAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALJu+f//////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAsm75ELJu+cCybvn/sm75/7Ju+f+ybvn//////7Ju+f+ybvn/sm75/7Ju+f+ybvn/sm75/7Ju+f+ybvnAsm75ELJu+cCybvn/sm75/7Ju+f+ybvn/sm75////////////sm75/7Ju+f+ybvn/sm75/7Ju+f+ybvn/sm75/7Ju+cCwaPn/sGj5/9iz/P///////////////////////////////////////////////////////////9iz/P+waPn/rF/6/6xf+v//////////////////////////////////////////////////////////////////////rF/6/6lW+/+pVvv/////////////////////////////////zXn2/////////////////////////////////6lW+/+lTfz/pU38///////Nefb/zXn2/8159v//////zXn2///////Nefb//////8159v/Nefb/zXn2//////+lTfz/okT8/6JE/P//////////////////////2bb8/8159v/Nefb/zXn2/9m2/P//////////////////////okT8/546/f+eOv3//////8159v/Nefb/zXn2////////////////////////////zXn2/8159v/Nefb//////546/f+bMf7/mzH+//////////////////////////////////////////////////////////////////////+bMf7/lyj+wJco/v/Mk/7////////////////////////////////////////////////////////////Mk///lyj+wJQf/xCUH//AlB///5Qf//+UH///lB///5Qf//+aP///mj///5o///+UH///lB///5Qf//+UH///lB//wJQf/xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAzXn2/5o////Nefb/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAzXn2/wAAAAAAAAAAAAAAAM159v8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAzXn2/wAAAAAAAAAAAAAAAAAAAAAAAAAAzXn2/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAzXn2/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADNefb/AAAAAAAAAAAAAAAA+f8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/j8AAP3fAAD77wAA9/cAAA==">`
    for (const element of mikanElementList) {
        let scoreElement = element.nextElementSibling;
        if (scoreElement) continue;
        let mikanUrl = element.href;
        let mikanId = mikanUrl.split('/').slice(-1)[0];
        let bgmId = mikanBgmStorage.get(mikanId);
        let bgmInfo = bgmInfoStorage.get(bgmId);
        if (!bgmId || !bgmInfo) continue;
        let bgmUrl = `https://bgm.tv/subject/${bgmId}`
        let score = bgmInfo.score;
        let summary = bgmInfo.summary;
        let title = element.textContent;
        let pathName = element.pathname;
        let bgmHtml = `<a href="${bgmUrl}" target="_blank" title="${summary}" id="bgmScore">${bgmIco} ${score}</a>`
        element.insertAdjacentHTML("afterend", bgmHtml);

        let minScore = config.minScore;
        let lowScore = (score <= minScore && score > 0.1 && minScore > 0.1) ? true : false;
        let mobileFatherElement = document.querySelectorAll(`a[href="${pathName}"`)[1];
        if (lowScore) {
            logger.info('delete', title, score, minScore);
            element.parentElement.parentElement.parentElement.remove();
        }
        if (!mobileFatherElement) continue;
        mobileFatherElement = mobileFatherElement.parentElement;
        let mobileElement = mobileFatherElement.querySelector('div');
        if (!mobileElement) continue;
        let mobileHtml = `<a href="${bgmUrl}" target="_blank" title="${summary}" id="bgmScore">${title} ${score}</a>`
        let newMobileElement = createElementFromHTML(mobileHtml);
        mobileElement.replaceWith(newMobileElement);
        // mobileFatherElement.replaceChild(newMobileElement, mobileElement);
        if (lowScore) {
            logger.info('delete', title, score, minScore);
            newMobileElement.parentElement.parentElement.remove();
        }
    }
}

let mikanBgmStorage = new MyStorage("mikan");
let bgmInfoStorage = new MyStorage("bgm", undefined, 7);

async function storeMikanBgm(mikanElementList, storeBgmInfo = false) {
    let count = 0;

    async function checkBgmInfoExist(mkId) {
        let bgmId = mikanBgmStorage.get(mkId);
        if (!bgmId) return;
        if (bgmInfoStorage.checkIsExpire(bgmId)) {
            bgmInfoStorage.set(bgmId, await getParsedBgmInfo(bgmId));
            count++;
        }
    }

    for (const element of mikanElementList) {
        let mikanUrl = element.href;
        let mikanId = mikanUrl.split('/').slice(-1)[0];
        let bgmId = mikanBgmStorage.get(mikanId)
        if (!bgmId) {
            bgmId = await getBgmId(mikanUrl);
            logger.info("fetch mikan", mikanId);
            mikanBgmStorage.set(mikanId, bgmId);
            logger.info(`set ${mikanId} to ${bgmId}`);
            await sleep(1000);
            count++;
        }
        if (storeBgmInfo) await checkBgmInfoExist(mikanId);
        await addScoreSummaryToHtml([element]);
    }
    count && logger.info('fetch count', count);
}

function backupMikanBgm() {
    let result = {};
    for ( let key in localStorage) {
        if (key.indexOf('mikan|') != -1) {
            result[key] = localStorage.getItem(key);
        }
    }
    if (result) {
        result = JSON.stringify(result);
        console.log(result);
    }
}

function restoreMikanBgm(text) {
    let data = JSON.parse(text);
    for (let key in data) {
        if (key.indexOf('mikan|') != -1) {
            localStorage.setItem(key, data[key])
        }
    }
}

function countMikanBgm() {
    let count = 0;
    for ( let key in localStorage) {
        if (key.indexOf('mikan|') != -1) {
            count++;
        }
    }
    console.log('mikan bgm count: ', count)
}

async function main() {
    let animeList = multiTimesSeletor(null, true, "div.sk-bangumi", "a[href^='/Home/Bangumi']");
    // animeList = animeList.slice(0, 50);
    await storeMikanBgm(animeList, true);
    await addScoreSummaryToHtml(animeList);
    logger.info(animeList)

}

(function loop() {
    setTimeout(async function () {
        let start = Date.now()
        await main();
        let usedSec = (Date.now() - start) / 1000;
        if (usedSec > 0.01) logger.info(`used time ${usedSec}`);
        loop();
    }, 2000);
})();
