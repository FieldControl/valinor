import { useEffect, useState } from "react";
import "./Cards.css";

const Cards = ({ data }) => {
  const [listRepository, setListRepository] = useState(data);

  useEffect(() => {
    setListRepository(data);
  }, [data]);

  return (
    <div>
      {listRepository &&
        listRepository.map((repository) => {
          let topics = [];
          for (let i = 0; i < repository.topics.length; i++) {
            topics.push(
              <div className="topic" key={i}>
                <p>{repository.topics[i]}</p>
              </div>
            );
          }
          return (
            <a key={repository.id} href={repository.html_url} target="_blank">
              <div className="cards">
                <p>{repository.full_name}</p>
                <p>{repository.description}</p>
                <div className="topics">{topics}</div>
                <div className="subCards">
                  <p>Stars: {repository.stargazers_count}</p>
                  <p>Lang: {repository.language}</p>
                  <p>Forks: {repository.forks_count}</p>
                  <p>Issues: {repository.open_issues_count}</p>
                </div>
              </div>
            </a>
          );
        })}
    </div>
  );
};

export default Cards;
