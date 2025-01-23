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

function EthSignTypedData() {
  const { data: signature, signTypedData } = useSignTypedData();

  return (
    <div>
      <h2>Signature Demo (eth_signTypedData_v4)</h2>
      <button
        onClick={() =>
          signTypedData({
            domain,
            types,
            primaryType: "Mail",
            message,
          })
        }
        className="button"
      >
        Sign typed data
      </button>
      <p>
        Signature: {signature ? signature.substring(0, 50) + "..." : "<null>"}
      </p>
    </div>
  );
}

export default EthSignTypedData;
