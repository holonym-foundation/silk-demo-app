import { useConnect } from 'wagmi'

function LoginSelector() {
  const { connect, connectors, data: connectData } = useConnect()

  return (
    <div>
      <h2>Login Selector Demo</h2>
      <button
        onClick={() => {
          if (!window.silk) {
            console.error('Silk wallet not available')
            return
          }

          // Check if loginSelector method exists on the provider
          const silkProvider = window.silk as any
          if (typeof silkProvider.loginSelector === 'function') {
            silkProvider
              .loginSelector(window.ethereum)
              .then((result: string) => {
                if (result === 'silk') {
                  // @ts-ignore
                  window.ethereum = window.silk
                } else if (result === 'injected') {
                  connect({
                    connector: connectors.filter(
                      (conn) => conn.id === 'injected'
                    )[0]
                  })
                } else if (result === 'walletconnect') {
                  console.log('connectors', connectors)
                  connect({
                    connector: connectors.filter(
                      (conn) => conn.id === 'walletConnect'
                    )[0]
                  })
                }
              })
              .catch((err: Error) => console.error(err))
          } else {
            console.warn('loginSelector method not available on Silk provider')
            // Fallback to direct Silk login
            if (typeof silkProvider.login === 'function') {
              silkProvider.login().catch((err: Error) => console.error(err))
            }
          }
        }}
        className='button'
      >
        Login With Selector
      </button>
    </div>
  )
}

export default LoginSelector
