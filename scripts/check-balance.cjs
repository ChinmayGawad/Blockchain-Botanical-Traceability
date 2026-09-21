const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const envPath = path.resolve(__dirname, "..", ".env");
if (fs.existsSync(envPath) && typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(envPath);
  } catch (e) {}
}

async function main() {
  const networkName = hre.network.name;
  console.log("==================================================");
  console.log(`🔍 Checking Wallet Balance on [${networkName}]`);
  console.log("==================================================");

  const rawKey = process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY.trim() : "";
  if (!rawKey) {
    console.error("❌ No PRIVATE_KEY found in your .env file.");
    process.exit(1);
  }

  const formattedKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;
  const provider = hre.ethers.provider;
  const wallet = new hre.ethers.Wallet(formattedKey, provider);

  const balance = await provider.getBalance(wallet.address);
  const formattedBal = hre.ethers.formatEther(balance);

  console.log(`📍 Wallet Address : ${wallet.address}`);
  console.log(`💰 Current Balance: ${formattedBal} ${networkName === "sepolia" ? "SepoliaETH" : "POL/MATIC"}`);

  if (balance === 0n) {
    console.log("\n⚠️ Balance is 0. Please request testnet tokens from the faucet:");
    if (networkName === "amoy") {
      console.log("   👉 https://faucet.polygon.technology/");
    } else if (networkName === "sepolia") {
      console.log("   👉 https://sepoliafaucet.com/ or https://cloud.google.com/application/web3/faucet/ethereum/sepolia");
    }
  } else {
    console.log("\n🎉 Wallet is funded and READY for smart contract deployment!");
  }
  console.log("==================================================");
}

main().catch(console.error);
