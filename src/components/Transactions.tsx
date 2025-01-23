import { parseEther } from "viem";
import { useAccount, useEstimateGas, useSendTransaction } from "wagmi";

function Transactions() {
  const { chain } = useAccount();

  const { data: txConfigLowRiskTransferGasEstimation } = useEstimateGas({
    to: "0xdbd6b2c02338919EdAa192F5b60F5e5840A50079",
    value: parseEther("0.00001"),
    // maxPriorityFeePerGas: '0xb6a2768c',
    // maxFeePerGas: '0xe7d05e00'
  });
  const {
    data: lowRiskTransferData,
    isSuccess: lowRiskTransferIsSuccess,
    error: lowRiskTransferError,
    sendTransaction: sendTransactionLowRiskTransfer,
  } = useSendTransaction();

  const { data: txConfigHighRiskCallGasEstimation } = useEstimateGas({
    to: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    data: "0xa9059cbb000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000000de0b6b3a7640000",
    value: 0n,
  });
  const {
    data: highRiskCallData,
    isSuccess: highRiskCallIsSuccess,
    error: highRiskCallError,
    sendTransaction: sendTransactionHighRiskCall,
  } = useSendTransaction();

  return (
    <>
      <div>
        <h2>Send Transaction (low-risk transfer)</h2>
        <button
          onClick={() => {
            if (!sendTransactionLowRiskTransfer) {
              console.error("sendTransactionLowRiskTransfer is not defined");
            }
            sendTransactionLowRiskTransfer?.({
              gas: txConfigLowRiskTransferGasEstimation,
              to: "0xdbd6b2c02338919EdAa192F5b60F5e5840A50079",
              value: parseEther("0.00001"),
            });
          }}
          className="button"
        >
          Send 0.00001 of {`${chain?.name ?? "this chain"}\'s native token`} to
          0xdbd6b2c02338919EdAa192F5b60F5e5840A50079
        </button>
        <p>Transaction hash: {lowRiskTransferData}</p>
        <p>Transaction error: {lowRiskTransferError?.message}</p>
      </div>

      {/* <div>
        <h2>Send Transaction (high-risk contract call)</h2>
        <button
          onClick={() => {
            if (!sendTransactionHighRiskCall) {
              console.error('sendTransactionHighRiskCall is not defined')
            }
            sendTransactionHighRiskCall?.({
              gas: txConfigHighRiskCallGasEstimation,
              to: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
              data: "0xa9059cbb000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000000de0b6b3a7640000",
              value: 0n,
            })
          }}
          className="button"
        >
          Call contract
        </button>
        <p>Transaction hash: {highRiskCallData?.hash?.toString()}</p>
        <p>Transaction error: {highRiskCallError?.message}</p>
      </div> */}
    </>
  );
}

export default Transactions;
