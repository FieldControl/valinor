import md5 from "md5";
import { ReactElement, ReactNode, useEffect } from "react";
import { Person } from "../interfaces/Person";
import { Artefact } from "../interfaces/Artefact";
import Card from "./Card";
import Link from "next/link";
import NProgress from "nprogress";

type ListProps = {
  type: string;
  list: Person[] | Artefact[];
};

const List = ({ type, list }: ListProps): ReactElement => {
  switch (type) {
    case "characters":
      const characters = (list as Person[]).map((item, index) => (
        <li key={md5(item.id + item.name + new Date() + index + Math.random())}>
          <Link href={`/${type}/${item.id}`}>
            <Card img={item.thumbnail && item.thumbnail.path + "." + item.thumbnail.extension} title={item.name} modified={item.modified} />
          </Link>
        </li>
      ));
      return <ul className="listFilled w-full h-auto flex flex-wrap justify-between relative">{characters}</ul>;
    case "comics":
    case "events":
    case "series":
    case "stories":
      const item = (list as Artefact[]).map((item, index) => (
        <li key={md5(item.id + item.title + new Date() + index + Math.random())}>
          <Link href={`/${type}/${item.id}`}>
            <Card img={item.thumbnail && item.thumbnail.path + "." + item.thumbnail.extension} title={item.title} modified={item.modified} />
          </Link>
        </li>
      ));
      return <ul className="listFilled w-full h-auto flex flex-wrap justify-between relative">{item}</ul>;
    case "creators":
      const creators = (list as Person[]).map((item, index) => (
        <li key={md5(item.id + item.fullName + new Date() + index + Math.random())}>
          <Link href={`/${type}/${item.id}`}>
            <Card img={item.thumbnail && item.thumbnail.path + "." + item.thumbnail.extension} title={item.fullName} modified={item.modified} />
          </Link>
        </li>
      ));
      return <ul className="listFilled w-full h-auto flex flex-wrap justify-between relative">{creators}</ul>;
  }

  return (
    <ul className="listFilled w-full h-auto flex flex-wrap justify-between relative">
      <li>Não há dados.</li>
    </ul>
  );
};

export default List;
