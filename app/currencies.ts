export interface I_Currency {
  name: String;
  mint: String;
}

export function get_Currenties(): Array<I_Currency> {
  return [
    {
      name: 'USDC',
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    },
    {
      name: 'ATLAS',
      mint: 'ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx',
    },
    {
      name: 'POLIS',
      mint: 'poLisWXnNRwC6oBu1vHiuKQzFjGL4XDSu4g9qjz9qVk',
    },
    {
      name: 'SOL',
      mint: 'So11111111111111111111111111111111111111112',
    },
  ];
}
