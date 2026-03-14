import { address } from "@solana/kit";
import { createClient } from "./client";


async function fetchBalance() {
    const client = await createClient();
   // const account = address('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');
   const account = address(client.wallet.address);
    const {value: balance } = await client.rpc.getBalance(account).send();
    console.log(`Balance of ${account.toString()}: ${balance}`);
}

fetchBalance();