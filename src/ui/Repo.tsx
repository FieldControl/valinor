import star from "../assets/star.png"
import "./repo.css"

export function Repo({ repo }: any) {
    const { name, html_url, description, language, stargazers_count, open_issues } = repo
    return (
        <div className="repo">
            <h3>
                {/* URL */}
                <a href={html_url} target="_blank">{name}</a>
            </h3>
            {/* estrelas */}
            <p>
                <img src={star} alt="" />
                {stargazers_count}
            </p><br />

            {/* Descrição */}
            <div className="descriptions">
                <h4>Descrição</h4>
                <p>{description}</p><br />

                {/* Issues */}
                <p>Issues: {open_issues}</p>
            <h4>Linguagem: </h4>
            {language && <small>Escrito em {language}</small>}
            </div>
        </div>

    )
}