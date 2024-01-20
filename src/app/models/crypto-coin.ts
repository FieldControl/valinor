export interface CryptoCoin {
  data: {
    id: number;
    name: string;
    symbol: string;
    slug: string;
    circulating_supply: number;
    quote: {
      BRL: {
        price: number;
        percent_change_1h: number;
        percent_change_24h: number;
        percent_change_7d: number;
        market_cap: number;
      };
    };
  };
}
