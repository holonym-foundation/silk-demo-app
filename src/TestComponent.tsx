import Login from "./components/Login";
import LoginSelector from "./components/LoginSelector";
import ConnectAccount from "./components/ConnectAccount";
import SwitchChains from "./components/SwitchChains";
import Balance from "./components/Balance";
import PersonalSign from "./components/PersonalSign";
import EthSignTypedData from "./components/EthSignTypedData";
import Transactions from "./components/Transactions";
import RequestEmail from "./components/RequestEmail";
import RequestSbt from "./components/RequestSbt";
import EthSignTypedDataSdk from "./components/EthSignTypedDataSdk";
import Whitelabel from "./components/Whitelabel";

function TestComponent() {
  return (
    <div>
      <Login />
      <LoginSelector />
      {/* <Whitelabel /> */}
      <ConnectAccount />
      <SwitchChains />
      <Balance />
      <PersonalSign />
      {/* <EthSignTypedDataSdk /> */}
      <EthSignTypedData />
      <Transactions />
      <RequestEmail />
      <RequestSbt />
    </div>
  );
}

export default TestComponent;
