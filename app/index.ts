import { Connection, PublicKey } from '@solana/web3.js';
import { getGmIDL } from '@staratlas/factory';
import { Idl } from '@project-serum/anchor';
import { SolanaParser } from '@shyft.to/solana-transaction-parser';

//import { SolanaParser } from '@sonarwatch/solana-transaction-parser';
import { connectDB, disconnectDB } from './database';
import { Exchange } from './TradeSchema';
import * as process from 'process';
import { ParseError } from './ParseErrorSchema';

const LIMIT = 100;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function save_trade_to_db(parsed: any, signature: String, timestamp: number) {
  parsed?.forEach((p: any) => {
    if (p.name == 'processExchange') {
      let exchange = new Exchange({
        timestamp: timestamp,
        signature: signature,
        assetMint: p.accounts
          .find((account: any) => account.name == 'assetMint')
          .pubkey.toString(),
        currencyMint: p.accounts
          .find((account: any) => account.name == 'currencyMint')
          .pubkey.toString(),
        orderTaker: p.accounts
          .find((account: any) => account.name == 'orderTaker')
          .pubkey.toString(),
        orderInitializer: p.accounts
          .find((account: any) => account.name == 'orderInitializer')
          .pubkey.toString(),
        size: p.args.purchaseQuantity.toNumber(),
        price: p.args.expectedPrice.toString() * Math.pow(10, -8),
        cost:
          p.args.expectedPrice.toString() *
          p.args.purchaseQuantity.toString() *
          Math.pow(10, -8),
      });
      exchange.save().catch(err => {
        if (!(err.code == 11000)) {
          console.log(err);
        }
      });

      console.log('processExchange [saved]');
    }
  });
}

let running = true;
console.log('--- Starting ---');
console.log('-> Mode: %s', process.env.MODE);
async function main(): Promise<void> {
  if (process.env.MODE) {
    //INITIALIZATION
    connectDB();
    while (running) {
      const client = new Connection('https://solana-mainnet.rpc.extrnode.com');
      const programm_key = new PublicKey(
        'traderDnaR5w6Tcoi3NFm53i48FTDNbGjBSZwWXDRrg'
      );
      const txParser = new SolanaParser([
        {
          idl: getGmIDL(programm_key) as unknown as Idl,
          programId: programm_key,
        },
      ]);

      let signatures = [];
      switch (process.env.MODE) {
        // Fetches old transactions
        case 'SYNC':
          let exchange_oldest = await Exchange.aggregate([
            {
              $sort: {
                timestamp: 1,
              },
            },
            {
              $limit: 1,
            },
          ]);
          signatures = await client.getSignaturesForAddress(
            new PublicKey('traderDnaR5w6Tcoi3NFm53i48FTDNbGjBSZwWXDRrg'),
            {
              before: exchange_oldest[0]?.signature,
              limit: LIMIT,
            }
          );
          break;
        // Fetches new transactions
        case 'LOOP':
          let exchange_newest = await Exchange.aggregate([
            {
              $sort: {
                timestamp: -1,
              },
            },
            {
              $limit: 1,
            },
          ]);
          signatures = await client.getSignaturesForAddress(
            new PublicKey('traderDnaR5w6Tcoi3NFm53i48FTDNbGjBSZwWXDRrg'),
            {
              until: exchange_newest[0]?.signature,
              limit: LIMIT,
            }
          );
          break;
        // Retry failed to parse transactions
        case 'RETRY':
          signatures = await ParseError.aggregate([
            {
              $sort: {
                timestamp: 1,
              },
            },
            {
              $limit: 100,
            },
          ]);

          break;
      }

      if (signatures.length > 0) {
        console.log(
          'Staring with: %s at %i',
          signatures[0].signature,
          signatures[0]?.timestamp | signatures[0]?.blockTime
        );
        console.log('Got %i of %i', signatures.length, LIMIT);
        for (const signature of signatures) {
          let is_failed = false;
          const parsed = await txParser
            .parseTransaction(client, signature.signature, true)
            .catch(err => {
              console.log(err);
              if (err.code == 503 || err.code == 'ERR_SOCKET_TIMEOUT') {
                console.log('closing app');
                running = false;
              }
              console.log('Error while signature: %s', signature.signature);
              let parseError = new ParseError({
                timestamp: signature.blockTime,
                signature: signature.signature,
              });
              is_failed = true;
              parseError.save().catch(err => {
                if (!(err.code == 11000)) {
                  console.log(err);
                }
              });
            });

          if (!is_failed) {
            save_trade_to_db(
              parsed,
              signature.signature,
              signature.blockTime ?? 0
            );
          }
          await sleep(1000);
        }
      }
      await sleep(3000);
    }
    disconnectDB();
  } else {
    console.log('Please set the ENV:(MODE) to [LOOP | SYNC | RETRY]');
  }
}

main()
  .then(() => {
    console.log('--- END ---');
  })
  .catch(err => console.log(err));
