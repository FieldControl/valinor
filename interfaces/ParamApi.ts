export interface ParamsApi {
  apikey: string;
  ts: number;
  hash: string;
  limit: number;
  offset?: number;
  orderBy?: string;
  nameStartsWith?: string;
  titleStartsWith?: string;
}
