import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Icon,
  IconButton,
  Link,
  Stack,
  Text,
  useMediaQuery,
} from "@chakra-ui/react";
import { FaRegStar } from "react-icons/fa";
import Moment from "react-moment";
import { useRepo } from "../../contexts/RepositoryProvider/index";
import { useEffect } from "react";
import { RenderResults } from "../RenderResults";

export const CardResults = () => {
  const { repo, getRepo, previousPage, nextPage } = useRepo();
  
  const [isMObile] = useMediaQuery("(max-width: 425px)");

  return (
    <Flex direction="column" wrap="wrap">
      {repo.map((item, index) => {
        return <RenderResults key={item.id} item={item} />;
      })}
      {isMObile ? (
        <Flex mt="5" justify="space-between" mb="8" align="center">
          <Button onClick={previousPage} _hover={{ bg: "blue.700" }}>
            Prev
          </Button>
          <Button onClick={nextPage} _hover={{ bg: "blue.700" }}>
            Next
          </Button>
        </Flex>
      ) : (
        <Flex mt="5" justify="center" mb="8" align="center">
          <Button onClick={previousPage} _hover={{ bg: "blue.700" }}>
            Prev
          </Button>
          {Array(5)
            .fill("")
            .map((_, index) => {
              return (
                <Button
                  key={index}
                  onClick={() => getRepo(index + 1)}
                  m="2"
                  _hover={{ bg: "blue.700" }}
                >
                  {index + 1}
                </Button>
              );
            })}
          <Button onClick={nextPage} _hover={{ bg: "blue.700" }}>
            Next
          </Button>
        </Flex>
      )}
    </Flex>
  );
};
