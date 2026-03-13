import { address } from "@solana/kit";
import { createClient } from "./client";


async function fetchBalance() {
    const client = createClient();
    const account = address('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');
    const {value: balance } = await client.rpc.getBalance(account).send();
    console.log(`Balance of ${account.toString()}: ${balance}`);
}

fetchBalance();