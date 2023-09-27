export const getRepos = async (repositorie: string) => {
    try {
        const response = await fetch(`https://api.github.com/search/repositories?q=${repositorie}`)

        return response.json()
    } catch(error) {
        console.log(error)
    }
}