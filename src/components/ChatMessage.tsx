import { Message, User } from "@/types";
import { Box, Flex, Text } from "@chakra-ui/react";

export function ChatMessage({
  message,
  user,
}: {
  message: Message;
  user: User;
}) {
  const align = message.user.name === user.name ? "flex-end" : "flex-start";
  return (
    <Flex direction="column" mb={2} alignItems={align}>
      <Box px={3}>
        <Text fontSize={"sm"}>{message.user.name}</Text>
      </Box>
      <Box
        border={"1px solid #ccc"}
        borderRadius={20}
        py={1}
        px={3}
        w={"fit-content"}
        m={1}
        bg={message.user.name === user.name ? "#ccc" : "#eee"}
      >
        <Text fontSize={"lg"}>{message.message}</Text>
      </Box>
    </Flex>
  );
}
