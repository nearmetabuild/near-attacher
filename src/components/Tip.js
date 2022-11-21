import clsx from 'clsx'
import React, { Component, Fragment, createRef } from 'react'
import { from, Subject, merge, of, BehaviorSubject } from 'rxjs'
import { takeUntil, tap, debounceTime } from 'rxjs/operators'
import { getWalletConnection } from '../pages/Content/wallet'
import { WalletConnection } from 'near-api-js';

class Tip extends Component {

  destroy$ = new Subject()
  accountId$ = new BehaviorSubject()
  amount$ = new BehaviorSubject()
  message$ = new BehaviorSubject()

  opened$ = new BehaviorSubject(false)

  componentDidMount() {
    merge(
      this.accountId$,
      this.amount$,
      this.message$,
      this.opened$,
    ).pipe(
      debounceTime(1),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.forceUpdate()
    })

    from(getWalletConnection()).subscribe((walletConnection) => {
      const accountId = walletConnection.getAccountId()
      this.accountId$.next(accountId)
    })
  }

  componentWillUnmount() {
    this.destroy$.next(true)
  }

  render() {
    const {
      channel_id,
      channel_name,
      channel_sub_count,
      channel_img_src,
      video_id,
      video_name,
      methods,
    } = this.props

    if (!this.opened$.value) {
      return (
        <div
          className={clsx(
            "flex items-center",
            "cursor-pointer",
            "fixed right-[20px] bottom-[24px] z-[9999]",
            "h-[48px]",
            "px-[24px]",
            "rounded-[4px]",
            "shadow-[0_2px_24px_0_rgba(0,0,0,0.16)]",
            "bg-[#f44336] text-[#ffffff] border-[1px] border-#[e7e7e7]",
          )}
          onClick={async () => {
            if (!this.accountId$.value) {
              // need to signin
              const walletConnection = await getWalletConnection()
              await walletConnection.requestSignIn({
                methodNames: [],
                successUrl: window.location.href, // optional redirect URL on success
                failureUrl: window.location.href // optional redirect URL on failure
              })
              return
            }
            this.opened$.next(true)
          }}
        >
          <div className="flex items-center text-[18px]">
            Send $NEAR to
            <img
              className="w-[36px] h-[36px] ml-[4px] rounded-[50%]"
              src={channel_img_src}
            />
          </div>
        </div>
      )
    }

    return (
      <div
        className={clsx(
          "flex flex-col",
          "fixed right-[20px] bottom-[24px] z-[9999]",
          "max-h-[95vh]",
          "p-[24px]",
          "rounded-[4px]",
          "shadow-[0_2px_24px_0_rgba(0,0,0,0.16)]",
          "bg-[#fcfdff] border-[1px] border-#[e7e7e7]",
        )}
      >
        <div className="w-[352px] flex flex-col">
          {/* reciver */}
          <div className="flex items-center relative mb-[24px]">
            <img
              src={channel_img_src}
              className="w-[47px] h-[47px] rounded-[50%] mr-[17px]"
            />
            <div className="w-[240px]">
              <p className="text-[18px] text-[#030303]">{channel_name}</p>
              <p className="text-[12px] text-[#606060]">{video_name}</p>
            </div>
            <img
              onClick={() => this.opened$.next(false)}
              className="absolute top-[50%] right-[10px] -translate-y-[50%] w-[16px] h-[16px] cursor-pointer" src="http://cdn.onlinewebfonts.com/svg/img_143166.png"
            />
          </div>
          {/* name */}
          <div className="flex flex-col mb-[24px]">
            <label className="flex text-[14px] mb-[12px] text-[#030303]">Sender's NEAR Account</label>
            <input
              value={this.accountId$.value}
              readOnly
              className="bg-[#dfdfdf] cursor-not-allowed text-[14px] w-[100%] text-[#32e2f] border-[1px] border-solid border-[#dfdfdf] rounded-[5px] h-[48px] px-[16px] outline-none"
            />
          </div>
          {/* amount */}
          <div className="mb-[24px]">
            <label className="flex text-[14px] mb-[12px] text-[#030303]">Tip Amount</label>
            <div className="flex items-center relative">
              <div
                className="flex items-center text-[13px] font-bold absolute left-[10px] top-[50%] -translate-y-[50%] h-[36px] rounded-[4px] bg-[#f0f1f2] pr-[12px] pl-[4px] text-[#666263]"
              >
                <img className="bg-[#ffffff] rounded-[50%] w-[24px] h-[24px] mr-[4px]" src="https://s2.coinmarketcap.com/static/img/coins/64x64/6535.png" />
                NEAR
              </div>
              <input
                value={this.amount$.value}
                onChange={(e) => this.amount$.next(e.target.value)}
                className="pl-[96px] text-[14px] w-[100%] text-[#332e2f] border-[1px] border-solid border-[#dfdfdf] rounded-[5px] h-[48px] px-[16px] outline-none"
              />
            </div>
          </div>
          {/* message */}
          <div>
            <label className="flex text-[14px] mb-[12px] text-[#030303]">Message</label>
            <textarea
              onChange={(e) => this.message$.next(e.target.value)}
              className="w-[100%] text-[#332e2f] h-[200px] rounded-[5px] border-[1px] border-solid border-[#dfdfdf] bg-[#ffffff] py-[13px] px-[16px] text-left mb-[23px] outline-none"
            />
          </div>
          <button
            className="border-none outline-none w-[100%] h-[56px] rounded-[5px] bg-[#f44336] text-[#ffffff] text-[18px] cursor-pointer"
            onClick={async () => {
              await methods.callTip({
                channelID: channel_id,
                amount: this.amount$.value,
                message: this.message$.value,
              })
            }}
          >
            Send Tip
          </button>
        </div>
      </div>
    )
  }
}

export default Tip