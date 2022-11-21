import axios from "axios";
import md5 from "md5";

export const useApi = (privatekey: string, type: string, offset?: number) => {
  const ts = Number(new Date());
  const apikey = process.env.NEXT_PUBLIC_API_KEY;
  const params = {
    apikey,
    ts,
    hash: md5(ts + (privatekey as string) + apikey),
    limit: 12,
    offset,
  };

  return {
    getData: async () => {
      try {
        const json = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/${type}`,
          { params }
        );
        return json.data.data;
      } catch (err) {
        return alert("Não foi possível carregar os dados.");
      }
    },
  };
};
