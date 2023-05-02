import { GitHubOwner } from '@core/models/github/owner.model';

function map(source: any) {
  var data: GitHubOwner = {
    avatarUrl: source['avatar_url'],
    userUrl: source['html_url'],
    type: source['type'],
  };
  return data;
}

export const GitHubOwnerMapper = map;
