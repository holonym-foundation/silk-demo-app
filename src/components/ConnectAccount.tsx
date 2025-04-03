import { useAccount, useConnect, useDisconnect } from 'wagmi'

function ConnectAccount() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, data: connectData } = useConnect()
  const { disconnect } = useDisconnect()
  return (
    <div>
      <h2>Connect Account Demo (external wallet)</h2>
      <button
        onClick={() => {
          // @ts-ignore
          if (window.ethereum?.isSilk) {
            connect({
              connector: connectors.filter((conn) => conn.id === 'injected')[0]
            })
          } else {
            // Maybe change this. Using WC connector here is just for testing.
            connect({
              connector: connectors.filter(
                (conn) => conn.id === 'walletConnect'
              )[0]
            })
          }
        }}
        className='button'
      >
        Connect
      </button>
      <p style={{ textDecoration: 'underline' }}>Account:</p>
      <p>{address}</p>
      <button onClick={() => disconnect()} className='button'>
        Disconnect
      </button>
    </div>
  )
}

export default ConnectAccount
