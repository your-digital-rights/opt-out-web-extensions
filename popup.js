document.addEventListener('DOMContentLoaded', function() {
  var checkPageButton = document.getElementById('sendRequest');
  checkPageButton.addEventListener('click', function() {
    const URL = `https://yourdigitalrights.org/d/add/`
    chrome.tabs.create({url: URL});
  }, false);
}, false);