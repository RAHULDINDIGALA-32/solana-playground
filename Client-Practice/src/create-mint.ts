import type { Client } from "./client"
import { getCreateAccountInstruction } from "@solana-program/system";
import { generateKeyPairSigner, createTransactionMessage, pipe, setTransactionMessageFeePayerSigner, setTransactionMessageLifetimeUsingBlockhash, appendTransactionMessageInstructions, appendTransactionMessageInstruction, signTransactionMessageWithSigners, assertIsSendableTransaction, SendableTransaction } from "@solana/kit";
import { TOKEN_PROGRAM_ADDRESS, getMintSize, getInitializeMintInstruction } from "@solana-program/token";
import { getSetComputeUnitLimitInstruction, getSetComputeUnitPriceInstruction, estimateComputeUnitLimitFactory } from "@solana-program/compute-budget";

export async function createMint(client: Client, options: {decimals?: number}= {}) {

    const mintSize = getMintSize();
    const [mint, mintRent] = await Promise.all([
        generateKeyPairSigner(),
        client.rpc.getMinimumBalanceForRentExemption(BigInt(mintSize)).send(),
    ])


    const createAccountIxn = getCreateAccountInstruction({
        payer: client.wallet,
        newAccount: mint,
        space: mintSize,
        lamports: mintRent,
        programAddress: TOKEN_PROGRAM_ADDRESS,
    });

    const initializeMintIxn = getInitializeMintInstruction({
        mint: mint.address,
        decimals: options.decimals ?? 0,
        mintAuthority: client.wallet.address ,
        freezeAuthority: client.wallet.address,
    });


    const {value: latestBlockHash } = await client.rpc.getLatestBlockhash().send();

    const transactionMessage = await pipe(
    createTransactionMessage({version: 0}),
    (txn) => setTransactionMessageFeePayerSigner(client.wallet, txn),
    (txn) => setTransactionMessageLifetimeUsingBlockhash(latestBlockHash, txn),
    (txn) => appendTransactionMessageInstructions([createAccountIxn, initializeMintIxn], txn),
    (txn) => client.estimateAndSetComputeUnitLimit(txn),
);

    // const estimateComputeUnitLimit = estimateComputeUnitLimitFactory({rpc: client.rpc});
    // const computeUnitsEstimate = await estimateComputeUnitLimit(transactionMessage)

    // const transactioMessageWithComputeUnitLimit = appendTransactionMessageInstruction(
    //     getSetComputeUnitLimitInstruction({ units: computeUnitsEstimate }),
    //     transactionMessage
    // )

    const transaction = await signTransactionMessageWithSigners(transactionMessage);
    assertIsSendableTransaction(transaction);
    transaction satisfies SendableTransaction;

}

const setComputeLimitIxn = getSetComputeUnitLimitInstruction({
    units: 50_000,
});

const setComputePriceIxn = getSetComputeUnitPriceInstruction({
    microLamports: 10_000,
});





