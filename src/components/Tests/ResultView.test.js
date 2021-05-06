import React from "react";
import { render, fireEvent, cleanup, waitFor } from '@testing-library/react';

import App from "../App";

    test("render ResultView with no content",  async() => {
        const container = render (<App />);

        const msgInitial = await waitFor (() =>
            container. getByTestId("messageInitial")
        );

        expect(msgInitial).toHaveTextContent("Por favor, insira uma busca");
    });

    test("check input", async () => {

        const container = render(<App />);

        const msgInitial = await waitFor (() =>
            container. getByTestId("messageInitial")
        );

        const inputSearch = await waitFor (() => 
            
            container.getByTestId("newInput")
        );
    
            fireEvent.change(inputSearch, {
                target: {value : "node"}
            });

        expect(msgInitial).not.toBeInTheDocument();

    });

    test("check submit if render result", async() => {
        

        const container = render(<App />);

        const msgInitial = await waitFor (() =>
            container. getByTestId("messageInitial")
        );

        const inputSearch = await waitFor (() => 
            container.getByTestId("newInput")
        );

        const formSearch = await waitFor (() => 
            container.getByTestId("new-form"),
        );

            fireEvent.change(inputSearch, {
                target: {value : "node"}
            });
    
            fireEvent.submit(formSearch);
        
        const results = await waitFor (() =>
            container.getByTestId("newresult")
        );

        expect(msgInitial).not.toBeInTheDocument();
        expect(results).toBeInTheDocument();
    })