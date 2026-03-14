import { Rpc, RpcSubscriptions, SolanaRpcApi, SolanaRpcSubscriptionsApi } from "@solana/kit"
import { createSolanaRpc, createSolanaRpcSubscriptions, sendAndConfirmTransactionFactory } from "@solana/kit";
import { airdropFactory, lamports, generateKeyPairSigner, MessageSigner, TransactionSigner } from "@solana/kit";
import { appendTransactionMessageInstruction, TransactionMessage, TransactionMessageWithFeePayer } from '@solana/kit';
import { estimateComputeUnitLimitFactory, getSetComputeUnitLimitInstruction } from '@solana-program/compute-budget';

export type Client = {
    estimateAndSetComputeUnitLimit: ReturnType<typeof estimateAndSetComputeUnitLimitFactory>;
    rpc: Rpc<SolanaRpcApi>;
    rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
    sendAndConfirmTransaction: ReturnType<typeof sendAndConfirmTransactionFactory>;
    wallet: TransactionSigner & MessageSigner;
}

let client: Client | undefined;
export async function createClient(): Promise<Client> {
    if (!client) {
        // const rpc = createSolanaRpc("https://api.devnet.solana.com");
        // const rpcSubscriptions = createSolanaRpcSubscriptions("wss://api.devnet.solana.com");
        const rpc = createSolanaRpc("http://127.0.0.1:8899"); // ensure you have a local Solana node running on this endpoin (solan-test-validator)
        const rpcSubscriptions = createSolanaRpcSubscriptions("ws://127.0.0.1:8900");
        const airdrop = airdropFactory({ rpc, rpcSubscriptions });

        const wallet = await generateKeyPairSigner();
        await airdrop({
            recipientAddress: wallet.address,
            lamports: lamports(1_000_000_000n),
            commitment: "confirmed",
        });

        const estimateAndSetComputeUnitLimit = estimateAndSetComputeUnitLimitFactory({rpc});
        const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({rpc, rpcSubscriptions});

        client = { estimateAndSetComputeUnitLimit, rpc, rpcSubscriptions, sendAndConfirmTransaction, wallet };
    }
    return client;
}


function estimateAndSetComputeUnitLimitFactory( ...params: Parameters<typeof estimateComputeUnitLimitFactory>) {
    const estimateComputeUnitLimit = estimateComputeUnitLimitFactory(...params);

    return async <T extends TransactionMessage & TransactionMessageWithFeePayer>(transactionMessage: T) => {
        const computeUnitsEstimate = await estimateComputeUnitLimit(transactionMessage)

        return appendTransactionMessageInstruction(
            getSetComputeUnitLimitInstruction({ units: computeUnitsEstimate }),
            transactionMessage
        )
    }
}
