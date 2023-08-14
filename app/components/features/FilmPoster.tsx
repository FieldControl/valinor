import episode1 from '../../assets/1.png'
import episode2 from '../../assets/2.png'
import episode3 from '../../assets/3.png'
import episode4 from '../../assets/4.png'
import episode5 from '../../assets/5.png'
import episode6 from '../../assets/6.png'

const Posters = [
    episode1,
    episode2,
    episode3,
    episode4,
    episode5,
    episode6
]
type FilmPosterProps = {
    title: string,
    episode_id: number,
    release_date: string,
}
const FilmPoster: React.FC<FilmPosterProps> = ({ title, episode_id, release_date }) => {
    return (
        <div className="flex flex-wrap ">

            <div className="w-full md:w-full border border-transparent hover:border-yellow-500 lg:w-1/2 max-w-4xl rounded overflow-hidden shadow-lg m-4 flex justify-between">
                <div className="md:flex-shrink-0">
                    <img className="md:w-56"
                        src={Posters[Posters.length - episode_id]}
                        alt="A Quiet Place movie poster" />
                </div>
                <div className="flex flex-col flex-grow px-8 py-4 bg-color-333">
                    <h3 className="font-bold text-4xl md:text-2xl lg:text-2xl text-gray-200 movie--title">{title}</h3>
                    <span className="movie--year text-yellow-400 font-bold text-xl lg:text-sm lg:mb-4">{release_date.split("-")[0]}</span>
                    <div className="flex-grow">
                        <p className="text-xl md:text-base lg:text-base text-gray-100 leading-snug truncate-overflow">A family is forced to live in silence while hiding from creatures that hunt by sound.</p>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default FilmPoster
