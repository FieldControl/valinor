export type Film = {
    title: string
    episode_id: number
    opening_crawl: string
    director: string
    producer: string
    release_date: string
    species: string[]
    starships: string[]
    vehicles: string[]
    characters: string[]
    planets: string[]
    url: string
    created: string
    edited: string
}
export type People = {
    "name": "Luke Skywalker",
    "height": "172",
    "mass": "77",
    "hair_color": "blond",
    "skin_color": "fair",
    "eye_color": "blue",
    "birth_year": "19BBY",
    "gender": "male",
    "homeworld": "https://swapi.dev/api/planets/1/",
    "films": [
        "https://swapi.dev/api/films/1/",
        "https://swapi.dev/api/films/2/",
        "https://swapi.dev/api/films/3/",
        "https://swapi.dev/api/films/6/"
    ],
    "species": [],
    "vehicles": [
        "https://swapi.dev/api/vehicles/14/",
        "https://swapi.dev/api/vehicles/30/"
    ],
    "starships": [
        "https://swapi.dev/api/starships/12/",
        "https://swapi.dev/api/starships/22/"
    ],
    "created": "2014-12-09T13:50:51.644000Z",
    "edited": "2014-12-20T21:17:56.891000Z",
    "url": "https://swapi.dev/api/people/1/"
}
export type FilmMetaData = {
    count: number,
    next: string | null,
    previous: number | null,
    results: Array<Film>
}
export type PeopleMetaData = {
    count: number,
    next: string | null,
    previous: number | null,
    results: Array<People>
}