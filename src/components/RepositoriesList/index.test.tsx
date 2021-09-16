import { mount } from "enzyme";
import Repositories from ".";
import { Image } from "./styles";
import GlobalState from "../../global/GlobalState";

describe("Repositories", () => {
  it("should match the snapshot", () => {
    const wrapper = mount(
      <GlobalState>
        <Repositories />
      </GlobalState>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it("should render the octocat image", () => {
    const wrapper = mount(
      <GlobalState>
        <Repositories />
      </GlobalState>
    );
    expect(wrapper.find(Image)).toHaveLength(1);
  });
});
