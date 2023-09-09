import { formatDateMonthAbbreviated } from '@/helpers/date';

export default issue => ({
    title: issue.title,
    url: issue.html_url,
    number: issue.number,
    owner: {
        name: issue.user.login
    },
    labels: issue.labels.map(label => ({
        name: label.name,
        color: `#${label.color}`,
        description: label.description
    })),
    comments_count: issue.comments,
    opened: formatDateMonthAbbreviated(issue.created_at)
});