import { useState } from 'react'
import { useAccount } from 'wagmi'

// The gas-tank admin operations are exposed on the SDK provider via `silk.portal`.
// It isn't in the public typing (it was Dev-Portal-only), so we reach it off window.
const silk = () => (window as any).silk

// The single gas-tank deposit wallet (same address on every EVM chain). All
// top-ups deposit here; the backend credits the chosen virtual tank. Source of
// truth is GET <gastankOrigin>/health/balances; hardcoded here for the harness.
const GASTANK_DEPOSIT = '0xb1D9dB6bD3c7F9a8ed824C5e1Ad6f6EDbABD8e1E'

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
        chain_id: chainId
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
          transactions_allowed_to: contract ? [[1, contract]] : []
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
