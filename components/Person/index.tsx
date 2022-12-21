import { ResultProps } from "../PersonList";

export function Person({
  name,
  films,
  gender,
  mass,
  hair_color,
  height
}: ResultProps) {
  return (
    <li
      id="Person Details"
      className=" flex flex-col h-full w-screen p-6 max-w-3xl border-b border-t border-border"
    >
      <a
        href="#"
        className="text-link hover:opacity-70"
        aria-label="Link to Character"
      >
        {name}
      </a>
      <span id="films">Appears in : {films} films</span>
      <span className="flex w-full gap-5 mt-2" id="tags">
        <strong
          className="bg-tag bg-opacity-25 text-link px-2 py-1 rounded-md"
          id="Gender Tag"
        >
          Genre : {gender}
        </strong>
        <strong
          className="bg-tag bg-opacity-25 text-link px-2 py-1 rounded-md"
          id="Mass Tag"
        >
          Mass : {mass} kgs
        </strong>
        <strong
          className="bg-tag bg-opacity-25 text-link px-2 py-1 rounded-md"
          id="Hair Color Tag"
        >
          Hair : {hair_color}
        </strong>
        <strong
          className="bg-tag bg-opacity-25 text-link px-2 py-1 rounded-md"
          id="Height Tag"
        >
          Height : {height} m
        </strong>
      </span>
    </li>
  );
}
