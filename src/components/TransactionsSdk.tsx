import { useEffect, useState } from 'react'
import {
  parseEther,
  toHex,
  createPublicClient,
  http,
  parseGwei,
  createClient
} from 'viem'
import { waitForTransactionReceipt } from 'viem/actions'
import { useWaapTransaction, SILK_METHOD, WAAP_METHOD } from '@human.tech/waap-sdk'

function TransactionsSdk() {
  const [txHash, setTxHash] = useState<string | null>(null)
  const [signatureData, setSignatureData] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [receiptTestResults, setReceiptTestResults] = useState<any>(null)
  const [isTestingReceipt, setIsTestingReceipt] = useState(false)
  const {
    sendTransaction,
    isAnyPending,
    pendingTransactions,
    signTransaction
  } = useWaapTransaction({
    onPending: (result) => {
      console.log('onPending (waap_sign_pending)', result)
    },
    on2faRequired: (result) => {
      console.log('on2faRequired (waap_2fa_required)', result)
    },
    onSigned: (result) => {
      console.log('onSigned (waap_sign_complete)', result)
    },
    onSignFailed: (result) => {
      console.log('onSignFailed (waap_sign_failed)', result)
    },
    onTxPending: (result) => {
      console.log('onTxPending (waap_tx_pending)', result)
    },
    onConfirmed: (result) => {
      console.log('onConfirmed (waap_tx_confirmed)', result)
    },
    onFailed: (result) => {
      console.log('onFailed (waap_tx_failed)', result)
    }
  })

  useEffect(() => {
    if (!window.silk) return

    const handleSignPending = (event: any) => {
      console.log('waap_sign_pending', event)
    }
    const handle2faRequired = (event: any) => {
      console.log('waap_2fa_required', event)
    }
    const handleSignComplete = (event: any) => {
      console.log('waap_sign_complete', event)
      setSignatureData(event.signature)
    }
    const handleSignFailed = (event: any) => {
      console.log('waap_sign_failed', event)
    }
    const handleTxPending = (event: any) => {
      console.log('waap_tx_pending', event)
    }
    const handleTxConfirmed = (event: any) => {
      console.log('waap_tx_confirmed', event)
    }
    const handleTxFailed = (event: any) => {
      console.log('waap_tx_failed', event)
    }

    window.silk.on('waap_sign_pending', handleSignPending)
    window.silk.on('waap_2fa_required', handle2faRequired)
    window.silk.on('waap_sign_complete', handleSignComplete)
    window.silk.on('waap_sign_failed', handleSignFailed)
    window.silk.on('waap_tx_pending', handleTxPending)
    window.silk.on('waap_tx_confirmed', handleTxConfirmed)
    window.silk.on('waap_tx_failed', handleTxFailed)

    return () => {
      window.silk.removeListener?.('waap_sign_pending', handleSignPending)
      window.silk.removeListener?.('waap_2fa_required', handle2faRequired)
      window.silk.removeListener?.('waap_sign_complete', handleSignComplete)
      window.silk.removeListener?.('waap_sign_failed', handleSignFailed)
      window.silk.removeListener?.('waap_tx_pending', handleTxPending)
      window.silk.removeListener?.('waap_tx_confirmed', handleTxConfirmed)
      window.silk.removeListener?.('waap_tx_failed', handleTxFailed)
    }
  }, [])
  // Transaction Types
  const LEGACY_TX = {
    to: '0xe3D7cD379E9949D2c33D80B7a981a076A6C8694d',
    value: toHex(parseEther('0.00000001'))
  }

  const MALICIOUS_LEGACY_TX = {
    to: '0x0a5738064da9dda3cf4a4ae8d8e49b16fd7467c5',
    value: toHex(parseEther('0.00000000'))
  }

  const CONTRACT_CALL_TX = {
    to: '0xe21935D4Ff567E742Cc38D9AA613Bb8043962004',
    data: '0x6057361d000000000000000000000000000000000000000000000000000000000000007b'
  }

  const MALICIOUS_CONTRACT_CALL_TX = {
    to: '0x0a5738064da9dda3cf4a4ae8d8e49b16fd7467c5',
    data: '0x6057361d000000000000000000000000000000000000000000000000000000000000007b'
  }

  const EIP1559_TX = {
    to: '0xdbd6b2c02338919EdAa192F5b60F5e5840A50079',
    value: toHex(parseEther('0.00000000000')),
    maxFeePerGas: '0x1000000000', // 68.7 gwei
    maxPriorityFeePerGas: '0x100000000' // 4.3 gwei
  }

  const MALICIOUS_EIP1559_TX = {
    to: '0x0a5738064da9dda3cf4a4ae8d8e49b16fd7467c5',
    value: toHex(parseEther('0.0000000000')),
    maxFeePerGas: '0x1000000000', // 68.7 gwei
    maxPriorityFeePerGas: '0x100000000' // 4.3 gwei
  }

  // Personal Sign example
  const personalSignMessage = 'Hello World from WaaP'

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
      from: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
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

  const maliciousTypedDataExample = {
    ...typedDataExample,
    message: {
      ...typedDataExample.message,
      to: '0x0a5738064da9dda3cf4a4ae8d8e49b16fd7467c5'
    }
  }

  const sendContractCall = async ({
    async,
    malicious
  }: {
    async?: boolean
    malicious?: boolean
  }) => {
    resetState()

    await window.silk.request({
      method: SILK_METHOD.wallet_switchEthereumChain,
      params: [
        {
          chainId: '0x2105'
        }
      ]
    })

    const chain = await window.silk.request({
      method: SILK_METHOD.eth_chainId
    })

    try {
      const accounts = (await window.silk.request({
        method: SILK_METHOD.eth_requestAccounts
      })) as string[]

      const tx = malicious ? MALICIOUS_CONTRACT_CALL_TX : CONTRACT_CALL_TX

      const txHash = await window.silk.request({
        method: SILK_METHOD.eth_sendTransaction,
        params: [
          {
            from: accounts[0],
            ...tx
          }
        ],
        async
      })

      if (!async) {
        setTxHash(txHash as string)
      }
    } catch (error) {
      handleError(error)
    }
  }

  const signContractCall = async ({
    async,
    malicious
  }: {
    async?: boolean
    malicious?: boolean
  }) => {
    resetState()

    await window.silk.request({
      method: SILK_METHOD.wallet_switchEthereumChain,
      params: [
        {
          chainId: '0x2105'
        }
      ]
    })

    const chain = await window.silk.request({
      method: SILK_METHOD.eth_chainId
    })

    try {
      const accounts = (await window.silk.request({
        method: SILK_METHOD.eth_requestAccounts
      })) as string[]

      const tx = malicious ? MALICIOUS_CONTRACT_CALL_TX : CONTRACT_CALL_TX

      const signature = await window.silk.request({
        //@ts-ignore
        method: SILK_METHOD.eth_signTransaction,
        params: [
          {
            from: accounts[0],
            ...tx
          }
        ],
        async
      })

      if (!async) {
        setSignatureData(signature as string)
      }
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

  const sendLegacyTransaction = async ({
    async,
    malicious
  }: {
    async?: boolean
    malicious?: boolean
  }) => {
    resetState()

    try {
      const accounts = (await window.silk.request({
        method: SILK_METHOD.eth_requestAccounts
      })) as string[]

      const tx = malicious ? MALICIOUS_LEGACY_TX : LEGACY_TX

      await window.silk.request({
        method: SILK_METHOD.wallet_switchEthereumChain,
        params: [
          {
            chainId: '0x2105'
          }
        ]
      })

      console.log(
        'chain:',
        await window.silk.request({ method: 'eth_chainId' })
      )

      const result = await window.silk.request({
        method: SILK_METHOD.eth_sendTransaction,
        params: [
          {
            from: accounts[0],
            ...tx
          }
        ],
        async
      })

      if (!async) {
        setTxHash(result as string)
      }
    } catch (error) {
      handleError(error)
    }
  }

  const signLegacyTransaction = async ({
    async,
    malicious
  }: {
    async?: boolean
    malicious?: boolean
  }) => {
    resetState()

    try {
      const accounts = (await window.silk.request({
        method: SILK_METHOD.eth_requestAccounts
      })) as string[]

      const tx = malicious ? MALICIOUS_LEGACY_TX : LEGACY_TX

      await window.silk.request({
        method: SILK_METHOD.wallet_switchEthereumChain,
        params: [
          {
            chainId: '0x2105'
          }
        ]
      })

      const result = sendTransaction({
        from: accounts[0],
        ...tx
      })

      // const result = await window.silk.request({
      //   method: JSON_RPC_METHOD.eth_signTransaction,
      //   params: [
      //     {
      //       from: accounts[0],
      //       ...tx
      //     }
      //   ],
      //   async
      // })

      console.log('result: ', result)

      // if (!async) {
      //   setSignatureData(result as string)
      // }
    } catch (error) {
      handleError(error)
    }
  }

  const sendEIP1559Transaction = async ({
    async,
    malicious
  }: {
    async?: boolean
    malicious?: boolean
  }) => {
    resetState()
    try {
      const accounts = (await window.silk.request({
        method: SILK_METHOD.eth_requestAccounts
      })) as string[]

      const tx = malicious ? MALICIOUS_EIP1559_TX : EIP1559_TX

      await window.silk.request({
        method: SILK_METHOD.wallet_switchEthereumChain,
        params: [
          {
            chainId: '0x2105'
          }
        ]
      })

      const txHash = await window.silk.request({
        method: SILK_METHOD.eth_sendTransaction,
        params: [
          {
            from: accounts[0],
            ...tx
          }
        ],
        async
      })

      if (!async) {
        setTxHash(txHash as string)
      }
    } catch (error) {
      handleError(error)
    }
  }

  const signEIP1559Transaction = async ({
    async,
    malicious
  }: {
    async?: boolean
    malicious?: boolean
  }) => {
    resetState()
    try {
      const accounts = (await window.silk.request({
        method: SILK_METHOD.eth_requestAccounts
      })) as string[]

      const tx = malicious ? MALICIOUS_EIP1559_TX : EIP1559_TX

      await window.silk.request({
        method: SILK_METHOD.wallet_switchEthereumChain,
        params: [
          {
            chainId: '0x2105'
          }
        ]
      })

      const txHash = await window.silk.request({
        method: SILK_METHOD.personal_sign,
        params: [
          {
            from: accounts[0],
            ...tx
          }
        ],
        async
      })

      if (!async) {
        setTxHash(txHash as string)
      }
    } catch (error) {
      handleError(error)
    }
  }

  const signPersonalMessage = async (async?: boolean) => {
    resetState()
    try {
      const accounts = (await window.silk.request({
        method: SILK_METHOD.eth_requestAccounts
      })) as string[]

      const signature = await window.silk.request({
        method: SILK_METHOD.personal_sign,
        params: [personalSignMessage, accounts[0]],
        async
      })

      if (!async) {
        setSignatureData(signature as string)
      }
    } catch (error) {
      handleError(error)
    }
  }

  const signTypedData = async ({
    async,
    malicious
  }: {
    async?: boolean
    malicious?: boolean
  }) => {
    resetState()
    try {
      const accounts = (await window.silk.request({
        method: SILK_METHOD.eth_requestAccounts
      })) as string[]

      const typedData = malicious ? maliciousTypedDataExample : typedDataExample

      const signature = await window.silk.request({
        method: SILK_METHOD.eth_signTypedData_v4,
        params: [
          accounts[0],
          JSON.stringify({
            ...typedData,
            message: { ...typedData.message, from: accounts[0] }
          })
        ],
        async
      })

      console.log('signature', signature)

      if (!async) {
        setSignatureData(signature as string)
      }
    } catch (error) {
      handleError(error)
    }
  }

  // SECTION 2: Bulk Transaction Methods
  const sendBulkLegacyTransactions = async (async?: boolean) => {
    resetState()
    try {
      const accounts = (await window.silk.request({
        method: SILK_METHOD.eth_requestAccounts
      })) as string[]

      // We'll send 3 transactions in sequence
      const results = []
      for (let i = 0; i < 3; i++) {
        const txHash = await window.silk.request({
          method: SILK_METHOD.eth_sendTransaction,
          params: [
            {
              from: accounts[0],
              ...LEGACY_TX,
              // Add some random data to make each tx unique
              data: `0x${i.toString(16).padStart(2, '0')}`
            }
          ],
          async
        })
        results.push(txHash)
      }

      if (!async) {
        setTxHash(results.join(', '))
      }
    } catch (error) {
      handleError(error)
    }
  }

  const sendBulkEIP1559Transactions = async (async?: boolean) => {
    resetState()
    try {
      const accounts = (await window.silk.request({
        method: SILK_METHOD.eth_requestAccounts
      })) as string[]

      // We'll send 3 transactions in sequence
      const results = []
      for (let i = 0; i < 3; i++) {
        const txHash = await window.silk.request({
          method: SILK_METHOD.eth_sendTransaction,
          params: [
            {
              from: accounts[0],
              ...EIP1559_TX,
              // Add some random data to make each tx unique
              data: `0x${i.toString(16).padStart(2, '0')}`
            }
          ],
          async
        })
        results.push(txHash)
      }

      setTxHash(results.join(', '))
    } catch (error) {
      handleError(error)
    }
  }

  const sendMixedTransactions = async (async?: boolean) => {
    resetState()
    try {
      const accounts = (await window.silk.request({
        method: SILK_METHOD.eth_requestAccounts
      })) as string[]

      // Send a legacy transaction
      const legacyTxHash = await window.silk.request({
        method: SILK_METHOD.eth_sendTransaction,
        params: [
          {
            from: accounts[0],
            ...LEGACY_TX,
            data: '0x00'
          }
        ],
        async
      })

      // Send an EIP-1559 transaction
      const eip1559TxHash = await window.silk.request({
        method: SILK_METHOD.eth_sendTransaction,
        params: [
          {
            from: accounts[0],
            ...EIP1559_TX,
            data: '0x01'
          }
        ],
        async
      })

      // Send a contract interaction transaction
      const contractTxHash = await window.silk.request({
        method: SILK_METHOD.eth_sendTransaction,
        params: [
          {
            from: accounts[0],
            to: '0xfb6E71e0800BcCC0db8a9Cf326fe3213CA1A0EA0',
            value: toHex(parseEther('0.00000001')),
            data: '0xa9059cbb000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000000de0b6b3a7640000'
          }
        ],
        async
      })

      setTxHash([legacyTxHash, eip1559TxHash, contractTxHash].join(', '))
    } catch (error) {
      handleError(error)
    }
  }

  // --- DRAIN WALLET USING VIEM FOR ESTIMATION ---
  const drainWalletViem = async () => {
    resetState()
    try {
      const chain = await window.silk.request({
        method: SILK_METHOD.eth_chainId
      })

      console.log('chain', chain)
      const accounts = (await window.silk.request({
        method: SILK_METHOD.eth_requestAccounts
      })) as string[]
      const from = accounts[0] as `0x${string}`
      const to = '0xC2bAcf76958a402F079fF7Be7F05a427D8d37AEa' as `0x${string}`

      // 1. Setup viem client for Sepolia
      const client = createPublicClient({
        chain: {
          id: 11155111,
          name: 'sepolia',
          nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
          rpcUrls: {
            default: {
              http: [
                'https://eth-sepolia.g.alchemy.com/v2/wxieEGaCXu4vVoL3y2Sf31sJHcmlnppW/'
              ]
            }
          }
        },
        transport: http(
          'https://eth-sepolia.g.alchemy.com/v2/wxieEGaCXu4vVoL3y2Sf31sJHcmlnppW/'
        )
      })

      // 2. Get balance
      const balance = await client.getBalance({ address: from })
      // 3. Estimate gas
      const gas = await client.estimateGas({ account: from, to })
      // 4. Get gas price
      const gasPrice = await client.getGasPrice()
      // 5. Calculate max value to send (leave a small buffer)
      const buffer = parseEther('0.0001')
      const maxValue = balance - gas * gasPrice - buffer
      if (maxValue <= 0n) throw new Error('Not enough balance to drain!')

      // 1. Set a higher gas price (e.g., 15.2 Gwei)
      const fastGasPrice = parseGwei('15.215865642') // or just '20' for 20 Gwei

      // 2. Use this gas price in your transaction
      const txHash = await window.silk.request({
        method: SILK_METHOD.eth_sendTransaction,
        params: [
          {
            from,
            to,
            value: toHex(maxValue),
            gas: toHex(gas),
            gasPrice: toHex(fastGasPrice) // <-- override here
          }
        ]
      })
      setTxHash(txHash as string)
    } catch (error) {
      handleError(error)
    }
  }

  // NEW: Test transaction receipt functionality
  const testTransactionReceipt = async () => {
    resetState()
    setIsTestingReceipt(true)

    try {
      // Switch to Optimism for testing
      await window.silk.request({
        method: SILK_METHOD.wallet_switchEthereumChain,
        params: [{ chainId: '0xa' }] // Optimism mainnet
      })

      const accounts = (await window.silk.request({
        method: SILK_METHOD.eth_requestAccounts
      })) as string[]

      // Send a simple transaction
      console.log('Sending test transaction on Optimism...')
      const testTx = {
        to: '0xC2bAcf76958a402F079fF7Be7F05a427D8d37AEa',
        value: toHex(parseEther('0.00001')), // Small amount
        from: accounts[0]
      }

      const txHash = (await window.silk.request({
        method: SILK_METHOD.eth_sendTransaction,
        params: [testTx]
      })) as string

      console.log('Transaction sent:', txHash)
      setTxHash(txHash)

      // Now test both receipt methods
      const results = {
        txHash,
        oldMethod: null as any,
        newMethod: null as any,
        oldMethodTime: 0,
        newMethodTime: 0,
        oldMethodError: null as string | null,
        newMethodError: null as string | null
      }

      // Test 1: Old method (direct provider call)
      console.log('Testing old method (direct ethers provider)...')
      const oldStartTime = Date.now()
      try {
        // Simulate the old method - direct call that might timeout
        const oldReceipt = await window.silk.request({
          method: SILK_METHOD.eth_getTransactionReceipt,
          params: [txHash]
        })
        results.oldMethod = oldReceipt
        results.oldMethodTime = Date.now() - oldStartTime
        console.log('Old method result:', oldReceipt)
      } catch (error: any) {
        results.oldMethodError = error.message
        results.oldMethodTime = Date.now() - oldStartTime
        console.log('Old method error:', error.message)
      }

      // Test 2: New method with viem (simulate the updated implementation)
      console.log('Testing new method (viem waitForTransactionReceipt)...')
      const newStartTime = Date.now()
      try {
        // Create viem client for Optimism
        const viemClient = createClient({
          chain: {
            id: 10,
            name: 'Optimism',
            nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: {
              default: {
                http: [
                  'https://tiniest-blissful-diagram.optimism.quiknode.pro/324cd24fac66376fac3bf440e9eb60d0329ff812/'
                ]
              },
              public: {
                http: [
                  'https://tiniest-blissful-diagram.optimism.quiknode.pro/324cd24fac66376fac3bf440e9eb60d0329ff812/'
                ]
              }
            }
          },
          transport: http(
            'https://tiniest-blissful-diagram.optimism.quiknode.pro/324cd24fac66376fac3bf440e9eb60d0329ff812/'
          )
        })

        const newReceipt = await waitForTransactionReceipt(viemClient, {
          hash: txHash as `0x${string}`,
          timeout: 60000 // 60 second timeout
        })

        results.newMethod = newReceipt
        results.newMethodTime = Date.now() - newStartTime
        console.log('New method result:', newReceipt)
      } catch (error: any) {
        results.newMethodError = error.message
        results.newMethodTime = Date.now() - newStartTime
        console.log('New method error:', error.message)

        // Fallback to old method as the actual implementation does
        try {
          const fallbackReceipt = await window.silk.request({
            method: SILK_METHOD.eth_getTransactionReceipt,
            params: [txHash]
          })
          results.newMethod = fallbackReceipt
        } catch (fallbackError: any) {
          console.log('Fallback also failed:', fallbackError.message)
        }
      }

      setReceiptTestResults(results)
      console.log('Receipt test completed:', results)
    } catch (error: any) {
      handleError(error)
    } finally {
      setIsTestingReceipt(false)
    }
  }

  // Inline styles
  const styles = {
    container: {
      display: 'flex',
      gap: '24px'
    },
    leftPanel: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto' as const,
      paddingRight: '16px'
    },
    title: {
      fontWeight: 'bold',
      color: 'black',
      fontSize: '24px',
      position: 'sticky' as const,
      top: 0,
      backgroundColor: 'white',
      padding: '8px 0',
      zIndex: 10
    },
    section: (borderColor: string, bgColor: string) => ({
      padding: '16px',
      border: `2px solid ${borderColor}`,
      borderRadius: '8px',
      backgroundColor: bgColor
    }),
    sectionTitle: (color: string) => ({
      fontSize: '16px',
      fontWeight: 600,
      marginBottom: '12px',
      color
    }),
    buttonGroup: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '8px'
    },
    button: (bgColor: string) => ({
      backgroundColor: bgColor,
      color: 'white',
      padding: '6px 12px',
      borderRadius: '4px',
      fontSize: '13px',
      border: 'none',
      cursor: 'pointer'
    }),
    rightPanel: {
      width: '384px',
      flexShrink: 0
    },
    resultsBox: {
      position: 'sticky' as const,
      top: '16px',
      padding: '16px',
      border: '2px solid #d1d5db',
      borderRadius: '8px',
      backgroundColor: '#f9fafb',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      maxHeight: 'calc(100vh - 140px)',
      overflowY: 'auto' as const
    },
    resultsTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '16px',
      color: '#1f2937',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '8px'
    },
    resultItem: (bgColor: string, textColor: string) => ({
      marginBottom: '16px',
      backgroundColor: bgColor,
      padding: '8px',
      borderRadius: '4px',
      color: textColor,
      wordBreak: 'break-all' as const,
      fontSize: '12px',
      fontFamily: 'monospace'
    }),
    resultLabel: (color: string) => ({
      fontWeight: 600,
      fontSize: '13px',
      color,
      marginBottom: '4px'
    }),
    placeholder: {
      color: '#9ca3af',
      fontStyle: 'italic',
      textAlign: 'center' as const,
      padding: '32px 0'
    },
    divider: {
      borderTop: '3px solid #374151',
      margin: '24px 0',
      position: 'relative' as const
    },
    dividerText: {
      position: 'absolute' as const,
      top: '-12px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'white',
      padding: '0 12px',
      fontWeight: 'bold',
      color: '#dc2626',
      fontSize: '14px'
    }
  }

  return (
    <div style={styles.container}>
      {/* Left side: Transaction sections */}
      <div style={styles.leftPanel}>
        <h2 style={styles.title}>
          WaaP SDK Transaction Tests (Sign with WaaP)
        </h2>

        {/* ===== REGULAR TRANSACTIONS ===== */}

        {/* Section 1: Send Transactions (Sync) */}
        <div style={styles.section('#22c55e', '#f0fdf4')}>
          <h3 style={styles.sectionTitle('#166534')}>1. Send Transactions</h3>
          <div style={styles.buttonGroup}>
            <button
              onClick={() => sendLegacyTransaction({ malicious: false })}
              style={styles.button('#22c55e')}
            >
              Legacy Transaction
            </button>
            <button
              onClick={() => sendEIP1559Transaction({ malicious: false })}
              style={styles.button('#22c55e')}
            >
              EIP-1559 Transaction
            </button>
            <button
              onClick={() => signPersonalMessage()}
              style={styles.button('#22c55e')}
            >
              Personal Sign
            </button>
            <button
              onClick={() => signTypedData({ malicious: false })}
              style={styles.button('#22c55e')}
            >
              Sign Typed Data (EIP-712)
            </button>
            <button
              onClick={() => sendContractCall({ malicious: false })}
              style={styles.button('#22c55e')}
            >
              Contract Call
            </button>
            <button onClick={drainWalletViem} style={styles.button('#22c55e')}>
              Drain Wallet (sepolia)
            </button>
          </div>
        </div>

        {/* Section 2: Send Transactions (Async) */}
        <div style={styles.section('#3b82f6', '#eff6ff')}>
          <h3 style={styles.sectionTitle('#1e40af')}>
            2. Send Transactions (Async)
          </h3>
          <div style={styles.buttonGroup}>
            <button
              onClick={() =>
                sendLegacyTransaction({ async: true, malicious: false })
              }
              style={styles.button('#3b82f6')}
            >
              Legacy Transaction Async
            </button>
            <button
              onClick={() =>
                sendEIP1559Transaction({ async: true, malicious: false })
              }
              style={styles.button('#3b82f6')}
            >
              EIP-1559 Transaction Async
            </button>
            <button
              onClick={() => signPersonalMessage(true)}
              style={styles.button('#3b82f6')}
            >
              Personal Sign Async
            </button>
            <button
              onClick={() => signTypedData({ async: true, malicious: false })}
              style={styles.button('#3b82f6')}
            >
              Sign Typed Data (EIP-712) Async
            </button>
            <button
              onClick={() =>
                sendContractCall({ async: true, malicious: false })
              }
              style={styles.button('#3b82f6')}
            >
              Contract Call Async
            </button>
            <button
              onClick={() => sendBulkLegacyTransactions(true)}
              style={styles.button('#3b82f6')}
            >
              Bulk Transactions Async
            </button>
          </div>
        </div>

        {/* Section 3: Sign Transactions (Sign Only) */}
        <div style={styles.section('#a855f7', '#faf5ff')}>
          <h3 style={styles.sectionTitle('#6b21a8')}>
            3. Sign Transactions (Sign Only)
          </h3>
          <div style={styles.buttonGroup}>
            <button
              onClick={() => signLegacyTransaction({ malicious: false })}
              style={styles.button('#a855f7')}
            >
              Sign Legacy Transaction
            </button>
            <button
              onClick={() => signEIP1559Transaction({ malicious: false })}
              style={styles.button('#a855f7')}
            >
              Sign EIP-1559 Transaction
            </button>
            <button
              onClick={() => signContractCall({ malicious: false })}
              style={styles.button('#a855f7')}
            >
              Sign Contract Call
            </button>
          </div>
        </div>

        {/* Section 4: Sign Transactions Async (Sign Only) */}
        <div style={styles.section('#06b6d4', '#ecfeff')}>
          <h3 style={styles.sectionTitle('#0e7490')}>
            4. Sign Transactions Async (Sign Only)
          </h3>
          <div style={styles.buttonGroup}>
            <button
              onClick={() =>
                signLegacyTransaction({ async: true, malicious: false })
              }
              style={styles.button('#06b6d4')}
            >
              Sign Legacy Transaction
            </button>
            <button
              onClick={() =>
                signEIP1559Transaction({ async: true, malicious: false })
              }
              style={styles.button('#06b6d4')}
            >
              Sign EIP-1559 Transaction
            </button>
            <button
              onClick={() =>
                signContractCall({ async: true, malicious: false })
              }
              style={styles.button('#06b6d4')}
            >
              Sign Contract Call
            </button>
          </div>
        </div>

        {/* ===== DIVIDER ===== */}
        <div style={styles.divider}>
          <span style={styles.dividerText}>
            MALICIOUS TRANSACTIONS (Will trigger 2FA)
          </span>
        </div>

        {/* Section 5: Send Malicious Transactions (Sync) */}
        <div style={styles.section('#ef4444', '#fef2f2')}>
          <h3 style={styles.sectionTitle('#991b1b')}>
            5. Send Malicious Transactions
          </h3>
          <div style={styles.buttonGroup}>
            <button
              onClick={() => sendLegacyTransaction({ malicious: true })}
              style={styles.button('#ef4444')}
            >
              Malicious Legacy Transaction
            </button>
            <button
              onClick={() => sendEIP1559Transaction({ malicious: true })}
              style={styles.button('#ef4444')}
            >
              Malicious EIP-1559 Transaction
            </button>
            <button
              onClick={() => signTypedData({ malicious: true })}
              style={styles.button('#ef4444')}
            >
              Malicious Sign Typed Data (EIP-712)
            </button>
            <button
              onClick={() => sendContractCall({ malicious: true })}
              style={styles.button('#ef4444')}
            >
              Malicious Contract Call
            </button>
          </div>
        </div>

        {/* Section 6: Send Malicious Transactions (Async) */}
        <div style={styles.section('#f97316', '#fff7ed')}>
          <h3 style={styles.sectionTitle('#9a3412')}>
            6. Send Malicious Transactions (Async)
          </h3>
          <div style={styles.buttonGroup}>
            <button
              onClick={() =>
                sendLegacyTransaction({ async: true, malicious: true })
              }
              style={styles.button('#f97316')}
            >
              Legacy Transaction Async
            </button>
            <button
              onClick={() =>
                sendEIP1559Transaction({ async: true, malicious: true })
              }
              style={styles.button('#f97316')}
            >
              EIP-1559 Transaction Async
            </button>
            <button
              onClick={() => signPersonalMessage(true)}
              style={styles.button('#f97316')}
            >
              Personal Sign Async
            </button>
            <button
              onClick={() => signTypedData({ async: true, malicious: true })}
              style={styles.button('#f97316')}
            >
              Sign Typed Data (EIP-712) Async
            </button>
            <button
              onClick={() => sendContractCall({ async: true, malicious: true })}
              style={styles.button('#f97316')}
            >
              Contract Call Async
            </button>
          </div>
        </div>

        {/* Section 7: Sign Malicious Transactions (Sign Only) */}
        <div style={styles.section('#ec4899', '#fdf2f8')}>
          <h3 style={styles.sectionTitle('#9d174d')}>
            7. Sign Malicious Transactions (Sign Only)
          </h3>
          <div style={styles.buttonGroup}>
            <button
              onClick={() => signLegacyTransaction({ malicious: true })}
              style={styles.button('#ec4899')}
            >
              Malicious Sign Legacy Transaction
            </button>
            <button
              onClick={() => signEIP1559Transaction({ malicious: true })}
              style={styles.button('#ec4899')}
            >
              Malicious Sign EIP-1559 Transaction
            </button>
            <button
              onClick={() => signContractCall({ malicious: true })}
              style={styles.button('#ec4899')}
            >
              Malicious Sign Contract Call
            </button>
          </div>
        </div>

        {/* Section 8: Sign Malicious Transactions Async (Sign Only) */}
        <div style={styles.section('#3b82f6', '#eff6ff')}>
          <h3 style={styles.sectionTitle('#9d174d')}>
            8. Sign Malicious Transactions Async (Sign Only)
          </h3>
          <div style={styles.buttonGroup}>
            <button
              onClick={() =>
                signLegacyTransaction({ async: true, malicious: true })
              }
              style={styles.button('#3b82f6')}
            >
              Malicious Sign Legacy Transaction Async
            </button>
            <button
              onClick={() =>
                signEIP1559Transaction({ async: true, malicious: true })
              }
              style={styles.button('#3b82f6')}
            >
              Malicious Sign EIP-1559 Async
            </button>
            <button
              onClick={() => signContractCall({ async: true, malicious: true })}
              style={styles.button('#3b82f6')}
            >
              Malicious Sign Contract Call Async
            </button>
          </div>
        </div>
      </div>

      {/* Right side: Sticky Results Section */}
      <div style={styles.rightPanel}>
        <div style={styles.resultsBox}>
          <h3 style={styles.resultsTitle}>Results</h3>

          {!txHash && !signatureData && !error && !receiptTestResults && (
            <p style={styles.placeholder}>
              Run a transaction to see results here...
            </p>
          )}

          {txHash && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={styles.resultLabel('#15803d')}>Transaction Hash:</h4>
              <p style={styles.resultItem('#dcfce7', '#166534')}>{txHash}</p>
            </div>
          )}

          {signatureData && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={styles.resultLabel('#1d4ed8')}>Signature:</h4>
              <p style={styles.resultItem('#dbeafe', '#1e40af')}>
                {signatureData}
              </p>
            </div>
          )}

          {error && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={styles.resultLabel('#dc2626')}>Error:</h4>
              <p style={styles.resultItem('#fee2e2', '#991b1b')}>{error}</p>
            </div>
          )}

          {receiptTestResults && (
            <div style={{ marginBottom: '16px' }}>
              <h4 style={styles.resultLabel('#7c3aed')}>
                Transaction Receipt Test Results
              </h4>
              <div
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '12px'
                }}
              >
                <div style={{ marginBottom: '8px' }}>
                  <p style={{ fontWeight: 600, color: '#16a34a' }}>
                    Transaction Sent
                  </p>
                  <p
                    style={{
                      backgroundColor: '#f3f4f6',
                      padding: '6px',
                      borderRadius: '4px',
                      marginTop: '4px',
                      fontFamily: 'monospace',
                      wordBreak: 'break-all'
                    }}
                  >
                    {receiptTestResults.txHash}
                  </p>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      padding: '8px',
                      backgroundColor: '#fff7ed'
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 600,
                        color: '#ea580c',
                        marginBottom: '4px'
                      }}
                    >
                      Old Method
                    </p>
                    <p>
                      <strong>Time:</strong> {receiptTestResults.oldMethodTime}
                      ms
                    </p>
                    {receiptTestResults.oldMethodError ? (
                      <p style={{ color: '#dc2626' }}>
                        <strong>Error:</strong>{' '}
                        {receiptTestResults.oldMethodError}
                      </p>
                    ) : (
                      <p style={{ color: '#16a34a' }}>
                        <strong>Status:</strong> Success
                      </p>
                    )}
                  </div>
                  <div
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      padding: '8px',
                      backgroundColor: '#eff6ff'
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 600,
                        color: '#2563eb',
                        marginBottom: '4px'
                      }}
                    >
                      New Method (Viem)
                    </p>
                    <p>
                      <strong>Time:</strong> {receiptTestResults.newMethodTime}
                      ms
                    </p>
                    {receiptTestResults.newMethodError ? (
                      <p style={{ color: '#ca8a04' }}>
                        <strong>Fallback:</strong>{' '}
                        {receiptTestResults.newMethodError}
                      </p>
                    ) : (
                      <p style={{ color: '#16a34a' }}>
                        <strong>Status:</strong> Success
                      </p>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: '#f3f4f6',
                    padding: '8px',
                    borderRadius: '4px',
                    marginTop: '8px'
                  }}
                >
                  <p
                    style={{
                      fontWeight: 600,
                      color: '#374151',
                      marginBottom: '4px'
                    }}
                  >
                    Summary
                  </p>
                  <p>
                    {receiptTestResults.newMethodTime <
                      receiptTestResults.oldMethodTime
                      ? `New method ${receiptTestResults.oldMethodTime -
                      receiptTestResults.newMethodTime
                      }ms faster`
                      : `Old method ${receiptTestResults.newMethodTime -
                      receiptTestResults.oldMethodTime
                      }ms faster`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TransactionsSdk
