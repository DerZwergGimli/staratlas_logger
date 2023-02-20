import {Connection, PublicKey} from "@solana/web3.js";
import {getGmIDL, GmEventService, GmEventType, OrderType} from "@staratlas/factory";
import {createTransactionFromInstructions} from "@staratlas/factory/dist/marketplace/services/helpers";
import {Order} from "@staratlas/factory/dist/marketplace/models/Order";
import {getIDL} from "@staratlas/factory";
import {BorshCoder, Idl} from '@project-serum/anchor';
import { serialize, deserialize, deserializeUnchecked } from "borsh";
import { SolanaParser } from "@sonarwatch/solana-transaction-parser";
import {connect, disconnect} from "./database";
import mongoose from "mongoose";
import {Exchange } from "./TradeSchema";

//import { SolanaParser } from "@debridge-finance/solana-transaction-parser";

const LIMIT = 100;

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const get_last = [
    {
        '$sort': {
            'timestamp': -1
        }
    }, {
        '$limit': 1
    }
];

console.log("Starting")
async function main(): Promise<void> {
    const client = new Connection("https://solana-mainnet.rpc.extrnode.com");
    //const txParser = new SolanaParser([{ idl: getGmIDL(new PublicKey("JUP2jxvXaqu7NQY1GmNF4m1vodw12LVXYxbFL2uJvfo")) as unknown as Idl, programId: "JUP2jxvXaqu7NQY1GmNF4m1vodw12LVXYxbFL2uJvfo" }]);
    connect();

    const programm_key = new PublicKey("traderDnaR5w6Tcoi3NFm53i48FTDNbGjBSZwWXDRrg");

    const txParser = new SolanaParser([{
        idl: getGmIDL(programm_key) as unknown as Idl,
        programId: programm_key
    }])
    let exchnage_newest = await  Exchange.aggregate([
        {
            '$sort': {
                'timestamp': -1
            }
        }, {
            '$limit': 1
        }
    ])
    let exchnage_oldest = await  Exchange.aggregate([
        {
            '$sort': {
                'timestamp': 1
            }
        }, {
            '$limit': 1
        }
    ])
    console.log(exchnage_newest)
    console.log(exchnage_oldest)

    let signatures =  await client.getSignaturesForAddress(new PublicKey("traderDnaR5w6Tcoi3NFm53i48FTDNbGjBSZwWXDRrg") , {
        before: exchnage_oldest[0].signature,
        limit: LIMIT
    })

    console.log("Got %i of %i", signatures.length, LIMIT)

    //signatures_array = ['4hnV2t4zQtdza4uYUfKUHDTU9exo5VUfRBbv5ZwnthTE9bEv2rSCm6skz759s6FERUnnqCsunoadEyXAKSKErF1S']

    for (const signature of signatures) {
        const parsed = await txParser.parseTransaction(client, signature.signature, false).catch(()=> {
            console.log("Error while signature: %s", signature.signature)
        })

        parsed?.forEach((p: any) => {

            if(p.name == ('processExchange'))
            {



                let exchange = new Exchange({
                    timestamp: signature.blockTime,
                    signature: signature.signature,
                    assetMint:  p.accounts.find((account: any) => account.name == 'assetMint').pubkey.toString(),
                    currencyMint:  p.accounts.find((account: any) => account.name == 'currencyMint').pubkey.toString(),
                    orderTaker:  p.accounts.find((account: any) => account.name == 'orderTaker').pubkey.toString(),
                    orderInitializer:  p.accounts.find((account: any) => account.name == 'orderInitializer').pubkey.toString(),
                    size:   p.args.purchaseQuantity.toNumber(),
                    price:  p.args.expectedPrice.toString() * Math.pow(10, -8),
                    cost: p.args.expectedPrice.toString() * p.args.purchaseQuantity.toString() * Math.pow(10, -8)
                })
                 exchange.save().catch((err) => console.log(err))

                //exchange.save()
                console.log("processExchange")
                console.log(signature)
               // console.log(p)
                console.log("assetMint: \t%s", p.accounts.find((account: any) => account.name == 'assetMint').pubkey.toString())
                console.log("currencyMint: \t%s", p.accounts.find((account: any) => account.name == 'currencyMint').pubkey.toString())
                console.log("orderTaker: \t%s", p.accounts.find((account: any) => account.name == 'orderTaker').pubkey.toString())
                console.log("orderInitializer: \t%s", p.accounts.find((account: any) => account.name == 'orderInitializer').pubkey.toString())



                console.log("Size: %s", p.args.purchaseQuantity.toString())
                console.log("Price: %f", p.args.expectedPrice.toString() * Math.pow(10, -8))
                console.log("Cost: %f",p.args.expectedPrice.toString() * p.args.purchaseQuantity.toString() * Math.pow(10, -8))
            }

        })

        console.log("---------------------------------------------")
        await  sleep(3000);

//        console.log(parsed)
    }
    disconnect()


}

main().then(() => {}).catch((err) => console.log(err))





