import {Connection, PublicKey} from "@solana/web3.js";
import {getGmIDL, GmEventService, GmEventType, OrderType} from "@staratlas/factory";
import {createTransactionFromInstructions} from "@staratlas/factory/dist/marketplace/services/helpers";
import {Order} from "@staratlas/factory/dist/marketplace/models/Order";
import {getIDL} from "@staratlas/factory";
import {BorshCoder, Idl} from '@project-serum/anchor';
import { serialize, deserialize, deserializeUnchecked } from "borsh";
import { SolanaParser } from "@sonarwatch/solana-transaction-parser";
function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

console.log("Starting")
async function main(): Promise<void> {
    const client = new Connection("https://solana-mainnet.rpc.extrnode.com");
    //const txParser = new SolanaParser([{ idl: getGmIDL(new PublicKey("JUP2jxvXaqu7NQY1GmNF4m1vodw12LVXYxbFL2uJvfo")) as unknown as Idl, programId: "JUP2jxvXaqu7NQY1GmNF4m1vodw12LVXYxbFL2uJvfo" }]);

    const programm_key = new PublicKey("traderDnaR5w6Tcoi3NFm53i48FTDNbGjBSZwWXDRrg");
    const txParser = new SolanaParser([{
        idl: getGmIDL(programm_key) as unknown as Idl,
        programId: programm_key
    }])

    let signatures =  await client.getSignaturesForAddress(new PublicKey("traderDnaR5w6Tcoi3NFm53i48FTDNbGjBSZwWXDRrg") , {
        limit: 20
    })



    let signatures_array =  signatures.map(sign => sign.signature)
    console.log(signatures_array)

    for (const signature of signatures_array) {
        const parsed = await txParser.parseTransaction(client, signature, false).catch(()=> {
            console.log("Error while signature: %s", signature)
        })
        parsed?.forEach(p => {
            console.log(p.name)
            if(p.name.includes( 'processExchange')) {
                console.log(p.args)
            }


        })
        console.log("---------------------------------------------")
        await  sleep(3000);

//        console.log(parsed)
    }


}

main().then(() => {}).catch((err) => console.log(err))





