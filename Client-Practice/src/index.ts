import { address } from "@solana/kit";
import { createClient } from "./client";
import { createMint } from "./create-mint";

const client = await createClient();

async function fetchBalance() {
    
   // const account = address('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');
   const account = address(client.wallet.address);
    const {value: balance } = await client.rpc.getBalance(account).send();
    console.log(`Balance of ${account.toString()}: ${balance}`);
}

fetchBalance();

async function main() {
    const mintAddress = await createMint(client, { decimals: 2 });
    console.log(`\n Created Mint account : ${mintAddress.toString()}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});