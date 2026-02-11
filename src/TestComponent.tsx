import Login from './components/Login'
import LoginSelector from './components/LoginSelector'
import ConnectAccount from './components/ConnectAccount'
import SwitchChains from './components/SwitchChains'
import GetCurrentNetwork from './components/GetCurrentNetwork'
import Balance from './components/Balance'
import PersonalSign from './components/PersonalSign'
import EthSignTypedData from './components/EthSignTypedData'
import Transactions from './components/Transactions'
import TransactionsSdk from './components/TransactionsSdk'
import RequestEmail from './components/RequestEmail'
import RequestSbt from './components/RequestSbt'
import EthSignTypedDataSdk from './components/EthSignTypedDataSdk'
import Whitelabel from './components/Whitelabel'
import Safe from './components/Safe'
import Logout from './components/Logout'
import AddCustomNetwork from './components/AddCustomNetwork'
import RequestPermissionToken from './components/RequestPermissionToken'
import { useEffect, useState } from 'react'
import Address from './components/Address'

function TestComponent() {
  const [address, setAddress] = useState('')
  const [showBetaFeatures, setShowBetaFeatures] = useState(false)

  useEffect(() => {
    if (!window.silk) return
    window.silk
      .request({
        method: 'eth_requestAccounts'
      })
      .then((accounts: any) => {
        setAddress(accounts[0])
      })
  }, [])

  return (
    <div>
      <Login setAddress={setAddress} />
      <LoginSelector />
      <Logout />
      <Address address={address} />

      {/* Will try to send to Human Wallet */}
      <div className='separator' />
      <TransactionsSdk />

      <div className='separator' />
      <RequestPermissionToken />

      {/* Will try to send to connected (external) wallet */}
      <div className='separator' />
      <h2 className='text-xl font-bold mb-4'>
        Will try to send to connected (external) wallet
      </h2>
      <PersonalSign />

      <ConnectAccount />
      <SwitchChains />
      <GetCurrentNetwork />
      <Balance />
      <PersonalSign />
      <EthSignTypedDataSdk />
      <EthSignTypedData />
      <Transactions />

      <RequestEmail />
      <RequestSbt />

      {/* Beta Features Section */}
      <div className='separator' />
      <div>
        <h2 className='text-xl font-bold mb-4'>Beta Features</h2>
        <button
          onClick={() => setShowBetaFeatures(!showBetaFeatures)}
          className="button"
        >
          {showBetaFeatures ? 'Hide' : 'Show'} Beta Features
        </button>
        
        {showBetaFeatures && (
          <div className="mt-4">
            <AddCustomNetwork />
          </div>
        )}
      </div>
    </div>
  )
}

export default TestComponent
