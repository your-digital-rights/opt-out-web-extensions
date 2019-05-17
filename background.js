// Copyright (c) 2018 Opt-out.eu. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var domainList = new Set();
var selectedId = -1;

function loadDomains(){
  domainList = new Set();
  $.getJSON('https://opt-out-api.now.sh/companies', function(data) {
    $.each( data, function(key, company) {
      domainList.add(company.url);
    });
  });
};

var xhr = new XMLHttpRequest();
xhr.onload = function() {
    var json = xhr.responseText;
    json = JSON.parse(json);
};

function openOptOutURL(url){
  var hostname = new URL(url).hostname;
  var parsed = psl.parse(hostname);
  var newURL = "https://opt-out.eu/?company=" + parsed.domain;
  chrome.tabs.create({ url: newURL });
};

function updateState(){
  var tab = chrome.tabs.get(selectedId, function(tab){
    var hostname = new URL(tab.url).hostname;
    var parsed = psl.parse(hostname);
    if (domainList.has(parsed.domain)) {
      chrome.browserAction.enable(selectedId);
    } else {
      chrome.browserAction.disable(selectedId);
    }
})};

chrome.runtime.onInstalled.addListener(function() {
  loadDomains();
});

chrome.runtime.onStartup.addListener(function(){ 
  loadDomains();
});

chrome.tabs.onUpdated.addListener(function(tabId, props) {
  if (props.status == "complete" && tabId == selectedId)
    updateState();
});

chrome.tabs.onSelectionChanged.addListener(function(tabId, props) {
  selectedId = tabId;
  updateState();
});

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  selectedId = tabs[0].id;
  updateState();
});

chrome.browserAction.onClicked.addListener(function(activeTab){ 
  openOptOutURL(activeTab.url);
});

