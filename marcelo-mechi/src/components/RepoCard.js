function RepoCard({ name, description, watchers, forks, stars }) {

    return (
        <div>
            <h2>{name}</h2>
            <section>
                {description}
            </section>
            <section>
                watchers: {watchers}
                forks: {forks}
                stars: {stars}
            </section>
        </div>
    )
}

export default RepoCard;