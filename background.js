// Copyright (c) 2019 YourDigitalRights.org. All rights reserved.
// Use of this source code is governed by a GPLv3-style license that can be
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
  if (domainList.includes(parsed.domain)) {
    const hostname = new URL(url).hostname;
    const parsed = psl.parse(hostname);
    const newURL = `https://yourdigitalrights.org/d/${parsed.domain}/?pk_campaign=browser-extension&pk_kwd=${whatBrowser}&pk_source=${parsed.domain}`;
  } else {
    const newURL = `https://yourdigitalrights.org/d/add/`
  }
  chrome.tabs.create({url: newURL});
};

const setTab = (tab, tabId) => {
  const hostname = new URL(tab.url).hostname;
  const parsed = psl.parse(hostname);

  if (domainList.includes(parsed.domain)) {
    ext().browserAction.setTitle({title: `Click to send ${parsed.domain} a data Access or Deletion request`, tabId});
  } else {
    ext().browserAction.setTitle({title: "This website is not on our list, click to send a custom request", tabId});
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
