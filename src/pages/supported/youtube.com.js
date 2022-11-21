import React, { Component, createRef } from 'react'
import ReactDOM from 'react-dom'

import BigNumber from 'bignumber.js'
const uuidv4 = require('uuid/v4')

import '../../assets/styles/tailwind.css'

import Tip from '../../components/Tip'
import { methods } from '../Content/wallet'

export const drawTip = (pageManager, {
  video_id,
  channel_id,
  // channel_name,
  // channel_sub_count,
  // channel_img_src,
  // video_name,
}) => {

  const $html = document.querySelector('html')
  const $container = document.querySelector('#secondary')
  // const $container = document.querySelector('.ytd-video-secondary-info-renderer #top-row')
  // const $subscribeButton = document.querySelector('.ytd-video-secondary-info-renderer #top-row #subscribe-button')

  const $channelInfo = document.querySelector('.ytd-video-secondary-info-renderer #top-row .ytd-channel-name a')

  const $channelImg = document.querySelector('#owner img')
  const $subcount = document.querySelector('#owner-sub-count')

  const $cln = document.createElement('div')

  $cln.id = 'fromAttacher'
  $cln.className += ' fromAttacher'

  const channel_name = $channelInfo.innerText
  const channel_sub_count = $subcount.innerText
  const channel_img_src = $channelImg.src
  const $videoName = document.querySelector('.ytd-video-primary-info-renderer h1')
  const video_name = $videoName.innerText

  // $html.append($cln)
  $container.append($cln)
  // opacityAnimation($cln, { from: 0.5, to: 1 }).start()

  ReactDOM.render(
    <Tip
      key={video_id}
      methods={methods}
      pageManager={pageManager}
      channel_id={channel_id}
      channel_name={channel_name}
      channel_sub_count={channel_sub_count}
      channel_img_src={channel_img_src}
      video_id={video_id}
      video_name={video_name}
    />,
    document.getElementById('fromAttacher')
  )
}