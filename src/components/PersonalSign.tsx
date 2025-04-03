import { useSignMessage } from 'wagmi'

function PersonalSign() {
  const { data: signature, signMessage } = useSignMessage()

  return (
    <div>
      <h2>Signature Demo (personal_sign)</h2>
      <button
        onClick={() => signMessage({ message: 'Hello, World' })}
        className='button'
      >
        Sign "Hello, World"
      </button>
      <p>
        Signature: {signature ? signature.substring(0, 50) + '...' : '<null>'}
      </p>
    </div>
  )
}

export default PersonalSign
