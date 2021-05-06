import React from "react";
import { render, waitFor, screen } from '@testing-library/react';

import ResultOutput from "../ResultOutput";



test("render ResultOutput with no search found",  async() => {
  
    const container = render (<ResultOutput apiData={[]} />);

    const noResult = await waitFor (() =>
        container. getByTestId("no-result")
    );
    
    expect(noResult).toBeInTheDocument();
});

test("render ResultOutput with search found",  async() => {
    const fakeData =
    [{  "id": 1,
        "html_url": "https://github.com/twbs/bootstrap",
        "full_name": "twbs/bootstrap",
        "stargazers_count": 149710,
        "language": "JavaScript",
        "open_issues_count": 362,
    }]
   
    const container = render (<ResultOutput apiData={fakeData} key={fakeData.id}/>);

    const Result = await waitFor (() =>
    container. getByTestId("result")
    );

    expect(Result).toBeInTheDocument();
    screen.debug();

});