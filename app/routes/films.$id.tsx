import { defer, type LoaderArgs } from "@remix-run/node"
import { Await, useLoaderData, useNavigate } from "@remix-run/react";
import { Suspense } from "react";
import Loading from "~/components/shared/Loading";
import { getPaginatedPeople } from "~/features";
export async function loader({ params }: LoaderArgs) {
    const { id } = params
    const characters = getPaginatedPeople(id)
    return defer({ characters })
}
function findNumberInURL(url: any = '', paramName = 'page') {
    const parsedUrl = new URL(url);
    const searchParams = parsedUrl.searchParams;
    const paramValue = searchParams.get(paramName);

    if (paramValue) {
        const numberMatch = paramValue.match(/\d+/);
        if (numberMatch) {
            return parseInt(numberMatch[0]);
        }
    }

    return null;
}
export default function FilmInfo() {
    const { characters: charactersPromise } = useLoaderData<typeof loader>()
    const history = useNavigate()

    return (

        <div>
            <Suspense fallback={<Loading />}>
                <h2 className="text-xl text-gray-300 m-2">Personagens</h2>
                <Await errorElement={<p className="text-xl text-gray-300">Ooops alguma coisa de errado aconteceu enquanto buscavamos os dados, por favor tente novamente</p>} resolve={charactersPromise}>
                    {(characters) => {
                        return (
                            <div>
                                <ul className="space-y-4 text-left text-gray-500 dark:text-gray-400">
                                    {characters.results.map((character) => (
                                        <li className="text-white flex items-center space-x-3" key={character.name}>
                                            <svg width="24px" height="24px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fill="#fffafa" stroke="#fffafa"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="#f2f2f2" d="M256 32C135.1 32 36.06 127.9 32.12 248.7c136.18 13.8 311.58 13.8 447.78 0-.3-10.6-1.4-21.2-3.3-31.7H352v-18h32v-16h32v-16h45.6c-4.5-10.4-9.8-20.4-15.8-30H368v-18h48v-14h-18.7V89H368V73h-48V55h34.9c-30.8-15.14-64.6-23-98.9-23zm-64.3 64h.3c35.3 0 64 28.7 64 64s-28.7 64-64 64-64-28.7-64-64c0-35.2 28.5-63.83 63.7-64zM32.26 266.7C37.97 386.1 136.4 480 256 480c10.6-1.4 16 0 43.8-7v-18h59c8.1-4.2 16-8.9 23.5-14H368v-16h-32v-18h85.4c8.5-9.3 16.3-19.4 23.1-30H432v-16h-80v-18h16v-16h48v-16h32v-16h28.5c1.7-9.4 2.7-18.8 3.2-28.3-136.8 13.7-310.6 13.7-447.44 0z"></path></g></svg>
                                            <span className="m-1">{character.name}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex space-x-2 m-2">
                                    {characters.previous && <button className="text-white bg-gray-800 hover:bg-gray-400font-bold py-2 px-4 rounded inline-flex items-center" onClick={() => {
                                        const param = findNumberInURL(characters.previous)
                                        return history(`/films/${param}`)
                                    }}> <span>{'<'} Anterior</span></button>}
                                    {characters.next && <button className="text-white bg-gray-800 hover:bg-gray-400font-bold py-2 px-4 rounded inline-flex items-center" onClick={() => {
                                        const param = findNumberInURL(characters.next)
                                        return history(`/films/${param}`)
                                    }}> <span>Proximo {'>'} </span></button>}
                                </div>
                            </div>
                        )
                    }}
                </Await>
            </Suspense>
        </div >
    );
}