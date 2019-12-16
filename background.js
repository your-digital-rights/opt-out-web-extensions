// Copyright (c) 2019 Opt-out.eu. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
let domainList = [];

const whatBrowser = typeof browser !== "undefined" ? 'firefox' : 'chrome';
const ext = () => {
  if (typeof browser !== "undefined") {
    return browser;
  }

  return chrome;
}

const loadDomains = () => {
  fetch('https://api.yourdigitalrights.org/companies')
  .then((response) => {
    return response.json();
  })
  .then((companies) => {
    domainList = companies.map((company) => company.url);
  });
};

const openOptOutURL = (url) => {
  const hostname = new URL(url).hostname;
  const parsed = psl.parse(hostname);
  const newURL = `https://yourdigitalrights.org/?company=${parsed.domain}&pk_campaign=browser-extension&pk_kwd=${whatBrowser}&pk_source=${parsed.domain}`;

  chrome.tabs.create({url: newURL});
};

const setTab = (tab, tabId) => {
  const hostname = new URL(tab.url).hostname;
  const parsed = psl.parse(hostname);

  if (domainList.includes(parsed.domain)) {
    ext().browserAction.enable(tabId);
    ext().browserAction.setTitle({title: `Click to opt-out of ${parsed.domain}`, tabId});
  } else {
    ext().browserAction.disable(tabId);
    ext().browserAction.setTitle({title: "This website is not currently supported", tabId});
  }
};

const getTab = async (tabId) => {
  if (typeof browser !== "undefined") {
    const tab = await browser.tabs.get(tabId);

    setTab(tab, tabId);
  } else {
    chrome.tabs.get(tabId, (tab) => {
      setTab(tab, tabId);
    });
  }
};

const updateState = (tabId) => {
  if (tabId) {
    getTab(tabId);
  }
};

chrome.runtime.onInstalled.addListener(() => {
  loadDomains();
});

chrome.runtime.onStartup.addListener(() => {
  loadDomains();
});

chrome.tabs.onUpdated.addListener((tabId, props) => {
  updateState(tabId);
});

chrome.tabs.onActivated.addListener((tab, props) => {
  updateState(tab.tabId);
});

chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
  updateState(tabs[0].id);
});

chrome.browserAction.onClicked.addListener((activeTab) => {
  openOptOutURL(activeTab.url);
});
