export interface Issues {
    total_count: number,
    incomplete_results: boolean,
    items: Array<Item>
}

interface Item {
    url: string,
    repository_url: string,
    labels_url: string,
    comments_url: string,
    events_url: string,
    html_url: string,
    id: number,
    node_id: string,
    number: number,
    title: string,
    user: User,
    labels: string[],
    state: string,
    locked: boolean,
    assignee: string,
    assignees: string[],
    milestone: string,
    comments: number,
    created_at: string,
    updated_at: string,
    closed_at: string,
    author_association: string,
    active_lock_reason: string,
    draft: boolean,
    pull_request: PullRequest,
    body: string,
    reactions: Reactions,
    timeline_url: string,
    performed_via_github_app: string,
    state_reason: string,
    score: number
}

interface User {
    login: string,
    id: number,
    node_id: string,
    avatar_url: string,
    gravatar_id: string,
    url: string,
    html_url: string,
    followers_url: string,
    following_url: string,
    gists_url: string,
    starred_url: string,
    subscriptions_url: string,
    organizations_url: string,
    repos_url: string,
    events_url: string,
    received_events_url: string,
    type: string,
    site_admin: boolean
}

interface PullRequest {
    url: string,
    html_url: string,
    diff_url: string,
    patch_url: string,
    merged_at: string
}

interface Reactions {
    url: string,
    total_count: number,
    laugh: number,
    hooray: number,
    confused: number,
    heart: number,
    rocket: number,
    eyes: number
}