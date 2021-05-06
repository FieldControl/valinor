import React from "react";
import PropTypes from "prop-types";
import "./IssueCard.scss";
import eIcon from "../../../assets/e.png";

import { formatUrl } from "../../../helpers/format";

const IssueCard = ({
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
      <a className="issue__card__link issue__card__icon" href="/">
        {" "}
        <img
          width="12px"
          height="12px"
          className="icon icon--issue"
          src={eIcon}
        />
        <div className="issue__header">
          <p className="issue__card__description ">
            {formatUrl(repository_url)}
          </p>
          <p className="issue__card__number">#{number}</p>
        </div>
      </a>

      <ul className="issue__card__content">
        <li className="issue__title">{title}</li>
        <li className="issue__body">{`${String(body).slice(0, 200)} ...`}</li>
        {user !== null ? (
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
  repository_url: PropTypes.string,
  title: PropTypes.string,
  updated_at: PropTypes.string,
  number: PropTypes.number,
  comments: PropTypes.number,
  user: PropTypes.object,
  state: PropTypes.bool,
  body: PropTypes.string,
};

export default IssueCard;
