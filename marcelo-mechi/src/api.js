import axios from 'axios';

const searchRepos = async (username) => {
    try {
        const response = await axios.get(`https://api.github.com/users/${username}/repos`);
        return response.data;

    } catch (err) {
        console.log('It got and error!');
    }

}

export default searchRepos;