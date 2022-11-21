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
  const [order, setOrder] = useState("name");

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
      const api = useApi(privatekey, type, offsetValue + 12, name, order);
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
      const api = useApi(privatekey, type, offsetValue - 12, name, order);
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
      const api = useApi(privatekey, type, 0, value, order);
      const newList = await api.getData();
      setList(newList?.results);
      setTotalItems(newList.total);
      setOffsetValue(0);
      setLoading(false);
    }
  };

  const filterOrder = async (order: string) => {
    setOrder(order);
    if (order !== "") {
      setLoading(true);
      const api = useApi(privatekey, type, 0, order);
      const newList = await api.getData();
      if (newList) {
        setList(newList?.results);
        setTotalItems(newList?.total);
        setOffsetValue(0);
      }

      setLoading(false);
    }
  };

  return (
    <>
      <aside className="relative w-1/4 h-full flex flex-col gap-2">
        <h1 className="relative w-full text-4xl text-center text-white uppercase bg-neutral-800 mt-2 pt-2 corner ">
          Filters
        </h1>

        <div className="p-3 bg-neutral-300 h-fit flex flex-col gap-4">
          <label htmlFor="name" className="flex flex-col mb-10">
            <span className="uppercase text-lg">Search by Name: </span>
            <div className="w-full flex justify-between bg-white rounded">
              <input
                type="text"
                name="name"
                id="name"
                value={name}
                className="outline-none uppercase p-2 text-lg w-10/12 rounded"
                onChange={(e) => filterByName(e.target.value)}
              />
              <button
                className="bg-red-500 uppercase text-lg text-white p-2 rounded-r w-2/12"
                onClick={() => filterByName(name)}
              >
                GO
              </button>
            </div>
          </label>
          <label htmlFor="order" className="flex flex-col mb-10">
            <span className="uppercase text-lg">Order by: </span>

            <select
              name="order"
              id="order"
              value={order}
              className="outline-none bg-white uppercase p-2 text-lg w-full rounded"
              onChange={(e) => filterOrder(e.target.value)}
            >
              <option value="name">Alphabetic (A-Z)</option>
              <option value="-name">Alphabetic (Z-A)</option>
              <option value="-modified">Recently Modified</option>
              <option value="modified">Modified Old</option>
            </select>
          </label>
          <button className="bg-neutral-800 p-2 uppercase text-white text-xl rounded hover:shadow hover:shadow-red-600 active:scale-95">
            Reset
          </button>
        </div>

        <div className="bg-neutral-800 px-2 h-full w-full flex justify-center items-center text-center text-white">
          <div className="bg-red-600 h-full relative flex flex-col w-fit p-2">
            <span className="text-4xl -mb-2 uppercase">MARVEL</span>
            <span className="uppercase">Field Control</span>
          </div>
          <span className="text-6xl absolute text-white uppercase -rotate-90">
            {type}
          </span>
        </div>
      </aside>

      <section className="w-3/4 h-full flex flex-col items-center">
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
