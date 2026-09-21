const { ethers } = require("ethers");

async function main() {
  console.log("==================================================");
  console.log("🔑 Generating a Fresh Deployer Wallet for FloraChain");
  console.log("==================================================");

  const wallet = ethers.Wallet.createRandom();

  console.log("\n✅ Wallet Generated Successfully!\n");
  console.log(`📍 Public Address: ${wallet.address}`);
  console.log(`🔐 Private Key   : ${wallet.privateKey}`);
  console.log(`📜 Mnemonic Phrase: ${wallet.mnemonic.phrase}`);
  console.log("\n--------------------------------------------------");
  console.log("👉 NEXT STEPS TO FUND THIS WALLET WITH FREE TEST TOKENS:");
  console.log("--------------------------------------------------");
  console.log("1. Copy the Public Address above.");
  console.log("2. Open the free Polygon Amoy Faucet in your browser:");
  console.log("   🔗 https://faucet.polygon.technology/");
  console.log("3. Select 'Polygon PoS (Amoy)' -> Token: 'POL'.");
  console.log("4. Paste your Public Address and click 'Submit'.");
  console.log("5. Put the Private Key into your .env file as:");
  console.log(`   PRIVATE_KEY=${wallet.privateKey}`);
  console.log("==================================================");
}

main().catch(console.error);
