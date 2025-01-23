// @ts-nocheck

import { useSignTypedData } from "wagmi";

// All properties on a domain are optional
const domain = {
  name: "Ether Mail",
  version: "1",
  chainId: 1,
  verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
} as const;

// The named list of all type definitions
const types = {
  Person: [
    { name: "name", type: "string" },
    { name: "wallet", type: "address" },
  ],
  Mail: [
    { name: "from", type: "Person" },
    { name: "to", type: "Person" },
    { name: "contents", type: "string" },
  ],
} as const;

const message = {
  from: {
    name: "Cow",
    wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
  },
  to: {
    name: "Bob",
    wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
  },
  contents: "Hello, Bob!",
} as const;

function EthSignTypedDataSdk() {
  //   const { data: signature, signTypedData } = useSignTypedData({
  //     domain,
  //     types,
  //     value: message
  //   })

  const typedDataExample = {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
        { name: "salt", type: "bytes32" },
      ],
    },
    domain: {
      name: "Example DApp",
      version: "1.0",
      chainId: 1,
      verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
      salt: "0x123456789abcdef123456789abcdef123456789abcdef123456789abcdef1234",
    },
    primaryType: "Person",
    message: {
      person: {
        name: "John Doe",
        wallet: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
      },
      action: "Sign this message",
    },
  };

  return (
    <div>
      <h2>SDK Signature Demo</h2>
      <button
        onClick={async () => {
          const account = await window.silk.request({
            method: "eth_requestAccounts",
          });

          const signature = await window.silk.request({
            method: "eth_signTypedData_v4",
            params: [account[0], JSON.stringify(typedDataExample)],
          });
        }}
        className="button"
      >
        Sign typed data
      </button>
      <p>
        {/* Signature: {signature ? signature.substring(0, 50) + '...' : '<null>'} */}
      </p>
    </div>
  );
}

export default EthSignTypedDataSdk;
