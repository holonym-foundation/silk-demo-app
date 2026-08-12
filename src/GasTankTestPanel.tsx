import { useState } from 'react'
import { useAccount, useSendTransaction } from 'wagmi'

// The gas-tank admin operations are exposed on the SDK provider via `silk.portal`.
// It isn't in the public typing (it was Dev-Portal-only), so we reach it off window.
const silk = () => (window as any).silk

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
  const { sendTransactionAsync } = useSendTransaction()

  const [projectId, setProjectId] = useState(
    localStorage.getItem('demo_project_id') || ''
  )
  const [contract, setContract] = useState('')
  const [method, setMethod] = useState('') // 4-byte selector, e.g. 0xa9059cbb
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

  const initProject = () =>
    run('1. init project', async () => {
      if (!address) throw new Error('Log in / connect a wallet first — admin_wallet is required')
      const res: any = await silk().portal('project', 'init', { admin_wallet: address })
      const pid = res?.projectId || res?._id || res?.project_id || res?.id
      if (pid) saveProjectId(pid)
      return res
    })

  const fund = () => run('2. fund ($5)', () => silk().portal('gastank', 'topup'))

  const setAllowlist = () =>
    run('3. set allowlist', () =>
      silk().portal('gastank', 'update', {
        domainAllowlist: [window.location.origin],
        contractsAllowlist: contract ? { [contract]: method ? [method] : [] } : {}
      })
    )

  const getSettings = () =>
    run('check settings/balance', () => silk().portal('gastank', 'get'))

  const sponsoredTx = () =>
    run('4. send sponsored tx', async () => {
      const to = (contract || address) as `0x${string}`
      if (!to) throw new Error('Connect a wallet or enter a contract first')
      const hash = await sendTransactionAsync({ to, value: 0n })
      return { hash, note: 'Sponsored iff projectId is set in initWaaP + tx is allowlisted' }
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
