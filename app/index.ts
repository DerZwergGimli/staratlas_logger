import { Connection, PublicKey } from '@solana/web3.js';
import { getGmIDL } from '@staratlas/factory';
import { Idl } from '@project-serum/anchor';
import { SolanaParser } from '@shyft.to/solana-transaction-parser';
import { connectDB, disconnectDB, is_db_connected } from './database';
import { Exchange } from './TradeSchema';
import * as process from 'process';
import { ParseError } from './ParseErrorSchema';
import { StarAtlasNFT } from './staratlasnft';
import { get_Currencies } from './currencies';
import fetch from 'node-fetch';
import {
  connect_to_db,
  fetch_and_parse_signatures,
  fetch_sa_assets,
  init_worker_and_get_from_db,
  sleep,
} from './tasks';

console.log('--- Starting ---');
console.log('-> Mode: %s', process.env.MODE);
async function main(): Promise<void> {
  if (process.env.MODE) {
    const client = new Connection(
      process.env.RPC ?? 'https://solana-mainnet.rpc.extrnode.com'
    );
    connect_to_db();

    //Check if db is connected
    while (!is_db_connected()) {
      process.stdout.write('.');
      await sleep(1000);
    }

    let staratlas_api = await fetch_sa_assets();
    if (staratlas_api.length == 0) {
      console.log('Unable to fetch api');
    } else {
      //Init Parser
      const programm_key = new PublicKey(
        'traderDnaR5w6Tcoi3NFm53i48FTDNbGjBSZwWXDRrg'
      );
      const txParser = new SolanaParser([
        {
          idl: getGmIDL(programm_key) as unknown as Idl,
          programId: programm_key,
        },
      ]);
      let db_entry = await init_worker_and_get_from_db(client);
      console.log(db_entry[0]);

      await fetch_and_parse_signatures(
        client,
        txParser,
        staratlas_api,
        db_entry
      );
    }
    disconnectDB();
    await sleep(3000);
  } else {
    console.log('Please set a MODE env');
  }
}

main()
  .then(() => {
    console.log('--- END ---');
  })
  .catch(err => {
    console.log('global error catch');
    console.log(err);
  })
  .finally(() => disconnectDB());
