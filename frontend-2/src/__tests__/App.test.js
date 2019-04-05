import React from "react";
import { mount } from "enzyme";
import MockAdapter from "axios-mock-adapter";
import api from "../services/api";

import App from "../App";

it("should have a search input and button", () => {
  const wrapper = mount(<App />);

  expect(wrapper.find(".btn-xsearch").exists()).toBe(true);
  expect(wrapper.find(".input-xsearch").exists()).toBe(true);
});

it("should have a search list and the search to the api have to be made", () => {
  const wrapper = mount(<App />);
  const apiMock = new MockAdapter(api);

  apiMock.onGet("/search/repositories").reply(200, ["Field Control"]);

  wrapper.find(".input-xsearch").simulate("change", {
    target: { value: "React" }
  });

  wrapper.find(".btn-xsearch").simulate("click");
  expect(wrapper.find(".list-xitems").exists()).toBe(true);
});
