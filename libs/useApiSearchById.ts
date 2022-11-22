import axios from "axios";
import md5 from "md5";

export const useApiSearchById = (privatekey: string, type: string, id: number) => {
  const ts = Number(new Date());
  const apikey = process.env.NEXT_PUBLIC_API_KEY as string;
  const params = {
    apikey: apikey,
    ts,
    hash: md5(ts + privatekey + apikey),
  };

  return {
    getData: async () => {
      try {
        const json = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${type}/${id}`, { params });
        return json.data.data;
      } catch (err) {
        return alert("Não foi possível carregar os dados.");
      }
    },
  };
};
