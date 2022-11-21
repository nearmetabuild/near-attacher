import { connect, keyStores, WalletConnection, transactions, Near, utils, ConnectedWalletAccount, KeyPair } from 'near-api-js'
import { BN } from 'bn.js'

// const connectionConfig = {
//   networkId: "mainnet",
//   keyStore: new keyStores.BrowserLocalStorageKeyStore(),
//   nodeUrl: "https://rpc.mainnet.near.org",
//   walletUrl: "https://wallet.mainnet.near.org",
//   helperUrl: "https://helper.mainnet.near.org",
//   explorerUrl: "https://explorer.mainnet.near.org",
// };

const _keystore = new keyStores.BrowserLocalStorageKeyStore()

console.log(_keystore, '_keystore')

const connectionConfig = {
  networkId: "testnet",
  keyStore: _keystore,
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
  explorerUrl: "https://explorer.testnet.near.org",
};

const APP_KEY_PREFIX = "ATTACHER:"

export const getWalletConnection = async () => {
  const nearConnection = await connect(connectionConfig)

  const walletConnection = new WalletConnection(nearConnection, APP_KEY_PREFIX)

  return walletConnection
}

export const callTip = async ({
  channelID = "",
  amount = "0",
  message = "",
}) => {
  const nearConnection = await connect(connectionConfig)

  const walletConnection = new WalletConnection(nearConnection, APP_KEY_PREFIX)

  if (!walletConnection.isSignedIn()) {
    await walletConnection.requestSignIn({
      methodNames: [],
      successUrl: window.location.href, // optional redirect URL on success
      failureUrl: window.location.href // optional redirect URL on failure
    })
    return
  }

  await walletConnection.account().functionCall({
    contractId: "attacher.testnet",
    methodName: "tip",
    args: {
      channelID,
      message,
    },
    gas: new BN(50000000000000),
    attachedDeposit: utils.format.parseNearAmount(amount),
  })
}

export const methods = {
  callTip,
}