import md5 from "md5";
import { ReactElement, ReactNode } from "react";
import { Character } from "../interfaces/Character";
import { Comic } from "../interfaces/Comic";
import { Creator } from "../interfaces/Creator";
import { Event } from "../interfaces/Event";
import Card from "./Card";

type ListProps = {
  type: string;
  list: Character[] | Comic[] | Creator[];
};

const List = ({ type, list }: ListProps): ReactElement => {
  switch (type) {
    case "characters":
      const characters = (list as Character[]).map((item, index) => (
        <li key={md5(item.id + item.name + new Date() + index + Math.random())}>
          <Card
            img={
              item.thumbnail &&
              item.thumbnail.path + "." + item.thumbnail.extension
            }
            title={item.name}
          />
        </li>
      ));
      return <ul className="flex flex-wrap justify-center">{characters}</ul>;
    case "comics":
      const comics = (list as Comic[]).map((item, index) => (
        <li
          key={md5(item.id + item.title + new Date() + index + Math.random())}
        >
          <Card
            img={
              item.thumbnail &&
              item.thumbnail.path + "." + item.thumbnail.extension
            }
            title={item.title}
          />
        </li>
      ));
      return <ul className="flex flex-wrap justify-center">{comics}</ul>;
    case "creators":
      const creators = (list as Creator[]).map((item, index) => (
        <li
          key={md5(
            item.id + item.fullName + new Date() + index + Math.random()
          )}
        >
          <Card
            img={
              item.thumbnail &&
              item.thumbnail.path + "." + item.thumbnail.extension
            }
            title={item.fullName}
          />
        </li>
      ));
      return <ul className="flex flex-wrap justify-center">{creators}</ul>;
    case "events":
      const events = (list as Event[]).map((item, index) => (
        <li
          key={md5(item.id + item.title + new Date() + index + Math.random())}
        >
          <Card
            img={
              item.thumbnail &&
              item.thumbnail.path + "." + item.thumbnail.extension
            }
            title={item.title}
          />
        </li>
      ));
      return <ul className="flex flex-wrap justify-center">{events}</ul>;
    case "series":
      const series = (list as Event[]).map((item, index) => (
        <li
          key={md5(item.id + item.title + new Date() + index + Math.random())}
        >
          <Card
            img={
              item.thumbnail &&
              item.thumbnail.path + "." + item.thumbnail.extension
            }
            title={item.title}
          />
        </li>
      ));
      return <ul className="flex flex-wrap justify-center">{series}</ul>;
    case "stories":
      const stories = (list as Event[]).map((item, index) => (
        <li
          key={md5(item.id + item.title + new Date() + index + Math.random())}
        >
          <Card
            img={
              item.thumbnail &&
              item.thumbnail.path + "." + item.thumbnail.extension
            }
            title={item.title}
          />
        </li>
      ));
      return <ul className="flex flex-wrap justify-center">{stories}</ul>;
  }

  return (
    <ul className="flex flex-wrap justify-center">
      <li>Não há dados.</li>
    </ul>
  );
};

export default List;
