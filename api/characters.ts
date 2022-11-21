import axios from "axios";

export async function GetCharacters () {
    const json = await axios.get(`${process.env.BASE_API_URL}/v1/public/characters`);
}
