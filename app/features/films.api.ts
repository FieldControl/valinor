import { type PeopleMetaData, type Film, type FilmMetaData } from "./types";
import httpClient from "~/http-client";
export async function getAllFilms(): Promise<Film[]> {
    const { results } = await httpClient.get<FilmMetaData>('/films')
    return results
}
export async function getPaginatedPeople(page: string = '1'): Promise<PeopleMetaData> {
    const data = await httpClient.get<PeopleMetaData>(`/people?page=${page}`)
    return data
}