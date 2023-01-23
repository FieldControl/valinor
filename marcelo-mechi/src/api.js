import axios from 'axios';

const searchRepos = async (username) => {
    try {
        const response = await axios.get(`https://api.github.com/users/${username}/repos`, {
            headers: {
                'Authorization': `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`
            }
        });
        return response;

    } catch (err) {
        console.log('It got and error!');
    }

}

export default searchRepos;