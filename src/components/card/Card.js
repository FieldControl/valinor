import { encodeEmojis } from "../../utils/encodeEmojis";
import classes from "./Card.module.scss";

function Card(props) {
  let { values } = props;

  return (
    <>
      <div
        title={"Ir para o repositório " + values.name}
        onClick={(_) => goToGitHub(values.html_url)}
        className={classes.container}
      >
        <div className={classes.card}>
          <div className={classes.title}>
            <h1>{values.name}</h1>
            <h2>
              <b>Criador: </b>
              <u
                title={"Ir para o usuário " + values.owner.login}
                onClick={(_) => goToGitHub(values.owner.html_url)}
              >
                {values.owner.login}
              </u>
            </h2>
            {values.language ? (
              <h2 title={"Feito em " + values.language}>
                <b>
                  <i className="fa fa-code"></i>&nbsp;{values.language}
                </b>
              </h2>
            ) : null}
            <hr></hr>
          </div>
          <span>{encodeEmojis(values.description)}</span>
          <div className={classes.content}>
            <div className={classes.icons}>
              <div title="Estrelas">
                <i className="fa fa-star"></i>
                &nbsp;
                {values.stargazers_count}
              </div>
              <div title="Forks">
                <i className="fa fa-code-fork"></i>
                &nbsp;
                {values.forks_count}
              </div>
              <div
                onClick={(_) => goToGitHub(values.html_url + "/issues")}
                title="Ir para issues"
              >
                <i className="fa fa-dot-circle-o"></i>
                &nbsp;
                <u>Issues/PR ({values.open_issues})</u>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function goToGitHub(githubLink) {
  window.open(githubLink, "_blank");
}

export default Card;
