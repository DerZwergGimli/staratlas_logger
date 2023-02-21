export interface I_Currency {
  name: String;
  mint: String;
  decimals: number;
}

export function get_Currencies(): Array<I_Currency> {
  return [
    {
      name: 'USDC',
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      decimals: 6,
    },
    {
      name: 'ATLAS',
      mint: 'ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx',
      decimals: 8,
    },
    {
      name: 'POLIS',
      mint: 'poLisWXnNRwC6oBu1vHiuKQzFjGL4XDSu4g9qjz9qVk',
      decimals: 8,
    },
    {
      name: 'SOL',
      mint: 'So11111111111111111111111111111111111111112',
      decimals: 9,
    },
  ];
}
