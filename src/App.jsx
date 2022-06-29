import { useState } from 'react'
import { useMount, useUpdateEffect } from 'react-use'
import { ethers } from 'ethers'
import genericErc20Abi from './erc20abi.json'

function App() {
  const [connected, setConnected] = useState(false)
  const [symbol, setSymbol] = useState(null)
  const [balance, setBalance] = useState(0)

  let _ethers = null
  const tokenContractAddress = '0xb009A8E550fC5ae9D2A94De7b53Fa0C1dB82C456'

  const connect = async () => {
    if (!window.ethereum) {
      window.alert("You don't have MetaMask installed on your browser!")
      return false
    }

    _ethers = new ethers.providers.Web3Provider(window.ethereum)
    await _ethers.send("eth_requestAccounts", [])
    setConnected(true)
    subscribe()
    initContract()
  }

  const subscribe = () => {
    const provider = _ethers.provider

    provider.on('accountsChanged', (accounts) => {
      console.log(accounts)
    })

    provider.on('chainChanged', () => {
      console.log('chain changed')
      window.location.reload()
    })

    provider.on('disconnect', (code, reason) => {
      console.log(code, reason)
      disconnect()
    })
  }

  const initContract = async () => {
    const signer = _ethers.getSigner()
    const address = await signer.getAddress()
    const contract = new ethers.Contract(tokenContractAddress, genericErc20Abi, signer)

    // Get token symbol
    const _symbol = await contract.symbol()
    setSymbol(_symbol)

    // Get decimals
    const _decimals = await contract.decimals()

    // Get balance of address
    const _balance = await contract.balanceOf(address)
    setBalance(ethers.utils.formatUnits(_balance, _decimals))
  }

  const disconnect = () => {
    _ethers = null
    setConnected(false)
  }

  // Get local storage values
  useMount(() => {
    const data = window.localStorage.getItem('REACT_TEST_APP')
    if (data !== null) {
      setConnected(JSON.parse(data))
      connect()
    }
  })

  // Update local storage values
  useUpdateEffect(() => {
    window.localStorage.setItem('REACT_TEST_APP', JSON.stringify(connected))
  }, [connected])

  return (
    <>
      {
        connected ? (
          <div>Balance: { balance } { symbol }</div>
        ) : (
          <button type='button' onClick={() => { connect() }}>Connect Wallet</button>
        )
      }
    </>
  )
}

export default App
