import { ethers } from 'ethers'
import { getAddress } from 'ethers/utils'

let provider
let signer
let readOnly = false

export async function setupWeb3({ customProvider }) {
  if (provider) {
    return { provider, signer }
  }

  if (customProvider) {
    //for testing
    provider = new ethers.providers.Web3Provider(customProvider)
    return { provider, signer }
  }

  if (window && window.ethereum) {
    provider = new providers.Web3Provider(window.ethereum)
    const id = (await provider.getNetwork()).chainId
    signer = provider.getSigner()
    const networkProvider = getNetworkProviderUrl(id)
    // web3Read = new Web3(
    //   networkProvider === 'private' ? window.ethereum : networkProvider
    // )
    return { provider, signer }
  } else if (window.web3 && window.web3.currentProvider) {
    provider = new providers.Web3Provider(window.web3.currentProvider)
    const id = (await provider.getNetwork()).chainId
    signer = provider.getSigner()
    const networkProvider = getNetworkProviderUrl(id)
    return { provider, signer }
  } else {
    try {
      const url = 'http://localhost:8545'
      await fetch(url)
      console.log('local node active')
      provider = new ethers.providers.JsonRpcProvider(url)
    } catch (error) {
      if (
        error.readyState === 4 &&
        (error.status === 400 || error.status === 200)
      ) {
        // the endpoint is active
        console.log('Success')
      } else {
        console.log(
          'No web3 instance injected. Falling back to cloud provider.'
        )
        readOnly = true
        provider = new ethers.providers.JsonRpcProvider(
          getNetworkProviderUrl('1')
        )
        return { provider, signer }
      }
    }
  }
}

export async function getWeb3() {
  if (!provider) {
    throw new Error(
      'Ethers has not been instantiated, please call setupWeb3() first'
    )
  }
  return provider
}

export async function getWeb3Read() {
  if (!provider) {
    throw new Error(
      'Ethers has not been instantiated, please call setupWeb3() first'
    )
  }
  return provider
}

export function isReadOnly() {
  return readOnly
}

function getNetworkProviderUrl(id) {
  switch (id) {
    case '1':
      return `https://mainnet.infura.io/v3/90f210707d3c450f847659dc9a3436ea`
    case '3':
      return `https://ropsten.infura.io/v3/90f210707d3c450f847659dc9a3436ea`
    case '4':
      return `https://rinkeby.infura.io/v3/90f210707d3c450f847659dc9a3436ea`
    case '5':
      return `https://goerli.infura.io/v3/90f210707d3c450f847659dc9a3436ea`
    default:
      return 'private'
  }
}

export async function getSigner() {
  const provider = await getWeb3()
  return provider.getSigner()
}

export async function getAccount() {
  const signer = await getSigner()
  return signer.getAddress()
}

export async function getAccounts() {
  try {
    const accounts = [signer.getAddress()]

    if (accounts.length > 0) {
      return accounts
    } else if (window.ethereum) {
      try {
        const accounts = await window.ethereum.enable()
        return accounts
      } catch (error) {
        console.warn('Did not allow app to access dapp browser')
        throw error
      }
    } else {
      return []
    }
  } catch (_) {
    return []
  }
}

export async function getNetworkId() {
  const provider = await getWeb3()
  return provider.getNetwork()
}

export async function getBlock() {
  const provider = await getWeb3()
  const block = await provider.getBlockNumber()
  const blockDetails = await provider.getBlock(block)
  return {
    number: blockDetails.number,
    timestamp: blockDetails.timestamp
  }
}
