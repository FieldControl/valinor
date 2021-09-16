import { shallow } from "enzyme";
import RepoItem from ".";
import { IRepository } from "../../config/interfaces";

describe("RepoItem", () => {
  const REPOSITORY: IRepository = {
    id: 123,
    name: "Test repository",
    owner: { login: "userowner" },
    html_url: "https://test.repository",
    language: "Javascript",
    updated_at: "1631743676394",
    description: "A repository mock",
    stargazers_count: 2000,
    open_issues_count: 20,
  };

  it("should match the snapshot", () => {
    const wrapper = shallow(<RepoItem repository={REPOSITORY} />);
    expect(wrapper).toMatchSnapshot();
  });
});
