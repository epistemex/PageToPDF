/*
	Page To PDF
	Options handler

	Copyright (c) 2017 K3N / Epistemex
	www.epistemex.com
*/

"use strict";

const
  getEl = document.getElementById.bind(document),

  optPaper = getEl("optPaper"),
  optWidth = getEl("optWidth"),	  	// v.0.4.0
  optHeight = getEl("optHeight"),		// v.0.4.0
  optUnit = getEl("optUnit"),		  	// v.0.4.0

  optLandscape = getEl("optLandscape"),
  optBackground = getEl("optBackground"),

  optShrink = getEl("optShrink"),
  optScale = getEl("optScale"),
  optScaleValue = getEl("optScaleValue"),

  optMargins = getEl("optMargins"),
  optMarginsValue = getEl("optMarginsValue"),

  optShowTitle = getEl("optShowTitle"),
  optShowURL = getEl("optShowURL"),
  optShowPageNo = getEl("optShowPageNo"),

  optInsertMeta = getEl("optInsertMeta"), // v.1.2.0
  optAutoReadmode = getEl("optAutoReadmode"); // v.1.1.0

/*----------------------------------------------------------------------

	Current tab status

----------------------------------------------------------------------*/
let
  currentTab,
  wasReadmodeChecked = false,
  wasReadmode = false;

/*----------------------------------------------------------------------

	Setup handlers

----------------------------------------------------------------------*/

// v.0.4.0
optPaper.onchange = updatePaper;
optWidth.onchange = optHeight.onchange = updatePaperSize;

optScale.oninput = updateScale;
optMargins.oninput = updateMargins;
document.onclick = handleClick;

/*----------------------------------------------------------------------

	Callbacks

----------------------------------------------------------------------*/

function handleClick(e) {

	if (e.target.id === "print") {
    browser.tabs.query({active: true}).then(tabs => {
      if (!tabs.length) return;

      currentTab = tabs[0];

      if (optAutoReadmode.checked) _enterReadmode(currentTab);
      else _print(currentTab);
    })
	}
	else if (e.target.localName !== "html") {
		updateScale();	// -> saveOptions() as shrink option affect scale slider
	}

	function _enterReadmode(tab) {

    wasReadmodeChecked = true;
    wasReadmode = tab.isInReaderMode;

    if (tab.isArticle && !tab.isInReaderMode) {
      browser.tabs.toggleReaderMode().then(_print, _print);
    }
    else _print();
  }

  function _print() {
    let
      paper = optPaper.value,
      orientation = optLandscape.checked ? 1 : 0,
      background = optBackground.checked,
      shrink = optShrink.checked,
      scale = optScale.value / 100,
      margins = +optMargins.value,
      showTitle = optShowTitle.checked,
      showURL = optShowURL.checked,
      showPageNo = optShowPageNo.checked,

      width = 8.5, height = 11, unit = 0,

      insertMeta = optInsertMeta.checked;

    // Set Paper Size (def. US Letter)
    if (paper === "a4") {
      unit = 1;	// mm
      width = 210;
      height = 297;
    }
    else if (paper === "custom") {
      unit = optUnit.value === "inch" ? 0 : 1;
      width = parseNum(optWidth.value, 8.5);
      height = parseNum(optHeight.value, 11);
    }

    // send options to BG so we can utilize notification
    browser.runtime.sendMessage({
        "paperWidth"          : width,
        "paperHeight"         : height,
        "paperSizeUnit"       : unit,
        "orientation"         : orientation,
        "showBackgroundImages": background,
        "showBackgroundColors": background,
        "shrinkToFit"         : shrink,
        "scaling"             : scale,
        "marginTop"           : margins,
        "marginRight"         : margins,
        "marginBottom"        : margins,
        "marginLeft"          : margins,
        "headerLeft"          : showTitle ? "&T" : "",	// &T
        "headerCenter"        : "",
        "headerRight"         : "",					          	// &U
        "footerLeft"          : showURL ? "&U" : "",	  // &PT
        "footerCenter"        : "",
        "footerRight"         : showPageNo ? "&PT" : "",// &D
        "extended"            : {
          "wasInReadmode"     : wasReadmode,
          "wasReadmodeChecked": wasReadmodeChecked,
          "insertMeta"        : insertMeta,
          "title"             : currentTab.title,
          "url"               : currentTab.url
        }
      })
      .then(null, onError);
  }
}

// v.0.4.0
function parseNum(s, def) {
	let v;
	s = s.replace(",", ".").trim();
	v = parseFloat(s);
	if (isNaN(v)) v = def;
	if (v < 1 || v >= 99999) v = def;
	return v
}

// v.0.4.0
function updatePaper() {
	optWidth.disabled = optHeight.disabled = optUnit.disabled = (optPaper.value !== "custom");
	saveOptions();
}

// v.0.4.0
function updatePaperSize() {
	optWidth.value = parseNum(optWidth.value, 8.5);
	optHeight.value = parseNum(optHeight.value, 11);
	saveOptions();
}

function updateScale() {
	optScaleValue.textContent = optScale.value;
	optScale.disabled = optShrink.checked;

	saveOptions();
}

function updateMargins() {
	let v = +optMargins.value;

	// if margins=0, ignore deco. settings
	optMarginsValue.textContent = v.toFixed(2);
	optShowTitle.disabled = !v;
	optShowURL.disabled = !v;
	optShowPageNo.disabled = !v;

	saveOptions();
}

function saveOptions() {
	browser.storage.local.set({
		options: {
			paper       : optPaper.value,
			width       : parseNum(optWidth.value, 11), 	// v.0.4.0
			height      : parseNum(optHeight.value, 8.5),	// v.0.4.0
			unit        : optUnit.value,			        		// v.0.4.0
			landscape   : optLandscape.checked,
			background  : optBackground.checked,
			shrink      : optShrink.checked,
			scale       : +optScale.value,
			margins     : +optMargins.value,
			showTitle   : optShowTitle.checked,
			showPageNo  : optShowPageNo.checked,
			showURL     : optShowURL.checked,
      autoReadmode: optAutoReadmode.checked,        // v.1.1.0
      insertMeta  : optInsertMeta.checked           // v.1.2.0
		}
	})
	.then(null, onError);
}

function loadOptions() {
	browser.storage.local.get({

		// defaults
		options: {
			paper       : "letter",
			width       : "8.5",		// v.0.4.0
			height      : "11",	  	// v.0.4.0
			unit        : "inch",		// v.0.4.0
			landscape   : false,
			background  : true,
			shrink      : true,
			scale       : 100,
			margins     : 0.5,
			showTitle   : false,
			showURL     : false,
			showPageNo  : true,
      autoReadmode: false,    // v.1.1.0
      insertMeta  : false     // v.1.2.0
		}
	})
	.then(items => {

		const options = items.options;
		if (options) {
			optPaper.value = options.paper;
			optWidth.value = options.width || "8.5";	        // v.0.4.0
			optHeight.value = options.height || "11";	        // v.0.4.0
			optUnit.value = options.unit || "inch";		        // v.0.4.0
			optLandscape.checked = options.landscape;
			optBackground.checked = options.background;
			optShrink.checked = options.shrink;
			optScale.value = options.scale;
			optMargins.value = options.margins;
			optShowTitle.checked = options.showTitle;
			optShowPageNo.checked = options.showPageNo;
			optShowURL.checked = options.showURL;
			optAutoReadmode.checked = options.autoReadmode;   // v.1.1.0
			optInsertMeta.checked = options.insertMeta;       // v.1.2.0

			updateMargins();
			updateScale();
			updatePaper();
		}
	}, onError);
}

function onError(err) {
	//console.log("Error: ", err)
}

/*----------------------------------------------------------------------

	Init

----------------------------------------------------------------------*/

window.onload = loadOptions;
