import {
  Container,
  Paper,
  IconButton,
  InputBase,
  Alert,
  Box,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";
import { api } from "./services/api";
import Card from "./components/Card";

function App() {
  const [searchValue, setSearchValue] = useState("");
  const [searchItens, setSearchItens] = useState([]);
  const [err, setErr] = useState(null);
  console.log(searchItens);
  const search = (value) => {
    api
      .get(`search/repositories?q=${value}`)
      .then((response) => {
        console.log(response);
        setSearchItens(response.data.items);
        setErr(null);
      })
      .catch((err) => setErr(err));
  };
  return (
    <Container
      maxWidth="sm"
      sx={{
        p: "10px",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Paper
        sx={{
          p: "2px 4px",
          display: "flex",
          alignItems: "center",
          width: 400,
          marginBottom: "10px",
        }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search Repository"
          inputProps={{ "aria-label": "Search Repository" }}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <IconButton
          onClick={() => search(searchValue)}
          sx={{ p: "10px" }}
          aria-label="search"
        >
          <SearchIcon />
        </IconButton>
      </Paper>

      {err !== null ? (
        <Box>
          <Alert severity="error">{err.message}</Alert>
        </Box>
      ) : (
        <Container>
          {searchItens.map((item) => (
            <Card key={item.id} item={item} />
          ))}
        </Container>
      )}
    </Container>
  );
}

export default App;
