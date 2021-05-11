import React from "react";
import PropTypes from "prop-types";
import "./IssueCard.scss";
import eIcon from "../../../assets/e.png";

import { formatUrl } from "../../../helpers/format";

/**
* Component for render issues.
*
* @component
* @param {string} html_url url
* @param {string} repository_url  url
* @param {string} title   title 
* @param {string} updated_at date of update
* @param {number} number number of issues 
* @param {number}   stargazers_count  number of stars
* @param {object} comments number of comments
* @param {string} state update
* @param {object} user  user 
* @param {object} comments number of comments
* @param {string} body body with dexcription 
* @example

* <IssueCard 
    * html_url={"https://example.com"}
    * repository_url={"https://example.com"}
    * title={"example"}
    * number={10}
    * state={"close"}
    * updated_at={"2021-05-11T03:00:56Z"}
    * user={{login:"John"}}
    * comments={"Hey haaa"}
    * body={"My info of body"}
    *  />
    * 
 */

const IssueCard = ({
  html_url,
  repository_url,
  title,
  number,
  state,
  updated_at,
  user,
  comments,
  body,
}) => {
  return (
    <div className="issue__card">
      <a className="issue__card__link issue__card__icon" href={html_url}>
        {" "}
        <img
          width="12px"
          height="12px"
          className="icon icon--issue"
          src={eIcon}
        />
        <div className="issue__header">
          {repository_url ? (
            <p className="issue__card__description ">
              {formatUrl(repository_url)}
            </p>
          ) : null}
          <p className="issue__card__number">#{number}</p>
        </div>
      </a>

      <ul className="issue__card__content">
        <li className="issue__title">{title}</li>
        {body && body.length ? (
          <li className="issue__body">{`${String(body).slice(0, 200)} ...`}</li>
        ) : null}
        {user && user !== null ? (
          <li className="issue__card__user">{user.login.toUpperCase()}</li>
        ) : null}
        <li className="issue__card__icon">{state}ed</li>
        <li className="issue__card__updated">
          {new Date(updated_at).toLocaleDateString()}
        </li>
        {comments > 0 ? <li>{comments} comment</li> : null}
      </ul>
    </div>
  );
};

IssueCard.propTypes = {
  html_url: PropTypes.string,
  repository_url: PropTypes.string,
  title: PropTypes.string,
  updated_at: PropTypes.string,
  number: PropTypes.number,
  comments: PropTypes.number,
  user: PropTypes.object,
  state: PropTypes.string,
  body: PropTypes.string,
};

export default IssueCard;
