import { address, unwrapOption } from "@solana/kit";
import { fetchMint, Mint } from "@solana-program/token";
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
    console.log(`\nCreated Mint account : ${mintAddress.toString()}`);

    // Fetch the mint account data to verify it was created correctly( using program-client)
    const mintAccount = await fetchMint(client.rpc, mintAddress);
    console.log(`Mint account data:`);
    console.log(`Mint Address: ${mintAddress}`);
    console.log(`Mint LamportsZ: ${mintAccount.lamports}`);
    console.log(`Decimals: ${mintAccount.data.decimals}`);
    console.log(`Mint Authority: ${unwrapOption(mintAccount.data.mintAuthority)}`);
    console.log(`Freeze Authority: ${unwrapOption(mintAccount.data.freezeAuthority)}`);
    console.log(`Supply: ${mintAccount.data.supply}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});