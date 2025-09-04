import { useEffect } from 'react'

function Login({ setAddress }: { setAddress: (address: string) => void }) {
  useEffect(() => {
    if (!window.silk) return

    // Only try to auto-login if the silk provider is fully ready
    try {
      window.silk.login().then((result) => {
        console.log('logged in')
        window.silk
          .request({
            method: 'eth_requestAccounts'
          })
          .then((accounts: any) => {
            setAddress(accounts[0])
          })
      }).catch((error) => {
        console.log('Auto-login failed, user needs to manually login:', error)
      })
    } catch (error) {
      console.log('Silk provider not ready for auto-login:', error)
    }

    // Set up event listener with error handling
    if (typeof window.silk.on === 'function') {
      try {
        window.silk.on('accountsChanged', (accounts: string[]) => {
          setAddress(accounts[0])
        })
      } catch (error) {
        console.warn('Failed to set up accountsChanged listener in Login:', error)
      }
    }
  }, [])

  return (
    <div>
      <h2>Login Demo</h2>
      <button
        onClick={() => {
          // @ts-ignore
          window.silk
            .login()
            // @ts-ignore
            .then((result) => {
              // @ts-ignore
              window.ethereum = window.silk

              window.silk
                .request({
                  method: 'eth_requestAccounts'
                })
                .then((accounts: any) => {
                  setAddress(accounts[0])
                })
            })
            // @ts-ignore
            .catch((err) => console.error(err))
        }}
        className='button'
      >
        Login
      </button>
    </div>
  )
}

export default Login
