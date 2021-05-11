import React from "react";
import PropTypes from "prop-types";
import "./RepoCard.scss";
import starIcon from "../../../assets/star.png";
import repoIcon from "../../../assets/repo.png";
import { formatNumber, formatString } from "../../../helpers/format";

/**
 * Component for render repositories. 
 *
 * @component
 * @example
 * 
 <RepoCard 
* full_name={"Life/John"}
*  description={"Daily of John"}
*  updated_at={"2021-05-11T03:00:56Z"}
*  language={"JavaScript"}
*  open_issues={2}
*  stargazers_count={10}
*  license={{key:"MIT"}}
*  />
* @param {string} full__name full name
* @param {string} description description
* @param {string} update_at   date of update 
* @param {string} language language of code
* @param {number} open_issues number of issues open  full name
* @param {number}   stargazers_count  number of stars
* @param {object} license  license
 */

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
      <a
        href={`https://github.com/${full_name}`}
        className="repo__card__link repo__card__icon"
      >
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
