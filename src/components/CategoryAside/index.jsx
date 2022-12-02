import {
  Table,
  Tbody,
  Tr,
  Td,
  Box,
} from "@chakra-ui/react"
import { SelectLanguage } from "../SelectLanguage";

const RenderTable = ({ children }) => (
  <Tr>
    <Td>{children}</Td>
    <Td isNumeric>255.4</Td>
  </Tr>
);


export const CategoryAside = () => {

  const items = ["Repositories", "Code", "Commits", "Issues", "Discussions", "Packages", "Marketplace", "Topics", "Wikis", "Users"]
  return (
    <Box borderColor='gray.400' borderWidth={1}  borderRadius={6}>
      <Table size={["sm", "md", "md"]} >
        <Tbody>
        <Tbody>
          {items.map((topic) => (
            <RenderTable key={topic.name}>{topic}</RenderTable>
          ))}
        </Tbody>
        </Tbody>
      </Table>
    </Box>
  );
};
