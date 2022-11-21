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
  const [totalItems, setTotalItems] = useState(total);
  const [offsetValue, setOffsetValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

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
    if (offsetValue + 12 <= totalItems) {
      setOffsetValue(offsetValue + 12);
      const api = useApi(privatekey, type, offsetValue + 12, name);
      const newList = await api.getData();
      setTotalItems(newList.total);
      setList(newList.results);
    }
    setLoading(false);
  };

  const previous = async () => {
    setLoading(true);
    if (offsetValue - 12 >= 0) {
      setOffsetValue(offsetValue - 12);
      const api = useApi(privatekey, type, offsetValue - 12, name);
      const newList = await api.getData();
      setTotalItems(newList.total);
      setList(newList.results);
    }
    setLoading(false);
  };

  const filterByName = async (value: string) => {
    setName(value);
    if (value !== "") {
      setLoading(true);
      const api = useApi(privatekey, type, 0, value);
      const newList = await api.getData();
      setList(newList?.results);
      setTotalItems(newList.total);
      setOffsetValue(0);
      setLoading(false);
    }
  };

  return (
    <>
      <aside className="w-1/3">
        <h1 className="relative w-full text-4xl text-center text-white uppercase bg-neutral-800 mt-2 pt-2 corner ">
          Filters
        </h1>
        <div className="p-3 bg-neutral-300 h-full">
          <label htmlFor="name" className="flex flex-col">
            <span className="uppercase text-lg">Search by Name: </span>
            <div className="w-full flex justify-between bg-white rounded">
              <input
                type="text"
                name="name"
                id="name"
                value={name}
                className="outline-none uppercase p-2 text-lg w-11/12"
                onChange={(e) => filterByName(e.target.value)}
              />
              <button
                className="bg-red-500 uppercase text-lg text-white p-2 rounded-r w-1/12"
                onClick={() => filterByName(name)}
              >
                GO
              </button>
            </div>
          </label>
        </div>
      </aside>
      <section className="w-2/3 flex flex-col items-center">
        <h1 className="relative w-full text-white text-4xl text-center uppercase bg-neutral-800 mt-2 pt-2 corner  ">
          {type}
        </h1>
        {!loading && <List type={type} list={list as ContentProps["data"]} />}
        <div className="relative bg-neutral-800 m-3 flex w-full flex-col items-center text-white py-3">
          <div className="text-xl font-bold w-full text-center -mt-1 pb-1 border-b-2 border-red-600">
            Total: {totalItems}
          </div>
          <div className="flex items-center w-1/2 pt-3 justify-between">
            <button onClick={previous} className="btnPrevious">
              Voltar
            </button>
            <span>
              {offsetValue}
              {offsetValue + 12 <= totalItems &&
                " - " + Number(offsetValue + 12)}
            </span>
            <button onClick={next} className="btnNext">
              Avançar
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Content;
