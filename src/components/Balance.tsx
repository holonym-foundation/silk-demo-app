import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";

function Balance() {
  const { address, isConnected } = useAccount();

  const result = useBalance({
    address,
  })

  const formatted = result.data?.value ? formatUnits(result.data?.value, result.data?.decimals) : undefined;

  return (
    <div>
      <h2>Balance Demo</h2>
      {isConnected ? (
        <p>Balance: {formatted ?? '<null>'}</p>
      ) : (
        <p>Connect to view balance</p>
      )}
    </div>
  );
}

export default Balance;
