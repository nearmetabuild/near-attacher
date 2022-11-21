console.log('This is the background page.');
console.log('Put the background scripts here.');

const ENABLED_PAGES = [
  "youtube.com"
]

// Page change detect
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

  console.log(tabId, 'tabId')
  console.log(changeInfo, 'changeInfo')
  console.log(tab, 'tab')

  if (changeInfo.status == 'complete' && tab.active) {
    const pageURL = tab && tab.url

    // user/lps should be called in specific pages.
    const pageType = ENABLED_PAGES.find((p) => pageURL.indexOf(p) !== -1)

    if (!pageType) return

    chrome.tabs.sendMessage(tabId, {
      type: 'pageChange',
      pageType,
      pageURL,
      tabId,
    })
  }
})