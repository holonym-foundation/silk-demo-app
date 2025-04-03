import { useState } from 'react';

export default function RequestSbt() {
  const [kycSbtRecipient, setKycSbtRecipient] = useState('')
  const [phoneSbtRecipient, setPhoneSbtRecipient] = useState('')

  return (
    <div>
      <h2>Request SBT Demo</h2>
      <button
        onClick={() =>  {
        // @ts-ignore
        window.silk.requestSBT('kyc')
          // @ts-ignore
          .then((result) => {
            setKycSbtRecipient(result)
          })
          // @ts-ignore
          .catch((err) => console.error(err))
        }}
        className="button"
      >
        Request KYC SBT
      </button>
      <p>SBT recipient: {kycSbtRecipient}</p>

      <button
        onClick={() =>  {
        // @ts-ignore
        window.silk.requestSBT('phone')
          // @ts-ignore
          .then((result) => {
            setPhoneSbtRecipient(result)
          })
          // @ts-ignore
          .catch((err) => console.error(err))
        }}
        className="button"
      >
        Request Phone SBT
      </button>
      <p>SBT recipient: {phoneSbtRecipient}</p>
    </div>
  );
}
