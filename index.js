import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [action, setAction] = useState(null);
  const [amount, setAmount] = useState(null);
  const [message, setMessage] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [showTransactions, setShowTransactions] = useState(false);
  const [peracetamolCount, setPeracetamolCount] = useState(0);
  const [aspirinCount, setAspirinCount] = useState(0);
  const [penicillinCount, setPenicillinCount] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  // Splitting logic into smaller blocks
  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    } else {
      console.log("Ethereum object not found");
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account && account.length > 0) {
      const userAccount = account;
      console.log("Account connected: ", userAccount);
      setAccount(userAccount);
    } else {
      console.log("No account found or MetaMask is locked.");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    const userAccounts = accounts;
    handleAccount(userAccounts);

    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContractInstance = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContractInstance);
  };

  const getBalance = async () => {
    if (atm) {
      const balanceInContract = await atm.getBalance();
      const convertedBalance = balanceInContract.toNumber();
      setBalance(convertedBalance);
    } else {
      console.log("ATM contract not initialized.");
    }
  };

  const performTransaction = async (transactionAction, transactionAmount) => {
    if (atm) {
      let transaction;
      if (transactionAction === "deposit") {
        transaction = await atm.deposit(transactionAmount);
      } else if (transactionAction === "withdraw") {
        transaction = await atm.withdraw(transactionAmount);
      }

      await transaction.wait();
      const updatedTransactions = [...transactions];
      updatedTransactions.push({ action: transactionAction, amount: transactionAmount, timestamp: new Date().toLocaleString() });
      setTransactions(updatedTransactions);

      getBalance();
      setAction(null);
      setAmount(null);
      setMessage(`Transaction of ${transactionAmount} ETH ${transactionAction}ed successfully.`);
    }
  };

  // New medicine functions
  const buyMedicine = async (medicineType) => {
    if (atm) {
      let tx;
      if (medicineType === "peracetamol") {
        tx = await atm.buyPeracetamol();
        const updatedCount = peracetamolCount + 1;
        setPeracetamolCount(updatedCount);
      } else if (medicineType === "aspirin") {
        tx = await atm.buyAspirin();
        const updatedCount = aspirinCount + 1;
        setAspirinCount(updatedCount);
      } else if (medicineType === "penicillin") {
        tx = await atm.buyPenicillin();
        const updatedCount = penicillinCount + 1;
        setPenicillinCount(updatedCount);
      }
      await tx.wait();
      setMessage(`${medicineType} purchased successfully.`);
      getTotalProducts();
    }
  };

  const getTotalProducts = async () => {
    if (atm) {
      const totalProductCount = await atm.numberOfProducts();
      const totalConverted = totalProductCount.toNumber();
      setTotalProducts(totalConverted);
    } else {
      console.log("ATM contract not initialized for product count.");
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    if (showTransactions) {
      const transactionsList = transactions.map((tx, index) => {
        return <li key={index}>{`${tx.timestamp} - ${tx.action}ed ${tx.amount} ETH`}</li>;
      });

      return (
        <div>
          <p>Your Account: {account}</p>
          <p>Your Balance: {balance}</p>
          <button className="back-btn" onClick={() => setShowTransactions(false)}>Back</button>
          <h3>Transaction History</h3>
          <ul>{transactionsList}</ul>
        </div>
      );
    }

    const productList = (
      <div>
        <h3>Medicines Bought:</h3>
        <p>Peracetamol: {peracetamolCount}</p>
        <p>Aspirin: {aspirinCount}</p>
        <p>Penicillin: {penicillinCount}</p>
        <p>Total Products: {totalProducts}</p>
      </div>
    );

    const buttonsGroup = (
      <div className="button-group">
        <button className="action-btn" onClick={() => setAction("deposit")}>Deposit</button>
        <button className="action-btn" onClick={() => setAction("withdraw")}>Withdraw</button>
        <button className="action-btn" onClick={() => buyMedicine("peracetamol")}>Buy Peracetamol</button>
        <button className="action-btn" onClick={() => buyMedicine("aspirin")}>Buy Aspirin</button>
        <button className="action-btn" onClick={() => buyMedicine("penicillin")}>Buy Penicillin</button>
        <button className="action-btn" onClick={getTotalProducts}>Get Total Products Bought</button>
        <button className="action-btn" onClick={() => setShowTransactions(true)}>Check Transactions</button>
      </div>
    );

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <p>{message || "What would you like to do?"}</p>
        {buttonsGroup}
        {productList}
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header><h1>Welcome to the Ether Exchange!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          background-color: #e6ffe6;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-family: 'Arial', sans-serif;
        }

        .button-group {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 20px;
        }

        button {
          background-color: #ff85a2;
          border: none;
          border-radius: 25px;
          padding: 15px 30px;
          font-size: 18px;
          color: #fff;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.3s ease;
        }

        button:hover {
          background-color: #ff4f70;
          transform: translateY(-2px);
        }

        .back-btn {
          background-color: #b0e0e6;
        }

        .back-btn:hover {
          background-color: #7ec0ee;
        }

        .action-btn {
          width: 200px;
        }
      `}</style>
    </main>
  );
}
