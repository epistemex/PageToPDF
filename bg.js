/*
	Page To PDF
	Background handler

	Copyright (c) 2017 K3N / Epistemex
	www.epistemex.com
*/

"use strict";

var _id = "page-to-pdf";

function msgHandler(msg) { // , sender, sendResponse
	browser.tabs.saveAsPDF(msg)
		.then(function(status) {

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

		}, onError);

}

/** @param {string} msg */
function notify(msg) {

	clear();

	browser.notifications.create(_id, {
		"type": "basic",
		"title": "Page To PDF",
		"message": msg,
		"iconUrl": browser.extension.getURL("gfx/pdf_48.png")
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
	console.log("Error: " + err)
}

browser.runtime.onMessage.addListener(msgHandler);