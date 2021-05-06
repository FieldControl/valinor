import React from "react";
import PropTypes from "prop-types";
import "./RepoCard.scss";
import starIcon from "../../../assets/star.png";
import repoIcon from "../../../assets/repo.png";
import { formatNumber, formatString } from "../../../helpers/format";

const RepoCard = ({
  full_name,
  description,
  updated_at,
  language,
  open_issues,
  stargazers_count,
  license,
}) => {
  return (
    <div className="repo__card">
      <a className="repo__card__link repo__card__icon" href="/">
        {" "}
        <img
          width="12px"
          height="12px"
          className="icon icon--repo"
          src={repoIcon}
        />
        {full_name}
      </a>
      {description ? (
        <p className="repo__card__description">{formatString(description)}</p>
      ) : null}

      <ul className="repo__card__content">
        <li className="repo__card__icon">
          <img width="12px" height="12px" className="icon" src={starIcon} />
          {formatNumber(stargazers_count)}
        </li>
        {language ? (
          <li className="repo__card__icon">
            {" "}
            <span className="icon__circle"></span>
            {language}
          </li>
        ) : null}
        {license && license !== null ? (
          <li>{license.key.toUpperCase()} license</li>
        ) : null}
        <li>Updated {new Date(updated_at).toLocaleDateString()}</li>
        <li>{open_issues} issues need help</li>
      </ul>
    </div>
  );
};

RepoCard.propTypes = {
  full_name: PropTypes.string,
  description: PropTypes.string,
  updated_at: PropTypes.string,
  language: PropTypes.string,
  open_issues: PropTypes.number,
  stargazers_count: PropTypes.number,
  license: PropTypes.object,
};

export default RepoCard;
