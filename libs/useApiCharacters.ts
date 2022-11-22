import axios from "axios";
import md5 from "md5";
import { ParamsApi } from "../interfaces/ParamApi";

export const useApiCharacters = (privatekey: string, type: string, offset?: number, orderBy?: string, nameStartsWith?: string) => {
  const ts = Number(new Date());
  const apikey = process.env.NEXT_PUBLIC_API_KEY as string;
  const params: ParamsApi = {
    apikey: apikey,
    ts,
    hash: md5(ts + privatekey + apikey),
    limit: 12,
    offset,
    orderBy,
  };

  if (nameStartsWith) {
    params.nameStartsWith = nameStartsWith;
  }

  return {
    getData: async () => {
      try {
        const json = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${type}`, { params });
        return json.data.data;
      } catch (err) {
        return alert("Não foi possível carregar os dados.");
      }
    },
  };
};
