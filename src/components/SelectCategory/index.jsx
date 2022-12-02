import { HStack, Select, Text } from "@chakra-ui/react";

export const SelectCategory = () => {
  const items = [
    "Repositories",
    "Code",
    "Commits",
    "Issues",
    "Discussions",
    "Packages",
    "Marketplace",
    "Topics",
    "Wikis",
    "Users",
  ];
  return (
    <HStack mt="5">
      <Text fontWeight="bold">Language</Text>
      <Select>
        {items.map((topic) => (
          <option key={topic} value={topic}>
            {topic}
          </option>
        ))}
      </Select>
    </HStack>
  );
};
