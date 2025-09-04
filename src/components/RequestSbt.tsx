import { useState } from 'react';

export default function RequestSbt() {
  const [kycSbtRecipient, setKycSbtRecipient] = useState('')
  const [phoneSbtRecipient, setPhoneSbtRecipient] = useState('')

  const handleRequestSBT = async (type: 'kyc' | 'phone') => {
    if (!window.silk) {
      console.error('Silk wallet not available')
      return
    }

    const silkProvider = window.silk as any
    if (typeof silkProvider.requestSBT === 'function') {
      try {
        const result = await silkProvider.requestSBT(type)
        const resultString = String(result || '')
        
        if (type === 'kyc') {
          setKycSbtRecipient(resultString)
        } else {
          setPhoneSbtRecipient(resultString)
        }
      } catch (err) {
        console.error('Failed to request SBT:', err)
      }
    } else {
      console.warn('requestSBT method not available on Silk provider')
    }
  }

  return (
    <div>
      <h2>Request SBT Demo</h2>
      <button
        onClick={() => handleRequestSBT('kyc')}
        className="button"
      >
        Request KYC SBT
      </button>
      <p>SBT recipient: {kycSbtRecipient}</p>

      <button
        onClick={() => handleRequestSBT('phone')}
        className="button"
      >
        Request Phone SBT
      </button>
      <p>SBT recipient: {phoneSbtRecipient}</p>
    </div>
  );
}
