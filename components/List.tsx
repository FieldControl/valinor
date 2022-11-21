import md5 from "md5";
import { ReactElement, ReactNode } from "react";
import { Character } from "../interfaces/Character";
import { Comic } from "../interfaces/Comic";
import { Creator } from "../interfaces/Creator";
import { Event } from "../interfaces/Event";

type ListProps = {
  type: string;
  list: Character[] | Comic[] | Creator[];
};

const List = ({ type, list }: ListProps): ReactElement => {
  switch (type) {
    case "characters":
      const characters = (list as Character[]).map((item, index) => (
        <li key={md5(item.id + item.name + new Date() + index + Math.random())}>
          {item.name}
        </li>
      ));
      return <ul>{characters}</ul>;
    case "comics":
      const comics = (list as Comic[]).map((item, index) => (
        <li
          key={md5(item.id + item.title + new Date() + index + Math.random())}
        >
          {item.title}
        </li>
      ));
      return <ul>{comics}</ul>;
    case "creators":
      const creators = (list as Creator[]).map((item, index) => (
        <li
          key={md5(
            item.id + item.fullName + new Date() + index + Math.random()
          )}
        >
          {item.fullName}
        </li>
      ));
      return <ul>{creators}</ul>;
    case "events":
      const events = (list as Event[]).map((item, index) => (
        <li
          key={md5(item.id + item.title + new Date() + index + Math.random())}
        >
          {item.title}
        </li>
      ));
      return <ul>{events}</ul>;
    case "series":
      const series = (list as Event[]).map((item, index) => (
        <li
          key={md5(item.id + item.title + new Date() + index + Math.random())}
        >
          {item.title}
        </li>
      ));
      return <ul>{series}</ul>;
    case "stories":
      const stories = (list as Event[]).map((item, index) => (
        <li
          key={md5(item.id + item.title + new Date() + index + Math.random())}
        >
          {item.title}
        </li>
      ));
      return <ul>{stories}</ul>;
  }

  return (
    <ul>
      <li>Não há dados.</li>
    </ul>
  );
};

export default List;
