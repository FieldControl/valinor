import { HStack, Select, Text } from "@chakra-ui/react";
import { useRepo } from "../../contexts/RepositoryProvider";

export const SelectLanguage = () => {
    const { topics } = useRepo();
  return (
    <HStack mt="5">
      <Text fontWeight="bold">Language</Text>
      <Select>
        {topics.map((topic) => (
          <option key={topic.name} value={topic.name}>
            {topic.name}
          </option>
        ))}
      </Select>
    </HStack>
  );
};
