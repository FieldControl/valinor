import { Table, Tbody, Tr, Td, Box, Thead, Th } from "@chakra-ui/react";
import { useRepo } from "../../contexts/RepositoryProvider";

const RenderTable = ({ children }) => (
  <Tr>
    <Td>{children.name}</Td>
    <Td isNumeric>25.4</Td>
  </Tr>
);

export const LanguageAside = () => {
  const { topics } = useRepo();

  return (
    <Box borderColor="gray.400" borderWidth={1} borderRadius={6} mt="5">
      <Table size="lg" variant="unstyled">
        <Thead>
          <Tr>
            <Th>Language</Th>
          </Tr>
        </Thead>
        <Tbody>
          {topics.map((topic) => (
            <RenderTable key={topic.name}>{topic}</RenderTable>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};
