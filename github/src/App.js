import {
  Container,
  Paper,
  IconButton,
  InputBase,
  Alert,
  Box,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useState, useEffect } from "react";
import { api } from "./services/api";
import Card from "./components/Card";

function App() {
  const [searchValue, setSearchValue] = useState("");
  const [searchItens, setSearchItens] = useState([]);
  const [page, setPage] = useState(1);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (searchValue) {
      search(searchValue);
    }
  }, [page]);

  const search = (value) => {
    api
      .get(`search/repositories?q=${value}&page=${page}`)
      .then((response) => {
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
          {searchItens.length > 0 ? (
            <Stack direction="row" spacing={1} justifyContent="center">
              <IconButton aria-label="next">
                <KeyboardArrowLeftIcon />
              </IconButton>
              <IconButton
                aria-label="previw"
                onClick={() => {
                  setPage(page + 1);
                }}
              >
                <KeyboardArrowRightIcon />
              </IconButton>
            </Stack>
          ) : (
            <></>
          )}
        </Container>
      )}
    </Container>
  );
}

export default App;
