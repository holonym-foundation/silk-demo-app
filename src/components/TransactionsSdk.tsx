import { useState } from 'react'
import { parseEther, toHex } from 'viem'
import { useAccount } from 'wagmi'
import { JSON_RPC_METHOD } from '@human.tech/waap-interface-core'
import { SilkEthereumProviderInterface } from '@human.tech/waap-sdk'

// Add TypeScript declaration for window.silk
declare global {
  interface Window {
    silk: SilkEthereumProviderInterface
  }
}

function TransactionsSdk() {
  const { chain } = useAccount()
  const [txHash, setTxHash] = useState<string | null>(null)
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Transaction Types
  const LEGACY_TX = {
    to: '0xb604ceBC7668fFBa72Ab1fdAC9d38B2f8ad083d1',
    value: toHex(parseEther('0.00002'))
  }

  const CONTRACT_CALL_TX = {
    to: '0xB9Ec1bd7aD64E6f84BE7bF763c9774f4dd512517',
    data: '0x4fc4e5b10000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000002c84a29c731e19fde3e1800000000000000000000000075c7840ebea171b466189d297fab5c1921890d44'
  }

  const EIP1559_TX = {
    to: '0xdbd6b2c02338919EdAa192F5b60F5e5840A50079',
    value: toHex(parseEther('0.00000000000')),
    maxFeePerGas: '0x1000000000', // 68.7 gwei
    maxPriorityFeePerGas: '0x100000000' // 4.3 gwei
  }

  // Personal Sign example
  const personalSignMessage =
    'Hello World from Silk SDK Hello World from Silk SDK Hello World from Silk SDKHello World from Silk SDK Hello World from Silk SDK Hello World from Silk SDK Hello World from Silk SDK Hello World from Silk SDK Hello World from Silk SDK!'

  // Typed Data example
  const typedDataExample = {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
      ],
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' },
        { name: 'age', type: 'uint256' },
        { name: 'email', type: 'string' },
        { name: 'isActive', type: 'bool' },
        { name: 'balance', type: 'uint256' },
        { name: 'createdAt', type: 'uint256' },
        { name: 'updatedAt', type: 'uint256' },
        { name: 'isVerified', type: 'bool' },
        { name: 'isBanned', type: 'bool' },
        { name: 'isDeleted', type: 'bool' },
        { name: 'isFrozen', type: 'bool' },
        { name: 'isLocked', type: 'bool' },
        { name: 'isSuspended', type: 'bool' },
        { name: 'isVerified', type: 'bool' }
      ]
    },
    domain: {
      name: 'Silk Test DApp',
      version: '1.0',
      chainId: 1,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
    },
    primaryType: 'Person',
    message: {
      name: 'John Doe',
      wallet: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      age: 25,
      email: 'john.doe@example.com',
      isActive: true,
      balance: 1000,
      createdAt: 1717171717,
      updatedAt: 1717171717,
      isVerified: true,
      isBanned: false,
      isDeleted: false,
      isFrozen: false,
      isLocked: false,
      isSuspended: false
    }
  }

  const sendContractCall = async () => {
    resetState()

    await window.silk.request({
      method: JSON_RPC_METHOD.wallet_switchEthereumChain,
      params: [
        {
          chainId: '0xAA36A7'
        }
      ]
    })

    const chain = await window.silk.request({
      method: JSON_RPC_METHOD.eth_chainId
    })

    console.log('chain', chain)

    try {
      const accounts = (await window.silk.request({
        method: JSON_RPC_METHOD.eth_requestAccounts
      })) as string[]

      // Estimate gas for the transaction
      const estimatedGas = await window.silk.request({
        method: JSON_RPC_METHOD.eth_estimateGas,
        params: [
          {
            from: accounts[0],
            ...CONTRACT_CALL_TX
          }
        ]
      })

      // Set gas limit with some buffer (1.5x the estimated amount)
      const gasLimit =
        typeof estimatedGas === 'string'
          ? toHex(Math.floor(parseInt(estimatedGas, 16) * 1.5))
          : '0x100000' // Fallback to a high value if estimation fails

      const txHash = await window.silk.request({
        method: JSON_RPC_METHOD.eth_sendTransaction,
        params: [
          {
            from: accounts[0],
            ...CONTRACT_CALL_TX,
            gas: gasLimit
          }
        ]
      })

      console.log('txHash', txHash)

      setTxHash(txHash as string)
    } catch (error) {
      handleError(error)
    }
  }
  // Reset state on each action
  const resetState = () => {
    setTxHash(null)
    setSignatureData(null)
    setError(null)
  }

  // Handler for potential errors in requests
  const handleError = (error: any) => {
    console.error('Error:', error)
    setError(error?.message || 'Unknown error occurred')
  }

  // const chain = await window.silk.request({
  //   method: JSON_RPC_METHOD.wallet_switchEthereumChain,
  //   params: [
  //     {
  //       chainId: '0x1'
  //     }
  //   ]
  // })

  // console.log('chain', chain)

  // SECTION 1: Single Transaction Methods

  const sendLegacyTransaction = async () => {
    resetState()

    try {
      // const account = await window.silk.request({
      //   method: JSON_RPC_METHOD.eth_requestAccounts
      // })

      // console.log('account', account)

      // await window.silk.request({
      //   method: JSON_RPC_METHOD.wallet_switchEthereumChain,
      //   params: [
      //     {
      //       chainId: '0xAA36A7'
      //     }
      //   ]
      // })

      // const chain = await window.silk.request({
      //   method: JSON_RPC_METHOD.eth_chainId
      // })

      // console.log('chain', chain)

      const gas = await window.silk.request({
        method: JSON_RPC_METHOD.eth_estimateGas,
        params: [LEGACY_TX]
      })

      console.log('gas', gas)

      const accounts = (await window.silk.request({
        method: JSON_RPC_METHOD.eth_requestAccounts
      })) as string[]

      const txHash = await window.silk.request({
        method: JSON_RPC_METHOD.eth_sendTransaction,
        params: [
          {
            from: accounts[0],
            ...LEGACY_TX
          }
        ]
      })

      setTxHash(txHash as string)
    } catch (error) {
      handleError(error)
    }
  }

  const sendEIP1559Transaction = async () => {
    resetState()
    try {
      const accounts = (await window.silk.request({
        method: JSON_RPC_METHOD.eth_requestAccounts
      })) as string[]

      const txHash = await window.silk.request({
        method: JSON_RPC_METHOD.eth_sendTransaction,
        params: [
          {
            from: accounts[0],
            ...EIP1559_TX
          }
        ]
      })

      setTxHash(txHash as string)
    } catch (error) {
      handleError(error)
    }
  }

  const signPersonalMessage = async () => {
    resetState()
    try {
      const accounts = (await window.silk.request({
        method: JSON_RPC_METHOD.eth_requestAccounts
      })) as string[]

      const signature = await window.silk.request({
        method: JSON_RPC_METHOD.personal_sign,
        params: [personalSignMessage, accounts[0]]
      })

      setSignatureData(signature as string)
    } catch (error) {
      handleError(error)
    }
  }

  const signTypedData = async () => {
    resetState()
    try {
      const accounts = (await window.silk.request({
        method: JSON_RPC_METHOD.eth_requestAccounts
      })) as string[]

      const signature = await window.silk.request({
        method: JSON_RPC_METHOD.eth_signTypedData_v4,
        params: [accounts[0], JSON.stringify(typedDataExample)]
      })

      setSignatureData(signature as string)
    } catch (error) {
      handleError(error)
    }
  }

  // SECTION 2: Bulk Transaction Methods

  const sendBulkLegacyTransactions = async () => {
    resetState()
    try {
      const accounts = (await window.silk.request({
        method: JSON_RPC_METHOD.eth_requestAccounts
      })) as string[]

      // We'll send 3 transactions in sequence
      const results = []
      for (let i = 0; i < 3; i++) {
        const txHash = await window.silk.request({
          method: JSON_RPC_METHOD.eth_sendTransaction,
          params: [
            {
              from: accounts[0],
              ...LEGACY_TX,
              // Add some random data to make each tx unique
              data: `0x${i.toString(16).padStart(2, '0')}`
            }
          ]
        })
        results.push(txHash)
      }

      setTxHash(results.join(', '))
    } catch (error) {
      handleError(error)
    }
  }

  const sendBulkEIP1559Transactions = async () => {
    resetState()
    try {
      const accounts = (await window.silk.request({
        method: JSON_RPC_METHOD.eth_requestAccounts
      })) as string[]

      // We'll send 3 transactions in sequence
      const results = []
      for (let i = 0; i < 3; i++) {
        const txHash = await window.silk.request({
          method: JSON_RPC_METHOD.eth_sendTransaction,
          params: [
            {
              from: accounts[0],
              ...EIP1559_TX,
              // Add some random data to make each tx unique
              data: `0x${i.toString(16).padStart(2, '0')}`
            }
          ]
        })
        results.push(txHash)
      }

      setTxHash(results.join(', '))
    } catch (error) {
      handleError(error)
    }
  }

  const sendMixedTransactions = async () => {
    resetState()
    try {
      const accounts = (await window.silk.request({
        method: JSON_RPC_METHOD.eth_requestAccounts
      })) as string[]

      // Send a legacy transaction
      const legacyTxHash = await window.silk.request({
        method: JSON_RPC_METHOD.eth_sendTransaction,
        params: [
          {
            from: accounts[0],
            ...LEGACY_TX,
            data: '0x00'
          }
        ]
      })

      // Send an EIP-1559 transaction
      const eip1559TxHash = await window.silk.request({
        method: JSON_RPC_METHOD.eth_sendTransaction,
        params: [
          {
            from: accounts[0],
            ...EIP1559_TX,
            data: '0x01'
          }
        ]
      })

      // Send a contract interaction transaction
      const contractTxHash = await window.silk.request({
        method: JSON_RPC_METHOD.eth_sendTransaction,
        params: [
          {
            from: accounts[0],
            to: '0xfb6E71e0800BcCC0db8a9Cf326fe3213CA1A0EA0',
            value: toHex(parseEther('0.00000001')),
            data: '0xa9059cbb000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000000de0b6b3a7640000'
          }
        ]
      })

      setTxHash([legacyTxHash, eip1559TxHash, contractTxHash].join(', '))
    } catch (error) {
      handleError(error)
    }
  }

  return (
    <div className='space-y-8'>
      <h2 className='font-bold text-2xl'>
        Silk SDK Transaction Tests (Sign with Human Wallet)
      </h2>

      {/* Section 1: Single Transaction/Signing Methods */}
      <div className='p-4 border rounded-lg'>
        <h3 className='text-xl font-semibold mb-4'>
          1. Send Single Transactions
        </h3>
        <div className='space-y-4'>
          <div className='flex flex-wrap gap-4'>
            <button onClick={sendLegacyTransaction} className='button'>
              Send Legacy Transaction
            </button>
            <button onClick={sendEIP1559Transaction} className='button'>
              Send EIP-1559 Transaction
            </button>
            <button onClick={signPersonalMessage} className='button'>
              Personal Sign
            </button>
            <button onClick={signTypedData} className='button'>
              Sign Typed Data (EIP-712)
            </button>
            <button onClick={sendContractCall} className='button'>
              Send Contract Call
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Bulk Transaction Methods */}
      <div className='p-4 border rounded-lg'>
        <h3 className='text-xl font-semibold mb-4'>
          2. Send Bulk Transactions
        </h3>
        <div className='space-y-4'>
          <div className='flex flex-wrap gap-4'>
            <button onClick={sendBulkLegacyTransactions} className='button'>
              Send 3 Legacy Transactions
            </button>
            <button onClick={sendBulkEIP1559Transactions} className='button'>
              Send 3 EIP-1559 Transactions
            </button>
            <button onClick={sendMixedTransactions} className='button'>
              Send Mixed Transaction Types
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className='p-4 border rounded-lg'>
        <h3 className='text-xl font-semibold mb-4'>Results</h3>

        {txHash && (
          <div className='mb-4'>
            <h3 className='font-medium'>Transaction Hash:</h3>
            <p className='break-all bg-gray-100 p-2 rounded'>{txHash}</p>
          </div>
        )}

        {signatureData && (
          <div className='mb-4'>
            <h3 className='font-medium'>Signature:</h3>
            <p className='break-all bg-gray-100 p-2 rounded'>{signatureData}</p>
          </div>
        )}

        {error && (
          <div className='mb-4'>
            <h3 className='font-medium text-red-500'>Error:</h3>
            <p className='break-all bg-red-50 text-red-700 p-2 rounded'>
              {error}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionsSdk
