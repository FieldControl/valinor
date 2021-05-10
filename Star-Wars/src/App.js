import { useState } from "react";
import {
  Grid,
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  TextField,
} from "@material-ui/core";
import { getApi } from "./api";

import "./App.css";

function App() {
  const [people, setPeople] = useState([]);

  async function handleSearch(e) {
    const response = await getApi.get(
      `/people/?search=${e.currentTarget.value.toLowerCase()}`
    );

    setPeople(response.data.results);
  }

  return (
    <>
      <Grid container>
        <Grid item xs={12} sm={6}>
          <header>
            <h1>Star Wars Characters</h1>
            <p>Search about your favorite Star Wars character</p>
          </header>
          <TextField
            id="Search"
            label="Search"
            onChange={handleSearch}
            size="medium"
          />

          {people.map((item, index) => {
            return (
              <>
                <Accordion>
                  <AccordionSummary
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography key={index}>{item.name}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>
                      <span>Birth Year:</span> {item.birth_year}
                    </Typography>
                  </AccordionDetails>
                  <AccordionDetails>
                    <Typography>
                      <span>Gender:</span> {item.gender}
                    </Typography>
                  </AccordionDetails>
                  <AccordionDetails>
                    <Typography>
                      <span>Height:</span> {item.height}
                    </Typography>
                  </AccordionDetails>
                  <AccordionDetails>
                    <Typography>
                      <span>Mass:</span> {item.mass}
                    </Typography>
                  </AccordionDetails>
                  <AccordionDetails>
                    <Typography>
                      <span>Hair Color:</span> {item.hair_color}
                    </Typography>
                  </AccordionDetails>
                  <AccordionDetails>
                    <Typography>
                      <span>Skin Color:</span> {item.skin_color}
                    </Typography>
                  </AccordionDetails>
                  <AccordionDetails>
                    <Typography>
                      <span>Eye Color:</span> {item.eye_color}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </>
            );
          })}
        </Grid>
        <Grid
          item
          xs={12}
          sm={6}
          justify="center"
          alignItems="center"
          container
        >
          <img src={"/r2d2.png"} alt={"r2d2"} />
        </Grid>
      </Grid>
    </>
  );
}

export default App;
