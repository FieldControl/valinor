import { formatDateTimeDifference } from '@/helpers/date';

const description = desc => {
    desc = desc || '';
    return desc.length > 137 ? desc.substr(0, 137) + '...' : desc;
}

export default repository => ({
    name: repository.name,
    owner: repository.owner.login,
    description: description(repository.description),
    topics: repository.topics.splice(0, 5),
    forks: repository.forks,
    stars: repository.watchers,
    language: repository.language,
    avatar: `${repository.owner.html_url}.png?size=40`,
    updated: formatDateTimeDifference(repository.updated_at)
});