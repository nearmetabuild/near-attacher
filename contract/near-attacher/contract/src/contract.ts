// Find all our documentation at https://docs.near.org
import { NearBindgen, near, call, view, LookupMap, NearPromise, initialize } from 'near-sdk-js';
import { attachedDeposit, currentAccountId, predecessorAccountId } from 'near-sdk-js/lib/api';
import { AccountId } from 'near-sdk-js/lib/types';

type TipArgument = {
  channelID: string,
  message: string,
}

@NearBindgen({})
class NearAttacher {
  admin = ""
  channelIDToAccount = new LookupMap<AccountId>('channelIDToAccount')
  temporaryBank = new LookupMap<bigint>('temporaryBank')
  totalReceived = new LookupMap<bigint>('totalReceived')

  @initialize({})
  init() {
    this.admin = predecessorAccountId()
  }

  @call({ payableFunction: true })
  tip({ channelID, message }: TipArgument) {
    const account = this.channelIDToAccount.get(channelID)
    const amount = attachedDeposit()
    const sender = predecessorAccountId()

    if (!account) {
      // save amount to temporary wallet
      near.log(this.temporaryBank.get(channelID))
      const tempAccum = this.temporaryBank.get(channelID) || BigInt(0)
      this.temporaryBank.set(channelID, tempAccum + amount)

      logTransfer(sender, amount.toString(), channelID)
      return
    }

    // transfer amount to channel integrated near account
    return NearPromise.new(account)
      .transfer(amount)
      .then(
        NearPromise.new(currentAccountId()).functionCall(
          "cb_tip",
          JSON.stringify({ message, sender: predecessorAccountId(), amount: amount.toString(), channelID }),
          BigInt(0),
          BigInt(30000000000000)
        )
      )
  }

  @call({})
  integrateChannelIdToAccount({ channelID, account }) {
    this.onlyAdmin()

    const integratedAccount = this.channelIDToAccount.get(channelID)
    if (integratedAccount) {
      // nothing to integrate
      near.log(`channel:${channelID} already integrated with the account:${integratedAccount}`)
      return
    }

    // onlyOwner
    this.channelIDToAccount.set(channelID, account)

    // redeem temporary balance
    const temporaryBalance = this.temporaryBank.get(channelID) || BigInt(0)
    this.temporaryBank.set(channelID, BigInt(0))

    return NearPromise.new(account)
      .transfer(temporaryBalance)
      .then(
        NearPromise.new(currentAccountId()).functionCall(
          "cb_integrateChannelIdToAccount",
          JSON.stringify({ channelID, account, amount: temporaryBalance.toString() }),
          BigInt(0),
          BigInt(30000000000000)
        )
      )
  }

  // callback
  @call({})
  cb_tip({ message, sender, amount, channelID }) {
    let { result, success } = promiseResult()
    if (success) {
      // save total received tip
      this.totalReceived.set(channelID, this.totalReceived.get(channelID) + amount)

      // log
      logTransfer(sender, amount.toString(), channelID)
    } else {

      // rollback tipped amount to sender
      return NearPromise.new(sender)
        .transfer(amount)
    }
  }

  @call({})
  cb_integrateChannelIdToAccount({ channelID, account, amount }) {
    let { result, success } = promiseResult()
    if (success) {
      near.log(`channel:${channelID} has been integrated with the near account:${account}`)
    } else {
      // rollback
      near.log(`integration failed`)
      this.temporaryBank.set(channelID, amount)
      this.channelIDToAccount.remove(channelID)
    }
  }

  @view({})
  viewAdmin() {
    return this.admin
  }

  @view({})
  viewChannelIDToAccount({ channelID }) {
    return this.channelIDToAccount.get(channelID)
  }

  @view({})
  viewTemporaryBalance({ channelID }) {
    return this.temporaryBank.get(channelID)
  }

  @view({})
  viewTotalReceived({ channelID }) {
    return this.totalReceived.get(channelID)
  }

  // modifier
  onlyAdmin() {
    near.log(this.admin.toLowerCase())
    near.log(predecessorAccountId().toLowerCase())
    if (this.admin.toLowerCase() !== predecessorAccountId().toLowerCase()) {
      throw Error;
    }
  }
}

function logTransfer(sender: string, amount: string, channelID: string) {
  near.log(`${sender} transferred ${amount} yoctoNEAR to channel:${channelID}`)
}

function promiseResult(): { result: string, success: boolean } {
  let result, success;

  try { result = near.promiseResult(0); success = true }
  catch { result = undefined; success = false }

  return { result, success }
}