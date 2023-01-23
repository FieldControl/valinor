import RepoCard from './RepoCard';

function RepoList({ repos }) {
    const renderedRepos = repos.map(repo => {
        return (
            <div className="border p-2 px-3 mb-3 rounded bg-blue-100 shadow border-blue-400" key={repo.id}>
                <RepoCard
                    name={repo.name}
                    description={repo.description}
                    watchers={repo.watchers}
                    stars={repo.stargazers_count}
                    repoUrl={repo.html_url}
                />
            </div>
        )
    })

    return (
        <div className='grid sm:grid-cols-2 gap-x-8 gap-y-2 mt-10 w-4/5'>
            {renderedRepos}
        </div>
    )
}

export default RepoList;