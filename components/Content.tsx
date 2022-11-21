import { useEffect, useState } from "react";
import { Character } from "../interfaces/Character";
import { Comic } from "../interfaces/Comic";
import { Creator } from "../interfaces/Creator";
import { Event } from "../interfaces/Event";
import { Serie } from "../interfaces/Serie";
import { Story } from "../interfaces/Story";
import { useApi } from "../libs/useApi";
import List from "./List";

type ContentProps = {
  type: string;
  privatekey: string;
  data: Character[] | Comic[] | Creator[] | Event[] | Serie[] | Story[];
  total: number;
};

const Content = ({ type, privatekey, data, total }: ContentProps) => {
  const [list, setList] = useState([{}]);
  const [offsetValue, setOffsetValue] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    switch (type) {
      case "characters":
        setList(data);
        break;
      case "comics":
        setList(data);
        break;
      case "creators":
        setList(data);
        break;
      case "events":
        setList(data);
        break;
      case "series":
        setList(data);
        break;
      case "stories":
        setList(data);
        break;
      default:
        break;
    }
  }, [type]);

  const next = async () => {
    setLoading(true);
    if (offsetValue + 12 <= total) {
      setOffsetValue(offsetValue + 12);
      const api = useApi(privatekey, type, offsetValue + 12);
      const newList = await api.getData();
      setList(newList.results);
    }
    setLoading(false);
  };

  const previous = async () => {
    setLoading(true);
    if (offsetValue - 12 >= 0) {
      setOffsetValue(offsetValue - 12);
      const api = useApi(privatekey, type, offsetValue - 12);
      const newList = await api.getData();
      setList(newList.results);
    }
    setLoading(false);
  };

  return (
    <main>
      {!loading && <List type={type} list={list as ContentProps["data"]} />}
      <div>
        <div>Total: {total}</div>
        <div>
          <button onClick={previous}>Voltar</button>
          <span>
            {offsetValue} - {offsetValue + 12}
          </span>
          <button onClick={next}>Avançar</button>
        </div>
      </div>
    </main>
  );
};

export default Content;
