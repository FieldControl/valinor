import {
  Badge,
  Box,
  Divider,
  Icon,
  Link,
  Stack,
  useMediaQuery,
} from "@chakra-ui/react";
import { FaRegStar } from "react-icons/fa";
import Moment from "react-moment";

export const RenderResults = ({ item }) => {
  const [isMObile] = useMediaQuery("(max-width: 425px)");

  return (
    <Box wrap="wrap">
      <Divider mb="3"/>
      <Link color="blue.700" href={item.html_url} mb="5">
        {item.full_name}
      </Link>
      <Box noOfLines={1} mb="1">
        {item.description}
      </Box>
      <Box d="flex" alignItems="baseline">
        {item.topics.map((topic, index) => {
          return index <= 9 ? (
            <Badge
              rounded="full"
              px="2"
              fontSize="0.7em"
              color="blue.700"
              bg="blue.100"
              key={index}
              mr='1'
            >
              {topic}
            </Badge>
          ) : null;
        })}
      </Box>
      {isMObile ? null : (
        <Stack direction="row" mb="3" align="center">
          <Box fontSize="14">
            <Icon as={FaRegStar} w="3" h="3" mr="1" />
            {item.watchers}
          </Box>
          <Box fontSize="14">{item.language}</Box>
          <Moment fromNow>{Date.parse(item.updated_at)}</Moment>
          if(parseInt(item.open_issues))
          <Box fontSize="14">{parseInt(item.open_issues)} issues need help</Box>
        </Stack>
      )}
    </Box>
  );
};
