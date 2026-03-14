import type { Client } from "./client"
import { getCreateAccountInstruction } from "@solana-program/system";
import { generateKeyPairSigner } from "@solana/kit";
import { TOKEN_PROGRAM_ADDRESS, getMintSize, getInitializeMintInstruction } from "@solana-program/token";
import { getSetComputeUnitLimitInstruction, getSetComputeUnitPriceInstruction } from "@solana-program/compute-budget";

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

}

const setComputeLimitIxn = getSetComputeUnitLimitInstruction({
    units: 50_000,
});

const setComputePriceIxn = getSetComputeUnitPriceInstruction({
    microLamports: 10_000,
});



