import { connectDB } from './database';
import { StarAtlasNFT } from './staratlasnft';
import fetch from 'node-fetch';
import { Connection, PublicKey } from '@solana/web3.js';
import { SolanaParser } from '@shyft.to/solana-transaction-parser';
import { getGmIDL } from '@staratlas/factory';
import { Idl } from '@project-serum/anchor';
import process from 'process';
import { Exchange } from './TradeSchema';
import { ParseError } from './ParseErrorSchema';
import { get_Currencies } from './currencies';

export function connect_to_db() {
  console.log('Connecting to DB...');
  connectDB();
}

export async function fetch_sa_assets(): Promise<Array<StarAtlasNFT>> {
  console.log('Fetching SA assets...');
  let staratlas_api: Array<StarAtlasNFT> = [];

  await fetch('https://galaxy.staratlas.com/nfts')
    .then(res => res.json())
    .then(json => (staratlas_api = json))
    .catch(err => {
      console.log('Error while fetching API');
      console.log(err);
    });
  return staratlas_api;
}

export async function init_worker_and_get_from_db(
  client: Connection
): Promise<Array<any>> {
  const LIMIT = parseInt(process.env.LIMIT ?? '100');
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
      await client
        .getSignaturesForAddress(
          new PublicKey('traderDnaR5w6Tcoi3NFm53i48FTDNbGjBSZwWXDRrg'),
          {
            before: exchange_oldest[0]?.signature,
            limit: LIMIT,
          }
        )
        .then(resp => (signatures = resp))
        .catch(err => {
          console.log('error while fetching sig');
        });
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
      await client
        .getSignaturesForAddress(
          new PublicKey('traderDnaR5w6Tcoi3NFm53i48FTDNbGjBSZwWXDRrg'),
          {
            until: exchange_newest[0]?.signature,
            limit: LIMIT,
          }
        )
        .then(resp => (signatures = resp))
        .catch(err => {
          console.log('error while fetching sig');
        });
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
  return signatures;
}

export async function fetch_and_parse_signatures(
  client: Connection,
  txParser: SolanaParser,
  staratlas_api: Array<StarAtlasNFT>,
  signatures: Array<any>
) {
  const LIMIT = parseInt(process.env.LIMIT ?? '100');

  if (signatures.length > 0) {
    console.log(
      'Staring with: %s at %i',
      signatures[0].signature,
      signatures[0]?.timestamp | signatures[0]?.blockTime
    );
    console.log('Got %i of %i', signatures.length, LIMIT);
    for (const signature of signatures) {
      let is_failed = false;
      await txParser
        .parseTransaction(client, signature.signature, true)
        .then(async parsed => {
          save_trade_to_db(
            parsed,
            signature.signature,
            signature.blockTime ?? 0,
            staratlas_api
          );
          await sleep(500);
        })
        .catch(err => {
          console.log(err);
          console.log('Code %s', err.code.toString());
          if (err.code == 503 || err.code == 'ERR_SOCKET_TIMEOUT') {
            console.log('closing app');
          }
          console.log('Error while signature: %s', signature.signature);
          let parseError = new ParseError({
            timestamp: signature.blockTime,
            signature: signature.signature,
          });
          is_failed = true;
          parseError.save().catch(err => {
            if (!(err.code == 11000)) {
              console.log('DB Error');
              console.log(err);
            }
          });
        });
    }
  }
}

function save_trade_to_db(
  parsed: any,
  signature: String,
  timestamp: number,
  staratlasapi: StarAtlasNFT[]
) {
  const currencies = get_Currencies();

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
        price:
          p.args.expectedPrice.toString() *
          Math.pow(
            10,
            -(
              currencies.find(
                currency =>
                  currency.mint ===
                  p.accounts
                    .find((account: any) => account.name === 'currencyMint')
                    .pubkey.toString()
              )?.decimals ?? 0
            )
          ),
        cost:
          p.args.expectedPrice.toString() *
          p.args.purchaseQuantity.toString() *
          Math.pow(10, -8),
        pair:
          (staratlasapi.find(
            nft =>
              nft.mint ===
              p.accounts
                .find((account: any) => account.name === 'assetMint')
                .pubkey.toString()
          )?.symbol ?? 'error') +
          currencies.find(
            currency =>
              currency.mint ===
              p.accounts
                .find((account: any) => account.name === 'currencyMint')
                .pubkey.toString()
          )?.name,
      });
      exchange.save().catch(err => {
        if (!(err.code == 11000)) {
          console.log('Error while saving to db');
          console.log(err);
        }
      });

      console.log('processExchange [saved]');
    }
  });
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
