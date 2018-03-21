/*
	Page To PDF
	Background handler

	Copyright (c) 2017 K3N / Epistemex
	www.epistemex.com
*/

"use strict";

const _id = "page-to-pdf";
let _useArticle, _title, _url;

function msgHandler(msg) { // , sender, sendResponse
  // handle reader mode
  let
    extended = msg.extended,
    wasInReadmode = extended.wasInReadmode,
    wasReadmodeChecked = extended.wasReadmodeChecked,
    insertMeta = extended.insertMeta,
    title = extended.title,
    url= extended.url;

  // remove as we'll merge settings with call options
  delete msg.extended;

  // insert title/url box
  if (insertMeta && !wasReadmodeChecked) {
    _useArticle = wasReadmodeChecked;
    _title = title;
    _url = url;
    injectScripts(["insert_box.js"], _print)
  }
  else _print();

  function _print() {
    // set animated icon
    browser.browserAction.setIcon({path: "gfx/pdf_anim32.png"});

    browser.tabs.saveAsPDF(msg).then(status => {
      switch(status.toLowerCase()) {
        case "saved":
        case "replaced":
          notify(browser.i18n.getMessage("pageSavedOK"));
          break;
        case "cancelled":
          break;
        default:
          notify(browser.i18n.getMessage("pageSaveError"));
      }
      //sendResponse({response: status});

      browser.browserAction.setIcon({path: "gfx/pdf_16.png"});

      if (insertMeta) {
        browser.tabs.executeScript({code: "removeBox()"})
      }

      if (wasReadmodeChecked && !wasInReadmode) {
        browser.tabs.toggleReaderMode().then(null, onError);
      }
    }, onError);
  }
}

/** @param {string} msg */
function notify(msg) {

	clear();

	browser.notifications.create(_id, {
		"type": "basic",
		"title": "Page To PDF",
		"message": msg,
		"iconUrl": "gfx/pdf_32.png"
	})
	.then(null, onError);

	// clear notification automatically
	setTimeout(clear, 3500);

	function clear() {
		browser.notifications.getAll()
			.then(function(all) {
				if (_id in all) browser.notifications.clear(_id);
			}, onError)
	}
}

function onError(err) {
  notify("An error occurred: " + err)
	//console.log("Error: " + err)
}

//function injectCSS(callback) {
//  let css = `body:before {content: '${clean(_title)} - ${_url}'; padding:7px; background:#fff;color:#000;border:1px dashed #999;
//             font:bold 14px serif;position:fixed;left:0;top:0;z-index:99999}`;
//  browser.tabs.insertCSS({code: css, cssOrigin: "user"}).then(callback, onError);
//}
//
//function clean(txt) {
//  txt = txt.replace(/'/gm, "\"");
//  txt = txt.replace(/</gm, "&lt;");
//  txt = txt.replace(/>/gm, "&gt;");
//  return txt
//}

function injectScripts(list, callback) {
  let
    script = {code: `insertBox(${_useArticle},'${clean(_title)}','${_url}')`},
    tabs = browser.tabs;

  tabs.executeScript({code: "window.injected"}).then(check => {
    if (check[0]) tabs.executeScript(script).then(callback);
    else {
      let i = 0;
      (function next(url) {
        tabs.executeScript({file: url}).then(() => {
          if (i < list.length) next(list[i++]);
          else tabs.executeScript(script).then(callback);
        })
      })(list[i++])
    }
  });

  function clean(txt) {
    txt = txt.replace(/'/gm, "\"");
    txt = txt.replace(/</gm, "&lt;");
    txt = txt.replace(/>/gm, "&gt;");
    return txt
  }
}

browser.runtime.onMessage.addListener(msgHandler);