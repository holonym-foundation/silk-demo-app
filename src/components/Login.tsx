import { useEffect } from 'react'

function Login({ setAddress }: { setAddress: (address: string) => void }) {
  useEffect(() => {
    if (!window.silk) return

    window.silk.login().then((result) => {
      console.log('logged in')
      window.silk
        .request({
          method: 'eth_requestAccounts'
        })
        .then((accounts: any) => {
          setAddress(accounts[0])
        })
    })

    window.silk.on('accountsChanged', (accounts: string[]) => {
      setAddress(accounts[0])
    })
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
