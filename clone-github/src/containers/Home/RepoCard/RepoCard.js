import React from "react";
import PropTypes from "prop-types";
import "./RepoCard.scss";
import starIcon from "../../../assets/star.png";
import repoIcon from "../../../assets/repo.png";

const RepoCard = ({
  full_name,
  url,
  description,
  updated_at,
  language,
  open_issues,
  stargazers_count,
  license,
}) => {
  return (
    <div className="repoCard">
      <a className="repoCard__link repoCardIcon" href={url}>
        {" "}
        <img
          width="12px"
          height="12px"
          className="icon icon--repo"
          src={repoIcon}
        />
        {full_name}
      </a>
      <p className="repoCard__description">{description}</p>
      <ul className="repoCard__content">
        <li className="repoCardIcon">
          <img width="12px" height="12px" className="icon" src={starIcon} />
          {stargazers_count}
        </li>
        {language ? (
          <li className="repoCardIcon">
            {" "}
            <span className="icon__circle"></span>
            {language}
          </li>
        ) : null}
        {license !== null ? <li>{license.key.toUpperCase()} license</li> : null}
        <li>Updated {new Date(updated_at).toLocaleDateString()}</li>
        <li>{open_issues} issues need help</li>
      </ul>
    </div>
  );
};

RepoCard.propTypes = {
  full_name: PropTypes.string,
  url: PropTypes.string,
  description: PropTypes.string,
  updated_at: PropTypes.string,
  language: PropTypes.string,
  open_issues: PropTypes.number,
  stargazers_count: PropTypes.number,
  license: PropTypes.object,
};

export default RepoCard;
