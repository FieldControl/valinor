

export const request = (input) => {

    const res = fetch("https://api.github.com/search/repositories?q="+ input).then((
        result) => result.json()
    ).then((data) => {
        const dataReceived = data.items.map((item, index) => {
            let image;
            const id = index + 1;

            if (id % 3 === 0){
                image = 'illustration-grow-together.svg'
            } else if (id % 2 === 0) { 
                image = 'illustration-your-users.svg'
            } else {
                image = 'illustration-flowing-conversation.svg'
            }

            return {
                id,
                name: item.full_name,
                description: item.description,
                language: item.language,
                image,
                avatar: item.owner.avatar_url
            }
        });

        return dataReceived;
    });

    return res;
}
