// Copyright (c) 2018 Opt-out.eu. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
var domainList = new Set();
var selectedId = -1;

function loadDomains(){
  domainList = new Set();
  $.getJSON('https://api.opt-out.eu/companies', function(data) {
    $.each( data, function(key, company) {
      domainList.add(company.url);
    });
  });
};

function updateState(){
  var tab = chrome.tabs.get(selectedId, function(tab){
    var hostname = new URL(tab.url).hostname;
    var parsed = psl.parse(hostname);
    if (domainList.has(parsed.domain)) {
      chrome.browserAction.setIcon({path: "icon-16.png"});
      chrome.browserAction.enable(selectedId);
      chrome.browserAction.setTitle({title: "Click to opt-out of " + parsed.domain, tabId: selectedId});
    } else {
      chrome.browserAction.setIcon({path: "icon-16.png"});
      chrome.browserAction.disable(selectedId);
      chrome.browserAction.setTitle({title: "This website is not currently supported", tabId: selectedId});
    }
})};

function openOptOutURL(url){
  var hostname = new URL(url).hostname;
  var parsed = psl.parse(hostname);
  var newURL = "https://opt-out.eu/?company=" + parsed.domain + "&pk_campaign=chrome-extension&pk_source=" + parsed.domain;
  chrome.tabs.create({ url: newURL });
};

chrome.runtime.onInstalled.addListener(function() {
  loadDomains();
});

chrome.runtime.onStartup.addListener(function(){ 
  loadDomains();
});

chrome.tabs.onUpdated.addListener(function(tabId, props) {
  if (props.status == "complete" && tabId == selectedId){
    updateState();
  }
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

