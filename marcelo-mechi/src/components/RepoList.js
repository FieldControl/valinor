import RepoCard from './RepoCard';

function RepoList({ repos }) {
    const renderedRepos = repos.map(repo => {
        return (
            <div className="border p-2 mb-3 rounded" key={repo.id}>
                <RepoCard
                    name={repo.name}
                    description={repo.description}
                    watchers={repo.watchers}
                    forks={repo.forks}
                    stars={repo.stars}
                />
            </div>
        )
    })

    return (
        <div className='mt-10'>
            {renderedRepos}
        </div>
    )
}

export default RepoList;