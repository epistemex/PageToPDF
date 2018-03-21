
"use strict";

window.injected = true;

function insertBox(useArticle, title, url) {
  let
    parent = !!useArticle ? document.querySelector("article") || document.body : document.body,
    box = window.__box = document.createElement("div"),
    br = document.createElement("br"),
    a = document.createElement("a");

  box.textContent = title;
  box.style.cssText = "display:box; width:auto; position:fixed: left:0; top:0; padding:7px; background:#fff; border:1px dashed #999; color:#000;" +
                      "font:bold 14px serif; z-index:99999";

  a.style.cssText = "color:#000;font:12px sans-serif";
  a.href = a.textContent = url;

  box.appendChild(br);
  box.appendChild(a);
  parent.insertBefore(box, parent.firstChild);
}

function removeBox() {
  if (window.__box) document.body.removeChild(window.__box);
  window.__box = null;
}