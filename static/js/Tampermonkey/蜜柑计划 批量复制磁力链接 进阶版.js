// ==UserScript==
// @name         蜜柑计划(Mikan Project)复制全部磁链
// @namespace
// @version      0.1.9
// @description  复制某部番的某个字幕组的全部磁链
// @author       cookedfish
// @match        https://mikanani.me/Home/Bangumi/*
// @match        https://mikanime.tv/Home/Bangumi/*
// @grant        GM_setClipboard
// @license      MIT
// @downloadURL https://update.greasyfork.org/scripts/480141/%E8%9C%9C%E6%9F%91%E8%AE%A1%E5%88%92%28Mikan%20Project%29%E5%A4%8D%E5%88%B6%E5%85%A8%E9%83%A8%E7%A3%81%E9%93%BE.user.js
// @updateURL https://update.greasyfork.org/scripts/480141/%E8%9C%9C%E6%9F%91%E8%AE%A1%E5%88%92%28Mikan%20Project%29%E5%A4%8D%E5%88%B6%E5%85%A8%E9%83%A8%E7%A3%81%E9%93%BE.meta.js
// ==/UserScript==
function print_messageBar(max){//消息框
    var messageBar = document.createElement('div');
    messageBar.textContent = max;
    messageBar.style.position = 'fixed';
    messageBar.style.top = '0';
    messageBar.style.left = '0';
    messageBar.style.width = '100%';
    messageBar.style.backgroundColor = 'green';
    messageBar.style.color = 'white';
    messageBar.style.textAlign = 'center';
    messageBar.style.padding = '10px 0';
    document.body.appendChild(messageBar);
    setTimeout(function() {
        messageBar.parentNode.removeChild(messageBar);
    }, 1000);
}
function search(text,Value){//单词模式
    var startIndex = 0;
    while (startIndex < text.length) {//匹配关键字词
        var index = text.indexOf(Value, startIndex);
        if (index !== -1) {
            console.log('%c' + 'true','color: green',text,Value);
            return true;
        } else {
            break;
        }
    }
    console.log('%c' + 'false', 'color: red', text, Value);
    return false;
}
function multiple_match(texts, Value) {//多词模式
    var searchTerms = Value.split(' ');
    for (var i = 0; i < searchTerms.length; i++) {
        console.log(searchTerms[i]);
        if (!search(texts, searchTerms[i])) {return false;}
    }
    return true;
}
function get_xunlei(){//复制按钮
    var num = parseInt($(this).closest('div').attr('id'));
    console.log(num);
    var urls = [];
    var abc = undefined;
    var checkbox = [];
    var box = false;
    var mode = $(this).nextAll("a:first").next('a').text();
    console.log(mode);
    $('.table').find('input').each(function () {
        if($(this).attr('id') !== "myCheckbox") return true;
        if (parseInt($(this).closest('table').prev('div').attr('id')) !== num && $(this).closest('table').prev('div').attr('id') !== abc) return true;
        checkbox.push($(this).attr('effect'));
    });
    console.log(checkbox);
    for(var i = 0;i < checkbox.length;i++){
        if(checkbox[i] === 'checked'){//预检查勾选框是否有勾选
            box=true;
            break;
            console.log(i);
        }
        box=false;
    }
    console.log(box);
    if(box===false){
        $('.table').find('a').each(function () {//按条件排除
            if($(this).attr('class') !== "js-magnet magnet-link") return true;
            if (parseInt($(this).closest('table').prev('div').attr('id')) !== num && $(this).closest('table').prev('div').attr('id') !== abc) return true;
            if($(this).closest('table').prev('div').find('input').val()&&mode === '  模式切换:单词模式'&&search($(this).prev('a').text(),$(this).closest('table').prev('div').find('input').val())===false) return true;
            if($(this).closest('table').prev('div').find('input').val()&&mode === '  模式切换:多词模式'&&multiple_match($(this).prev('a').text(),$(this).closest('table').prev('div').find('input').val())===false) return true;
            if($(this).closest('table').prev('div').find('input').val()&&mode === '  模式切换:打开模式'&&multiple_match($(this).prev('a').text(),$(this).closest('table').prev('div').find('input').val())===false) return true;
            urls.push($(this).attr('data-clipboard-text'));
            $(this).prev('a').prev('input').click();
        });
    }
    else{
        $('.table').find('a').each(function () {
            if($(this).attr('class') !== "js-magnet magnet-link") return true;
            if (parseInt($(this).closest('table').prev('div').attr('id')) !== num && $(this).closest('table').prev('div').attr('id') !== abc) return true;
            if($(this).prev('a').prev('input').attr('effect') === 'uncheck') return true;
            urls.push($(this).attr('data-clipboard-text'));
        });
    };
    if(mode === '  模式切换:打开模式'){
        for(i = 0;i < urls.length;i++)
        {
            var pages = window.open(urls[i], '_blank');
            pages.close();
            if(i % 10 === 9) alert(i-8 + '-' + (i+1) + '条，共' + urls.length + '条');
        }
    }
    print_messageBar('复制了'+urls.length+'个链接');
    GM_setClipboard(urls.join('\n'));//更改剪贴板
};
function click(){//自动展开
    document.querySelectorAll('a.js-expand-episode').forEach(function(element) {
        element.click();
    });
}
function Mode(){//模式切换
    var currentMode = $(this).text().trim();
    switch (currentMode) {
        case '模式切换:多词模式':
            $(this).text('  模式切换:打开模式');
            break;
        case '模式切换:单词模式':
            $(this).text('  模式切换:多词模式');
            break;
        case '模式切换:打开模式':
            $(this).text('  模式切换:单词模式');
            break;
        default:
            break;
    };
}
function del(){//清空勾选框
    var num = parseInt($(this).closest('div').attr('id'));
    $('.table').find('input').each(function () {
        if($(this).attr('id') !== "myCheckbox") return true;
        if (parseInt($(this).closest('table').prev('div').attr('id')) !== num && $(this).closest('table').prev('div').attr('id') !== 'undefined') return true;
        if($(this).attr('effect') === 'checked') $(this).click();
        console.log($(this).attr('effect'));
    });
}
function change(){//改变勾选框
    if($(this).attr('effect') === 'uncheck') $(this).attr('effect', 'checked');
    else $(this).attr('effect', 'uncheck');
}
$(function (){
    $(document).on('click', 'a[ref="thunder"]', get_xunlei);//绑定事件
    $(document).on('click', 'a[ref="mode"]', Mode);
    $(document).on('click', 'a[ref="del"]', del);
    $(document).on('click', 'input[ref="checkbox"]', change);
    $('.subgroup-text i').closest('a').each(function() {
        var $button = $('<a class="js-magnet magnet-link" ref="mode" style="background-color:white" >  模式切换:多词模式</a>');
        var $del = $('<a class="js-magnet magnet-link" ref="del" >  [清空勾选框]</a>');
        var $input = $('<input type="text" id="magnet-input" placeholder="输入关键字词(区分大小写)">');
        var $thunder_magnet = $('<a class="js-magnet magnet-link" ref="thunder" style="background-color:white" >  [复制/打开]  </a>');
        $(this).after($thunder_magnet, $input ,$del, $button);//添加按钮
    });
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        this.addEventListener("loadend", function() {
            $('a.magnet-link-wrap').each(function() {
                if ($(this).prev().is('input')) {//避免重复添加勾选框
                    return;
                }
                var $check = $('<input type="checkbox" id="myCheckbox" ref="checkbox" effect="uncheck">');
                $(this).before($check);
            });
        });
        origOpen.apply(this, arguments);
    };
    click();
})