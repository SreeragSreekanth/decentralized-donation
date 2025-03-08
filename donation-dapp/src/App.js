import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "bootstrap/dist/css/bootstrap.min.css";

const contractAddress = "0x24B560A8E76B27199D4D4aC3A195fA61c8653b15"; // Replace with your actual contract address
const contractABI = [
    { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
    { "inputs": [], "name": "donate", "outputs": [], "stateMutability": "payable", "type": "function" },
    { "inputs": [], "name": "getBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

function App() {
    const [walletAddress, setWalletAddress] = useState(null);
    const [contract, setContract] = useState(null);
    const [balance, setBalance] = useState("0");
    const [donationAmount, setDonationAmount] = useState("");

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", (accounts) => {
                if (accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                } else {
                    setWalletAddress(null);
                    setContract(null);
                }
            });
        }
    }, []);

    async function connectWallet() {
        if (window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                await provider.send("eth_requestAccounts", []);
                const signer = await provider.getSigner();
                setWalletAddress(await signer.getAddress());

                const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
                setContract(contractInstance);

                getBalance(contractInstance);
            } catch (error) {
                console.error("Connection failed", error);
                alert("Failed to connect wallet. Try again.");
            }
        } else {
            alert("Please install MetaMask!");
        }
    }

    async function getBalance(contractInstance = contract) {
      if (!contractInstance) {
          console.error("Contract not initialized");
          return;
      }
  
      try {
          const balance = await contractInstance.getBalance();
          setBalance(ethers.formatEther(balance));
      } catch (error) {
          console.error("Error fetching balance:", error);
          alert("Failed to fetch balance. Make sure the contract is deployed and the address is correct.");
      }
  }
  

    async function donate() {
        if (!contract) return alert("Connect wallet first!");
        if (!donationAmount) return alert("Enter donation amount!");

        const tx = await contract.donate({ value: ethers.parseEther(donationAmount) });
        await tx.wait();
        alert("Donation successful!");
        getBalance();
    }

    async function withdraw() {
        if (!contract) return alert("Connect wallet first!");
        try {
            const tx = await contract.withdraw();
            await tx.wait();
            alert("Withdraw successful!");
            getBalance();
        } catch (error) {
            alert("You are not the owner!");
        }
    }

    return (
        <div className="container text-center mt-5">
            <nav className="navbar navbar-dark bg-dark mb-4">
                <div className="container">
                    <span className="navbar-brand">💰 Donation DApp</span>
                </div>
            </nav>

            <h1 className="mb-4">Donation Smart Contract</h1>

            {walletAddress ? (
                <p className="text-success">Connected: {walletAddress}</p>
            ) : (
                <button className="btn btn-primary mb-3" onClick={connectWallet}>
                    Connect Wallet
                </button>
            )}

            <div className="card p-4 shadow-sm mb-4">
                <h3>Contract Balance: {balance} ETH</h3>
                <button className="btn btn-success mt-2" onClick={() => getBalance()}>
                    Refresh Balance
                </button>
            </div>

            <div className="card p-4 shadow-sm mb-4">
                <h3>Donate ETH</h3>
                <input
                    type="text"
                    className="form-control mt-2 mb-3"
                    placeholder="Enter amount in ETH"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                />
                <button className="btn btn-warning" onClick={donate}>
                    Donate
                </button>
            </div>

            <div className="card p-4 shadow-sm">
                <h3>Owner Actions</h3>
                <button className="btn btn-danger mt-2" onClick={withdraw}>
                    Withdraw Funds
                </button>
            </div>
        </div>
    );
}

export default App;
