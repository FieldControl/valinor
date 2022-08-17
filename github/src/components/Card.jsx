import { Box, Link, Typography } from "@mui/material";
import { Stack } from "@mui/system";

const Card = ({ item }) => {
  return (
    <Box
      sx={{
        border: "1px solid black",
        margin: "5px",
        padding: "10px",
        backgroundColor: "#a9a7a7",
      }}
    >
      <Link
        href={item.html_url}
        underline="hover"
        target="_blank"
        rel="noopener"
      >
        {item.full_name}
      </Link>
      <Typography variant="subtitle1" component="div">
        {item.description}
      </Typography>
      <Stack direction="row" spacing={1}>
        <Typography variant="subtitle2" component="div" color="green">
          {item.language}
        </Typography>
        <Typography variant="subtitle2" component="div" color="red">
          {item.open_issues_count} issues need help
        </Typography>
        <Typography variant="subtitle2" component="div" color="yellow">
          ⭐{item.stargazers_count}
        </Typography>
      </Stack>
    </Box>
  );
};

export default Card;
