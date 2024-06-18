"use client";

import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import {
  Box,
  Input,
  Button,
  Container,
  HStack,
  Flex,
  Text,
  AbsoluteCenter,
  Grid,
  GridItem,
  Heading,
} from "@chakra-ui/react";
import { UserInput } from "@/components/Userinput";
import { useSearchParams } from "next/navigation";

type Message = {
  user: string;
  message: string;
};

const ChatRoom = ({ params }: { params: { chatId: string } }) => {
  const chatId = params.chatId;
  const [user, setUser] = useState<string>("");
  const [users, setUsers] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const searchParamas = useSearchParams();
  const password = searchParamas?.get("password") || "";
  const socketRef = useRef<any>();

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io();
    }
    socketRef.current.on("error", (err: string) => {
      console.log("error", error);
      setError(err);
    });
  }, [error]);

  useEffect(() => {
    if (!user) {
      return;
    }
    if (!socketRef.current) {
      socketRef.current = io();
    }
    socketRef.current.emit("joinRoom", { room: chatId, password, user });

    socketRef.current.on("joinedRoom", () => {
      console.log("Joined room:", chatId);
    });

    socketRef.current.on("loadMessages", (loadedMessages: Message[]) => {
      console.log("Loaded messages:", loadedMessages);
      setMessages(loadedMessages);
    });

    socketRef.current.on("message", (msg: Message) => {
      console.log("Received message:", msg);
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    socketRef.current.on("updateUserList", (users: string[]) => {
      console.log("User joined:", users);
      setUsers(users);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [chatId, password, user]);

  const sendMessage = () => {
    if (message.trim() !== "") {
      console.log("Sending message to room:", chatId);
      socketRef.current.emit("message", { room: chatId, user, message });

      setMessage("");
    }
  };

  if (error) {
    return (
      <Box w={"100%"} h={"100vh"}>
        <AbsoluteCenter
          p={20}
          border={"1px solid red.300"}
          borderRadius={"md"}
          bgColor={"red.100"}
        >
          {error}
        </AbsoluteCenter>
      </Box>
    );
  }
  if (!user) {
    return <UserInput setUser={setUser} />;
  }

  return (
    <Container maxW="container.xl" h={"100vh"} p={4}>
      <Grid gridTemplateColumns={"repeat(12, 1fr)"} columnGap={4} h={"100%"}>
        <GridItem colSpan={8}>
          <Box border={"1px solid #ccc"} borderRadius={"md"} p={4} h={"100%"}>
            <Box overflowY={"scroll"} h={"90%"}>
              {messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} user={user} />
              ))}
            </Box>
            <HStack h={"100px"} spacing={4} mt={4}>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button onClick={sendMessage}>Send</Button>
            </HStack>
          </Box>
        </GridItem>
        <GridItem colSpan={4}>
          <Heading as={"h4"}>Users</Heading>
          {users.map((user, index) => (
            <Box key={index}>
              <Text>{user}</Text>
            </Box>
          ))}
        </GridItem>
      </Grid>
    </Container>
  );
};

export default ChatRoom;

function ChatMessage({ message, user }: { message: Message; user: string }) {
  const align = message.user === user ? "flex-end" : "flex-start";
  return (
    <Flex direction="column" mb={2} alignItems={align}>
      <Box px={3}>
        <Text fontSize={"sm"}>{message.user}</Text>
      </Box>
      <Box
        border={"1px solid #ccc"}
        borderRadius={20}
        py={1}
        px={3}
        w={"fit-content"}
        m={1}
        bg={message.user === user ? "#ccc" : "#eee"}
      >
        <Text fontSize={"lg"}>{message.message}</Text>
      </Box>
    </Flex>
  );
}
