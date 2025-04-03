import {
  useAccount,
  useSwitchChain,
} from "wagmi";
import { hardhat } from "wagmi/chains";


function SwitchChains() {
  const { chain } = useAccount();
  const { switchChain, error } = useSwitchChain();

  return (
    <div>
      <div>
        <div>
          <h2>Switch Chains Demo</h2>
          <p>Connected to: {chain?.name}</p>
          <button 
            onClick={() => {
              if (switchChain) {
                switchChain({chainId: 1})
              } else {
                console.error('switchChain is not defined')
              }
            }} 
            className="button"
          >
            Switch to Ethereum Mainnet
          </button>
        </div>
        
        <div>
          <button 
            onClick={() => {
              if (switchChain) {
                switchChain({chainId: 11155111})
              } else {
                console.error('switchChain is not defined')
              }
            }} 
            className="button"
          >
            Switch to Ethereum Sepolia
          </button>
        </div>

        <div>
          <button 
            onClick={() => {
              if (switchChain) {
                switchChain({chainId: 137})
              } else {
                console.error('switchChain is not defined')
              }
            }} 
            className="button"
          >
            Switch to Polygon PoS
          </button>
        </div>

        <div>
          <button 
            onClick={() => {
              if (switchChain) {
                switchChain({chainId: 100})
              } else {
                console.error('switchChain is not defined')
              }
            }} 
            className="button"
          >
            Switch to Gnosis
          </button>
        </div>

        <div>
          <button 
            onClick={() => {
              if (switchChain) {
                switchChain({chainId: 10})
              } else {
                console.error('switchChain is not defined')
              }
            }} 
            className="button"
          >
            Switch to Optimism
          </button>
        </div>

        <div>
          <button 
            onClick={() => {
              if (switchChain) {
                switchChain({chainId: 84532})
              } else {
                console.error('switchChain is not defined')
              }
            }} 
            className="button"
          >
            Switch to Base Sepolia
          </button>
        </div>

        {process.env.NODE_ENV == 'development' && (
          <div>
            <button 
              onClick={() => {
                if (switchChain) {
                  switchChain({chainId: hardhat.id})
                } else {
                  console.error('switchChain is not defined')
                }
              }} 
              className="button"
            >
              Switch to Local Hardhat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SwitchChains;
