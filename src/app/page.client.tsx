"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  Input,
  AbsoluteCenter,
} from "@chakra-ui/react";
import { io } from "socket.io-client";
import { EVENTS } from "@/constants";

const HomePage = () => {
  const [password, setPassword] = useState("");
  const router = useRouter();
  const socketRef = useRef<any>();

  useEffect(() => {
    socketRef.current = io();
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const createChat = () => {
    const chatId = Math.random().toString(36).substring(7);
    socketRef.current.emit(EVENTS.CREATE_ROOM, { room: chatId, password });

    router.push(`/chat/${chatId}?password=${password}`);
  };

  return (
    <Container maxW="6xl" p={4} height={"100vh"}>
      <AbsoluteCenter p={10} border="1px solid #ccc" borderRadius="md">
        <Heading as="h1" textAlign={"center"} mb={5}>
          Private Chat
        </Heading>
        <Box>
          <Text textAlign={"center"} fontSize={"lg"}>
            Enter a password to create a private chat. You will be able to
            invite other people to join the chat with url and password.
          </Text>
        </Box>
        <Box maxW={"sm"} mx="auto" mt={5}>
          <Input
            placeholder="Enter chat password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            m={3}
          />
          <Button onClick={createChat} m={3} w={"100%"}>
            Create Chat
          </Button>
        </Box>
      </AbsoluteCenter>
    </Container>
  );
};

export default HomePage;
