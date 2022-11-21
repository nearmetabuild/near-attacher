import { debounceTime, delay, Subject, timer } from 'rxjs'
import { tap } from 'rxjs/operators'
import { drawTip } from '../supported/youtube.com';
import { printLine } from './modules/print';
import { callDonate, callTip, methods } from './wallet'

import '../../assets/styles/tailwind.css'

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine("Using the 'printLine' function from the Print Module");

const APP_KEY_PREFIX = "ATTACHER:"
const LOCAL_STORAGE_KEY_SUFFIX = '_wallet_auth_key'

const pageManager = chrome.runtime.connect({ name: 'pageManager' })

const detect$ = new Subject()

detect$.pipe(
  tap(() => {
    console.log('detecting...')
  }),
  debounceTime(300),
  delay(1000), // 1s delay to load channel entire info
).subscribe(async () => {
  await detect()
})

const detect = async () => {

  console.log(window.location, '@window.location')

  switch (window.location.host) {
    case "www.youtube.com":
      return await detectYoutubeChannel()
  }
}

const detectYoutubeChannel = async () => {
  const channelElem = document.querySelector('.yt-simple-endpoint.style-scope.ytd-video-owner-renderer')
  if (!channelElem) {
    console.log('---')
    return
  }
  const channelHref = channelElem.href
  const splitted = channelHref.split('/')
  const channelID = splitted[splitted.length - 1]

  const url = new URL(window.location.href)
  const video_id = url.searchParams.get('v')

  const cbMethod = url.searchParams.get('cbMethodName')

  console.log(channelHref, 'channelHref')
  console.log(channelID, 'channelID')

  drawTip(pageManager, {
    video_id,
    channel_id: channelID,
    methods,
    cbMethod,
  })

  // await callTip()
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

  // console.log(message, 'message')
  // console.log(sender, 'sender')
  // console.log(sendResponse, 'sendResponse')

  if (message.type === 'pageChange') {

    if (message.pageURL) {
      const url = new URL(message.pageURL)
      const accountId = url.searchParams.get("account_id")
      const allKeys = url.searchParams.get("all_keys")

      if (accountId && allKeys) {
        window.localStorage.setItem(APP_KEY_PREFIX + LOCAL_STORAGE_KEY_SUFFIX, JSON.stringify({
          accountId,
          allKeys,
        }))
      }
    }

    detect$.next(true)
    console.log('PAGECHANGE!')
  }

  return true
})