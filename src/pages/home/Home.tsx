import './Home.css'
import axios from "axios"
import { useEffect, useState } from "react"
import { Repo } from "../../ui/Repo"

export function Home() {
    const [query, setQuery] = useState<string>('')
    const [repo, setRepo] = useState<[]>([])
    
    const [page, setPage] = useState(1)

    const [limit, setLimit] = useState(10)


    const handleQueryInput = (e: { target: { value: any } }) => {
        const value = e.target.value
        setQuery(value)
    }

    const handlePrevPage = () => {
        setPage(page => {
            if (page === 1) {
                return page
            } else {
                return page - 1
            }
        })
    }

    const handleNextPage = () => {
        setPage(page =>
            page + 1)
    }

    const handlePageLimit = (e: { target: { value: any } }) => {
        const value = e.target.value
        setLimit(parseInt(value))
    }

    const fetchRepo = async () => {
        try {
            const { data } = await axios.get('https://api.github.com/search/repositories?q=' + query, {
                params: {
                    page,
                    per_page: limit
                }
            })
            console.log(data)
            return data?.items
        } catch (error) {
            return null
        }
    }

    const handleSearchRepo = async (e: { preventDefault: () => void }) => {
        e.preventDefault()
        if (query) {
            const items = await fetchRepo()
            setRepo(items)
        }
    }

    useEffect(() => {
        const displayRepoOnChange = async () => {
            if (query) {
                const items = await fetchRepo()
                setRepo(items)
            }
        }
        displayRepoOnChange()
    }, [page, limit])

    return (
        <div className="container">
            <div className="searchForm">
                <h2>Github Search Repository</h2>
                <form>
                    <input placeholder='Digite o repositório' value={query} onChange={handleQueryInput} type='text' />
                    <button onClick={handleSearchRepo}>Search</button>
                </form>
        </div>
        <div className="searchResults">
                <div className='moreOptions'>
                    <label>
                        <small>Per Page</small>
                        <select onChange={handlePageLimit}>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </label>
                    <div className="pagination">
                        <button onClick={handlePrevPage}>{page}</button>
                        <button onClick={handleNextPage}>{page + 1}</button>
                    </div>

                </div>
                {repo ? (repo.map((repo, index) : any => {
                    return <Repo repo={repo} key={index} id={0} 
                        avatar_url={""} name={""} bio={""} 
                        description={""} language={""}
                        followers={0} following={0} 
                        location={""} blog={""} html_url={""} />
                })
                ) : (
                    <h2> Não tem nada aqui...</h2>
                )}
            </div>
        </div>
    )}