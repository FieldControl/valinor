import { useEffect, useState } from "react";
import { Person } from "../interfaces/Person";
import { Artefact } from "../interfaces/Artefact";
import { useApiCharacters } from "../libs/useApiCharacters";
import { useApiObjects } from "../libs/useApiObjects";
import List from "./List";
import Loading from "./Loading";

type ContentProps = {
  type: string;
  privatekey: string;
  data: Person[] | Artefact[];
  total: number;
};

const Content = ({ type, privatekey, data, total }: ContentProps) => {
  const [list, setList] = useState([{}]);
  const [totalItems, setTotalItems] = useState(total);
  const [offsetValue, setOffsetValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [order, setOrder] = useState("");

  useEffect(() => {
    setList(data);
    setOrder("");
    switch (type) {
      case "characters":
      case "events":
        setOrder("name");
        break;
      case "creators":
        setOrder("firstName");
        break;
      case "stories":
        setOrder("id");
        break;
      default:
        setOrder("title");
        break;
    }
  }, [type]);

  const next = async () => {
    setLoading(true);
    let newList;
    if (offsetValue + 12 <= totalItems) {
      setOffsetValue(offsetValue + 12);
      if (type === "characters" || type === "creators" || type === "events") {
        const api = useApiCharacters(privatekey, type, offsetValue + 12, order, name);
        newList = await api.getData();
      } else {
        const api = useApiObjects(privatekey, type, offsetValue + 12, order, name);
        newList = await api.getData();
      }
      setTotalItems(newList?.total);
      setList(newList?.results);
    }
    setLoading(false);
  };

  const previous = async () => {
    setLoading(true);
    let newList;
    if (offsetValue - 12 >= 0) {
      setOffsetValue(offsetValue - 12);
      if (type === "characters" || type === "creators" || type === "events") {
        const api = useApiCharacters(privatekey, type, offsetValue - 12, order, name);
        newList = await api.getData();
      } else {
        const api = useApiObjects(privatekey, type, offsetValue - 12, order, name);
        newList = await api.getData();
      }
      setTotalItems(newList?.total);
      setList(newList?.results);
    }
    setLoading(false);
  };

  const filterByName = async (value: string) => {
    setName(value);
    setLoading(true);
    let newList;
    if (type === "characters" || type === "creators" || type === "events") {
      const api = useApiCharacters(privatekey, type, 0, order, value);
      newList = await api.getData();
    } else {
      const api = useApiObjects(privatekey, type, 0, order, value);
      newList = await api.getData();
    }
    setList(newList?.results);
    setTotalItems(newList?.total);
    setOffsetValue(0);
    setLoading(false);
  };

  const filterOrder = async (value: string) => {
    setOrder(value);
    let newList;
    if (value !== "") {
      setLoading(true);
      if (type === "characters" || type === "creators" || type === "events") {
        const api = useApiCharacters(privatekey, type, 0, value);
        newList = await api.getData();
      } else {
        const api = useApiObjects(privatekey, type, 0, value);
        newList = await api.getData();
      }
      setList(newList?.results);
      setTotalItems(newList?.total);
      setOffsetValue(0);
      setLoading(false);
    }
  };

  const reset = async () => {
    let newList;
    setLoading(true);
    if (type === "characters" || type === "creators" || type === "events") {
      const api = useApiCharacters(privatekey, type, 0);
      newList = await api.getData();
    } else {
      const api = useApiObjects(privatekey, type, 0);
      newList = await api.getData();
    }
    switch (type) {
      case "characters":
      case "events":
        setOrder("name");
        break;
      case "creators":
        setOrder("firstName");
        break;
      case "stories":
        setOrder("id");
        break;
      default:
        setOrder("title");
        break;
    }
    setName("");
    setList(newList?.results);
    setTotalItems(newList?.total);
    setOffsetValue(0);
    setLoading(false);
  };

  return (
    <>
      <aside className="relative w-1/4 h-full flex flex-col gap-2">
        <h1 className="relative w-full text-4xl text-center text-white uppercase bg-neutral-800 mt-2 pt-2 corner ">Filters</h1>

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
              <button className="bg-red-500 uppercase text-lg text-white p-2 rounded-r w-2/12" onClick={() => filterByName(name)}>
                GO
              </button>
            </div>
          </label>
          <label htmlFor="order" className="flex flex-col mb-10">
            <span className="uppercase text-lg">Order by: </span>

            <select
              name="order"
              id="order"
              className="outline-none bg-white uppercase p-2 text-lg w-full rounded"
              onChange={() => filterOrder(order)}
            >
              <option value={order}>Alphabetic (A-Z)</option>
              <option value={"-" + order}>Alphabetic (Z-A)</option>
              <option value="-modified">Recently Modified</option>
              <option value="modified">Modified Old</option>
            </select>
          </label>
          <button
            className="bg-neutral-800 p-2 uppercase text-white text-xl rounded hover:shadow hover:shadow-red-600 active:scale-95"
            onClick={reset}
          >
            Reset
          </button>
        </div>

        <div className="bg-neutral-800 px-2 h-full w-full flex justify-center items-center text-center text-white">
          <div className="bg-red-600 h-full relative flex flex-col w-fit p-2">
            <span className="text-4xl -mb-2 uppercase">MARVEL</span>
            <span className="uppercase">Field Control</span>
          </div>
          <span className="text-6xl absolute text-white uppercase -rotate-90">{type}</span>
        </div>
      </aside>

      <section className="w-3/4 h-full flex flex-col items-center">
        <h1 className="relative w-full text-white text-4xl text-center uppercase bg-neutral-800 mt-2 pt-2 corner  ">{type}</h1>
        {!loading ? <List type={type} list={list as ContentProps["data"]} /> : <Loading />}

        <div className="relative bg-neutral-800 m-3 flex w-full flex-col items-center text-white py-3">
          <div className="text-xl font-bold w-full text-center -mt-1 pb-1 border-b-2 border-red-600">Total: {totalItems}</div>
          <div className={`flex items-center w-1/2 pt-3 justify-between ${list.length === 0 && "hidden"}`}>
            <button onClick={previous} className={`btnPrevious ${offsetValue - 12 < 0 && "opacity-0"}`} disabled={offsetValue - 12 < 0}>
              Voltar
            </button>
            <span>
              {offsetValue + 1}
              {offsetValue + 12 <= totalItems ? " - " + Number(offsetValue + 12) : " - " + totalItems}
            </span>
            <button onClick={next} className={`btnNext ${offsetValue + 12 >= totalItems && "opacity-0"}`} disabled={offsetValue + 12 >= totalItems}>
              Avançar
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Content;
