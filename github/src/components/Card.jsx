import { Box, Link, Typography } from "@mui/material";

const Card = ({ item }) => {
  console.log(item);
  return (
    <Box
      sx={{
        border: "1px solid black",
        margin: "5px",
        padding: "10px",
        backgroundColor: "#d7d7d7",
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
    </Box>
  );
};

export default Card;
