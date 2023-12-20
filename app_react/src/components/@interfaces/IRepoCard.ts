export interface RepoCardProps {
    full_name: string;
    owner: {
      avatar_url: string;
    };
    description: string;
    updated_at: string;
    watchers_count: number;
    language: string;
    topics: string[];
    html_url: string
  }
  