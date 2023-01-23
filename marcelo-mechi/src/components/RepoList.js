import RepoCard from './RepoCard';

function RepoList({ repos }) {
    const renderedRepos = repos.map(repo => {
        return (
            <div className="border p-2 mb-3 rounded bg-blue-100" key={repo.id}>
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
        <div className='mt-10 bg-green-100 w-4/5'>
            {renderedRepos}
        </div>
    )
}

export default RepoList;