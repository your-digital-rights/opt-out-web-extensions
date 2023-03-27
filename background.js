// Copyright (c) 2019 YourDigitalRights.org. All rights reserved.
// Use of this source code is governed by a GPLv3-style license that can be
// found in the LICENSE file.
try {
  importScripts('psl.min.js');
} catch (e) {
  console.error(e);
}

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

chrome.action.onClicked.addListener((activeTab) => {
  openOptOutURL(activeTab.url);
});

const whatBrowser = typeof browser !== "undefined" ? 'firefox' : 'chrome';
const ext = () => {
  if (typeof browser !== "undefined") {
    return browser;
  }

  return chrome;
}

const loadDomains = () => {
  fetch('https://api.yourdigitalrights.org/domains')
  .then((response) => {
    return response.json();
  })
  .then((responnce) => {
    var domainList = responnce['Domains'].map((domain) => domain.url);
    chrome.storage.local.set({ domainList });
  });
};

const openOptOutURL = async (url) => {
  console.log(psl);
  const hostname = new URL(url).hostname;
  const parsed = psl.parse(hostname);
  const { domainList } = await chrome.storage.local.get(["domainList"]);
  if (domainList.includes(parsed.domain)) {
    const newURL = `https://yourdigitalrights.org/d/${parsed.domain}?pk_campaign=browser-extension&pk_kwd=${whatBrowser}&pk_source=${parsed.domain}`;
    chrome.tabs.create({url: newURL});
  }
};

const setTab = async (tab, tabId) => {
  try {
    const hostname = new URL(tab.url).hostname;
    const parsed = psl.parse(hostname);
    const { domainList } = await chrome.storage.local.get(["domainList"]);
    if (domainList.includes(parsed.domain)) {
      ext().action.setTitle({title: `Click to send ${parsed.domain} a data Access or Deletion request`, tabId});
    } else {
      ext().action.setTitle({title: "This website is not on our list, click to send a custom request", tabId});
      chrome.action.setPopup({tabId, popup: 'popup.html'})
    }
  } catch (e) {
    console.log(e)
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
