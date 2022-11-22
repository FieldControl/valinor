import md5 from "md5";
import { ReactElement, ReactNode } from "react";
import { Person } from "../interfaces/Person";
import { Artefact } from "../interfaces/Artefact";
import Card from "./Card";

type ListProps = {
  type: string;
  list: Person[] | Artefact[];
};

const List = ({ type, list }: ListProps): ReactElement => {
  switch (type) {
    case "characters":
      const characters = (list as Person[]).map((item, index) => (
        <li key={md5(item.id + item.name + new Date() + index + Math.random())} className="w-full">
          <Card img={item.thumbnail && item.thumbnail.path + "." + item.thumbnail.extension} title={item.name} modified={item.modified} />
        </li>
      ));
      return <ul className="w-full h-auto flex flex-wrap justify-between relative">{characters}</ul>;
    case "comics":
      const comics = (list as Artefact[]).map((item, index) => (
        <li key={md5(item.id + item.title + new Date() + index + Math.random())}>
          <Card img={item.thumbnail && item.thumbnail.path + "." + item.thumbnail.extension} title={item.title} modified={item.modified} />
        </li>
      ));
      return <ul className="flex flex-wrap justify-between">{comics}</ul>;
    case "creators":
      const creators = (list as Person[]).map((item, index) => (
        <li key={md5(item.id + item.fullName + new Date() + index + Math.random())}>
          <Card img={item.thumbnail && item.thumbnail.path + "." + item.thumbnail.extension} title={item.fullName} modified={item.modified} />
        </li>
      ));
      return <ul className="flex flex-wrap justify-between">{creators}</ul>;
    case "events":
      const events = (list as Artefact[]).map((item, index) => (
        <li key={md5(item.id + item.title + new Date() + index + Math.random())}>
          <Card img={item.thumbnail && item.thumbnail.path + "." + item.thumbnail.extension} title={item.title} modified={item.modified} />
        </li>
      ));
      return <ul className="flex flex-wrap justify-between">{events}</ul>;
    case "series":
      const series = (list as Artefact[]).map((item, index) => (
        <li key={md5(item.id + item.title + new Date() + index + Math.random())}>
          <Card img={item.thumbnail && item.thumbnail.path + "." + item.thumbnail.extension} title={item.title} modified={item.modified} />
        </li>
      ));
      return <ul className="flex flex-wrap justify-between">{series}</ul>;
    case "stories":
      const stories = (list as Artefact[]).map((item, index) => (
        <li key={md5(item.id + item.title + new Date() + index + Math.random())}>
          <Card img={item.thumbnail && item.thumbnail.path + "." + item.thumbnail.extension} title={item.title} modified={item.modified} />
        </li>
      ));
      return <ul className="flex flex-wrap justify-between">{stories}</ul>;
  }

  return (
    <ul className="flex flex-wrap justify-between">
      <li>Não há dados.</li>
    </ul>
  );
};

export default List;
