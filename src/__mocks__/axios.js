const mockResponse = {
  data: {
    items: [
      {
        id: 1,
        clone_url: 'https://github.com/nodejs/node.git',
        description:
          'Node.js JavaScript runtime :sparkles::turtle::rocket::sparkles:',
        full_name: 'nodejs/node',
        forks: 6558,
        stargazers_count: 4447,
        language: 'Javascript',
        open_issues: 26,
        watchers: 4854,
      },
    ],
  },
};

export default {
  get: jest.fn().mockResolvedValue(mockResponse),
};
