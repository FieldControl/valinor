import React from "react";
import { Repository, Ul, Li } from "./styles";
import moment from "moment";

const SearchItem = props => {
  const updated_at = moment(
    props.item.updated_at,
    "YYYY-MM-DD hh:mm:ss"
  ).fromNow();

  return (
    <Repository className="list-xitem">
      <header>
        <p>
          <a href={props.item.html_url}>{props.item.full_name}</a> (
          {props.item.language ? props.item.language : "Language not defined"})
        </p>
        <small>{props.item.description}</small>
      </header>
      <Ul>
        <Li>
          <a
            href={`https://github.com/${props.item.full_name}/network/members`}
          >
            {props.item.forks} Forks
          </a>
        </Li>
        <Li>
          <a href={`https://github.com/${props.item.full_name}/stargazers`}>
            {props.item.stargazers_count} Stars
          </a>
        </Li>
      </Ul>
      <Ul>
        <Li>
          <p>{updated_at}</p>
        </Li>
        <Li>
          <a href={`${props.item.html_url}/issues?q=is%3Aissue+is%3Aopen`}>
            {props.item.open_issues} Issues Open
          </a>
        </Li>
      </Ul>
    </Repository>
  );
};

export default SearchItem;
