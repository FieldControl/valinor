import './styles.scss'
import IconStar from '../../assets/icons/icon-star.svg'
import IconLang from '../../assets/icons/icon-language.svg'
import IconIssues from '../../assets/icons/icon-issues.svg'
import IconFork from '../../assets/icons/icon-fork.svg'
import { useEffect, useState } from 'react'

export default function ListRepository({list, amountRepositories}){
    
    const [listRepository, setListRepository] = useState(list)

    useEffect(() => {
        setListRepository(list)
    }, [list])

    return(
        <section className='list-repository' id="section-respositories">
            <div className='title'>Showing {amountRepositories && amountRepositories} available repositor results</div>

            <div className='list'>

                {listRepository && listRepository.map((item, index) => {


                    let topics = []
                    for (let i = 0; i < item.topics.length; i++) {
                        topics.push(<div className='topic' key={i}><a href={`https://github.com/topics/${item.topics[i]}`}>{item.topics[i]}</a></div>)
                    }

                    return(

                        <div className='repository' key={index}>
                            <a href={item.html_url}><h3 className='title-repo'>{item.full_name}</h3></a>
                            <p className='description'>{item.description}</p>
                            <div className='topics'>
                                {topics}
                            </div>

                            <div className='footer-repo'>
                                
                                    <div className='item-footer count-star'>
                                        <img src={IconStar} alt="Icon Star" />
                                        <p><a href={`https://github.com/${item.full_name}/stargazers`}>{item.stargazers_count}</a></p>
                                    </div>
                                
                                {item.language && <div className='item-footer language'>
                                    <img src={IconLang} alt="Icon Language" />
                                    <p>{item.language}</p>
                                </div>}
                                <div className='item-footer count-issues'>
                                    <img src={IconIssues} alt="Icon Issues" />
                                    <p><a href={`https://github.com/${item.full_name}/issues`}>{item.open_issues_count} issues</a></p>
                                </div>
                                <div className='item-footer count-forks'>
                                    <img src={IconFork} alt="Icon Forks" />
                                    <p>{item.forks_count} forks</p>
                                </div>
                            </div>
                        </div>
                    )
                })}

                {!listRepository && <div>AQUI</div>}
            </div>

        </section>
    )
}