import { render, screen } from "@testing-library/react";
import { mocked } from "ts-jest/utils";
import React from "react";
import { AsideSearch } from ".";
import { api } from "../../services/api";

jest.mock("../../services/api");
jest.mock("next/link");

const dataAnime = {
  data: {
    count: 3,
    current_page: 1,
    documents: [1, 2, 3],
    last_page: 3,
  },
};

describe("AsideSearch Component", () => {
  // it("should be load more animes when clicked in 'Carregar mais' button", async () => {
  //   const apiGetAnimeMocked = mocked(api.get).mockResolvedValueOnce({
  //     ...dataAnime,
  //   } as any);
  //   render(<AsideSearch />);
  //   console.log(apiGetAnimeMocked);
  //   expect(apiGetAnimeMocked).toHaveBeenCalledTimes(2);
  // });
});
