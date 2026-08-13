import { useState } from 'react'
import { useAccount } from 'wagmi'

// The gas-tank admin operations are exposed on the SDK provider via `silk.portal`.
// It isn't in the public typing (it was Dev-Portal-only), so we reach it off window.
const silk = () => (window as any).silk

// The single gas-tank deposit wallet (same address on every EVM chain). All
// top-ups deposit here; the backend credits the chosen virtual tank. Source of
// truth is GET <gastankOrigin>/health/balances; hardcoded here for the harness.
const GASTANK_DEPOSIT = '0xb1D9dB6bD3c7F9a8ed824C5e1Ad6f6EDbABD8e1E'

// Native USDC per supported chain — used to auto-find a chain where a tester
// holds stablecoins but has no gas, then sponsor a USDC transfer there.
const STABLECOINS: { chainId: number; name: string; rpc: string; usdc: string }[] =
  [
    { chainId: 8453, name: 'Base', rpc: 'https://mainnet.base.org', usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
    { chainId: 10, name: 'Optimism', rpc: 'https://mainnet.optimism.io', usdc: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85' },
    { chainId: 42161, name: 'Arbitrum', rpc: 'https://arb1.arbitrum.io/rpc', usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' },
    { chainId: 1, name: 'Ethereum', rpc: 'https://ethereum-rpc.publicnode.com', usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' }
  ]

const rpcCall = async (rpc: string, method: string, params: unknown[]) => {
  const r = await fetch(rpc, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
  })
  return (await r.json())?.result
}

const pad32 = (hexNo0x: string) => hexNo0x.padStart(64, '0')

const usdcBalanceOf = async (rpc: string, usdc: string, owner: string) => {
  const data = '0x70a08231' + pad32(owner.slice(2))
  const res = await rpcCall(rpc, 'eth_call', [{ to: usdc, data }, 'latest'])
  return BigInt(res || '0x0')
}

// holonym.eth — a recognizable recipient for the sponsored test tx (clearer than
// a token/gas-tank address). The allowlist covers (chain, this) so it's sponsored.
const HOLONYM = '0xcC2ca22AaefE22A0144A0260731a40a725AFffF0'
// Treat < ~0.0003 native as "not enough gas".
const GAS_THRESHOLD = 3n * 10n ** 14n

/**
 * App (project) gas-tank test harness.
 *
 * Flow to sponsor your app's users' transactions:
 *   1. Init project      → creates a project + its SponsorGasTank; returns a projectId
 *   2. Fund ($5)         → deposit ETH to the tank wallet, credited to your project balance
 *   3. Set allowlist     → which domains + contracts/methods the project will sponsor
 *   4. Send sponsored tx → a user tx to an allowlisted contract, paid by the project
 *
 * NOTE: for step 4 to be sponsored, the projectId must be passed to initWaaP at load.
 * After Init, paste the projectId into the field below (it's saved to localStorage) and
 * reload — App.tsx reads it back into initWaaP({ project: { projectId } }).
 */
export default function GasTankTestPanel() {
  const { address } = useAccount()

  const [projectId, setProjectId] = useState(
    localStorage.getItem('demo_project_id') || ''
  )
  const [contract, setContract] = useState('')
  const [method, setMethod] = useState('') // 4-byte selector, e.g. 0xa9059cbb
  const [depositChain, setDepositChain] = useState('1') // chain to deposit from (where your ETH is)
  const [busy, setBusy] = useState('')
  const [out, setOut] = useState('')

  const log = (label: string, v: unknown) =>
    setOut(`${label}:\n${typeof v === 'string' ? v : JSON.stringify(v, null, 2)}`)

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(label)
    try {
      log(label, await fn())
    } catch (e: any) {
      log(`${label} — ERROR`, e?.message || String(e))
    } finally {
      setBusy('')
    }
  }

  const saveProjectId = (pid: string) => {
    setProjectId(pid)
    localStorage.setItem('demo_project_id', pid)
  }

  // The demo logs in via window.silk (the WaaP provider), not wagmi — so read the
  // wallet address from the provider rather than relying on wagmi's useAccount.
  const resolveFrom = async (): Promise<string | undefined> => {
    if (address) return address
    try {
      const accts = await silk().request({ method: 'eth_requestAccounts' })
      return accts?.[0]
    } catch {
      return undefined
    }
  }

  const initProject = () =>
    run('1. init project', async () => {
      const from = await resolveFrom()
      if (!from) throw new Error('Log in first — admin_wallet is required')
      const res: any = await silk().portal('project', 'init', { admin_wallet: from })
      const pid = res?.projectId || res?._id || res?.project_id || res?.id
      if (pid) saveProjectId(pid)
      return res
    })

  // Fund the PROJECT tank: deposit 0.002 ETH to the gas-tank wallet on the current
  // chain, wait for it to confirm, then credit it to the project via topup(project_id).
  const fund = () =>
    run('2. fund project tank (0.002 ETH)', async () => {
      if (!projectId) throw new Error('Run "Init project" first (need a projectId)')
      const s = silk()
      const from = address || (await s.request({ method: 'eth_requestAccounts' }))?.[0]
      if (!from) throw new Error('Log in first')
      // Switch the WaaP provider to the chosen chain (where your ETH is) before
      // depositing — the demo's wagmi chain buttons don't move the provider.
      const target = '0x' + parseInt(depositChain || '1', 10).toString(16)
      await s
        .request({ method: 'wallet_switchEthereumChain', params: [{ chainId: target }] })
        .catch(() => {})
      const chainId = parseInt(await s.request({ method: 'eth_chainId' }), 16)
      const value = '0x' + (2n * 10n ** 15n).toString(16) // 0.002 ETH in wei
      const depositTx = await s.request({
        method: 'eth_sendTransaction',
        params: [{ from, to: GASTANK_DEPOSIT, value }]
      })
      // The backend verifies the deposit is confirmed on-chain, so wait for the receipt.
      let confirmed = false
      for (let i = 0; i < 30 && !confirmed; i++) {
        await new Promise((r) => setTimeout(r, 4000))
        const rcpt = await s
          .request({ method: 'eth_getTransactionReceipt', params: [depositTx] })
          .catch(() => null)
        confirmed = !!(rcpt && rcpt.blockNumber)
      }
      if (!confirmed) throw new Error(`Deposit ${depositTx} not confirmed yet — retry topup shortly`)
      const credited = await silk().portal('gastank', 'topup', {
        project_id: projectId,
        tx_hash: depositTx,
        chain_id: '0x' + chainId.toString(16) // backend U256 wants a hex string
      })
      return { depositTx, chainId, credited }
    })

  const setAllowlist = () =>
    run('3. set allowlist', async () => {
      if (!projectId) throw new Error('Run "Init project" first (need a projectId)')
      const from = await resolveFrom()
      if (!from) throw new Error('Log in first (admin_wallet required)')
      return silk().portal('gastank', 'update', {
        projectId,
        settings: {
          admin_wallets: [from],
          project_id: projectId,
          // allowlist is (chainId, contract-address) pairs the project will sponsor
          transactions_allowed_to: contract ? [[1, contract]] : [],
          domains_allowed: [window.location.origin],
          restrictions: null
        }
      })
    })

  const getSettings = () =>
    run(projectId ? 'check project tank' : 'check user tank', () =>
      silk().portal('gastank', 'get', projectId ? { project_id: projectId } : undefined)
    )

  const sponsoredTx = () =>
    run('4. send sponsored tx', async () => {
      const s = silk()
      const from =
        address || (await s.request({ method: 'eth_requestAccounts' }))?.[0]
      const to = (contract || from) as string
      if (!to) throw new Error('Log in first')
      const hash = await s.request({
        method: 'eth_sendTransaction',
        params: [{ from, to, value: '0x0' }]
      })
      return { hash, note: 'Sponsored iff projectId is set in initWaaP + tx is allowlisted + project tank funded' }
    })

  // Admin: allowlist (chain, holonym.eth) on every supported stablecoin chain, so a
  // native tx to holonym.eth from any of them is sponsored. Run once (Confirm the modal).
  const allowlistForSmartTest = () =>
    run('allowlist for smart test (admin)', async () => {
      if (!projectId) throw new Error('Run "Init project" first (need a projectId)')
      const from = await resolveFrom()
      if (!from) throw new Error('Log in first')
      return silk().portal('gastank', 'update', {
        projectId,
        settings: {
          admin_wallets: [from],
          project_id: projectId,
          transactions_allowed_to: STABLECOINS.map((c) => [c.chainId, HOLONYM]),
          domains_allowed: [window.location.origin],
          restrictions: null
        }
      })
    })

  // Any tester: auto-find a chain where they hold USDC but have ~no gas, switch there,
  // and send a 0-value tx to holonym.eth. No native gas -> the gas tank sponsors it.
  const smartSponsoredTx = () =>
    run('smart sponsored tx (USDC, no gas)', async () => {
      const s = silk()
      const from = await resolveFrom()
      if (!from) throw new Error('Log in first')
      const scan = await Promise.all(
        STABLECOINS.map(async (c) => {
          try {
            const [nativeHex, usdc] = await Promise.all([
              rpcCall(c.rpc, 'eth_getBalance', [from, 'latest']),
              usdcBalanceOf(c.rpc, c.usdc, from)
            ])
            return { ...c, native: BigInt(nativeHex || '0x0'), usdc }
          } catch {
            return { ...c, native: -1n, usdc: -1n }
          }
        })
      )
      const pick = scan.find((c) => c.usdc > 0n && c.native >= 0n && c.native < GAS_THRESHOLD)
      if (!pick) {
        return {
          note: 'No chain found where you hold USDC but have little/no ETH. Get some USDC on a chain and spend your ETH there, then retry.',
          scanned: scan.map((c) => ({
            chain: c.name,
            usdc: c.usdc.toString(),
            nativeWei: c.native.toString()
          }))
        }
      }
      await s.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + pick.chainId.toString(16) }]
      })
      const hash = await s.request({
        method: 'eth_sendTransaction',
        params: [{ from, to: HOLONYM, value: '0x0' }]
      })
      return {
        chain: pick.name,
        chainId: pick.chainId,
        usdc: pick.usdc.toString(),
        hash,
        note: 'Sent to holonym.eth with no gas of your own — sponsored by the project tank.'
      }
    })

  const btn = { padding: '8px 12px', margin: 4, cursor: 'pointer' } as const
  const input = {
    display: 'block',
    width: '100%',
    padding: 8,
    margin: '4px 0',
    boxSizing: 'border-box'
  } as const

  return (
    <div
      style={{
        maxWidth: 560,
        margin: '24px auto',
        padding: 16,
        border: '1px solid #FF5D18',
        borderRadius: 12,
        textAlign: 'left'
      }}
    >
      <h3 style={{ marginTop: 0 }}>⛽ App Gas Tank test</h3>
      <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 8 }}>
        Project ID:{' '}
        <code>{projectId || '(none — run Init, paste below, then reload)'}</code>
      </div>

      <input
        style={input}
        placeholder="projectId (paste after Init, then reload to activate sponsorship)"
        value={projectId}
        onChange={(e) => saveProjectId(e.target.value)}
      />
      <input
        style={input}
        placeholder="allowlist contract 0x… (leave blank to sponsor a self 0-value tx)"
        value={contract}
        onChange={(e) => setContract(e.target.value)}
      />
      <input
        style={input}
        placeholder="method selector 0xa9059cbb (optional)"
        value={method}
        onChange={(e) => setMethod(e.target.value)}
      />
      <input
        style={input}
        placeholder="fund chain id (1=Ethereum, 8453=Base, 10=Optimism)"
        value={depositChain}
        onChange={(e) => setDepositChain(e.target.value)}
      />

      <div style={{ marginTop: 8 }}>
        <button style={btn} onClick={initProject} disabled={!!busy}>
          1. Init project
        </button>
        <button style={btn} onClick={fund} disabled={!!busy}>
          2. Fund ($5)
        </button>
        <button style={btn} onClick={setAllowlist} disabled={!!busy}>
          3. Set allowlist
        </button>
        <button style={btn} onClick={getSettings} disabled={!!busy}>
          Check settings/balance
        </button>
        <button style={btn} onClick={sponsoredTx} disabled={!!busy}>
          4. Send sponsored tx
        </button>
      </div>

      <div
        style={{
          marginTop: 14,
          padding: 10,
          border: '1px dashed #FF5D18',
          borderRadius: 10,
          fontSize: 13
        }}
      >
        <b>⚡ Smart gasless test (any tester)</b>
        <div style={{ opacity: 0.85, margin: '6px 0' }}>
          Requirement: be signed into a wallet that holds <b>USDC on some chain
          but has little or no ETH (gas)</b> there. This finds that chain
          automatically and sends a 0-value tx to <code>holonym.eth</code> —
          with no gas of your own, the project tank pays.
          <br />
          <i>
            Admin: click “Allowlist for smart test” once first (a blank allowlist
            won’t sponsor).
          </i>
        </div>
        <button style={btn} onClick={allowlistForSmartTest} disabled={!!busy}>
          Allowlist for smart test (admin)
        </button>
        <button
          style={{ ...btn, background: '#FF5D18', color: '#fff', border: 'none' }}
          onClick={smartSponsoredTx}
          disabled={!!busy}
        >
          ⚡ Smart sponsored tx (USDC, no gas)
        </button>
      </div>

      {busy && <div style={{ marginTop: 8, opacity: 0.7 }}>running: {busy}…</div>}
      {out && (
        <pre
          style={{
            marginTop: 8,
            padding: 8,
            background: '#111',
            color: '#eee',
            borderRadius: 8,
            fontSize: 12,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}
        >
          {out}
        </pre>
      )}
    </div>
  )
}
