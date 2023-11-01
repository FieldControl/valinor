import { FC } from "react";
import styles from "./styles.module.scss";
import { RepositoryItem } from "../../types/RepositoryItem";
import { formatNumber } from "../../helpers/numberHelper";
import { formatDate } from "../../helpers/dateHelper";

const RepositoryItemContainer: FC<RepositoryItem> = ({
  name,
  description,
  language,
  stargazers_count,
  html_url,
  updated_at,
  topics
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.name}>
        <a href={html_url}>{name}</a>
      </div>
      <div className={styles.description}>{description}</div>
      <div className={styles.topics}>
        {topics.map((topic: string, index: number) => {
          if (index < 5 && topic.length <= 13) {
            return <div>{topic}</div>;
          }
        })}
      </div>
      <div className={styles.language}>{language}</div>
      <div className={styles.stargazers_count}>
        {"★ " + formatNumber(stargazers_count)}
      </div>
      <div className={styles.updated_at}>
        {"Última atualização em " + formatDate(updated_at)}
      </div>
    </div>
  );
};

export default RepositoryItemContainer;
