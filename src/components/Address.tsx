import { useEffect } from 'react'

function Address({ address }: { address: string }) {
  useEffect(() => {
    if (!window.silk) return

    window.silk.on('accountsChanged', (accounts: string[]) => {
      console.log('accountsChanged', accounts[0])
    })
  }, [window.silk])

  return (
    <div className='flex flex-col gap-2 w-full h-fit'>
      <h2>Human Address</h2>
      <p>{address}</p>
    </div>
  )
}

export default Address
