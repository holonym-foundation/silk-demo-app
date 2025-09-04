import { useEffect } from 'react'

function Address({ address }: { address: string }) {
  useEffect(() => {
    if (!window.silk) return

    // Check if the silk provider has the 'on' method before using it
    if (typeof window.silk.on === 'function') {
      try {
        window.silk.on('accountsChanged', (accounts: string[]) => {
          console.log('accountsChanged', accounts[0])
        })
      } catch (error) {
        console.warn('Failed to set up accountsChanged listener:', error)
      }
    } else {
      console.warn('Silk provider does not have event listener support')
    }
  }, [])

  return (
    <div className='flex flex-col gap-2 w-full h-fit'>
      <h2>Human Address</h2>
      <p>{address}</p>
    </div>
  )
}

export default Address
