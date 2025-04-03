import { useConnect } from 'wagmi'

function LoginSelector() {
  const { connect, connectors, data: connectData } = useConnect()

  return (
    <div>
      <h2>Login Selector Demo</h2>
      <button
        onClick={() => {
          // @ts-ignore
          window.silk
            .loginSelector(window.ethereum)
            // @ts-ignore
            .then((result) => {
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
            // @ts-ignore
            .catch((err) => console.error(err))
        }}
        className='button'
      >
        Login With Selector
      </button>
    </div>
  )
}

export default LoginSelector
