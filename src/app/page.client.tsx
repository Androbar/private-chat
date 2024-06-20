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
import Cookies from "js-cookie";

const HomePage = () => {
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [user, setUser] = useState("");
  const [userError, setUserError] = useState("");
  const router = useRouter();
  const socketRef = useRef<any>();

  useEffect(() => {
    socketRef.current = io();
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const createChat = () => {
    if (!password) {
      setPasswordError("Password is required");
    }
    if (!user) {
      setUserError("Name is required");
    }
    if (!user || !password) {
      return;
    }
    const chatId = Math.random().toString(36).substring(7);
    socketRef.current.emit(EVENTS.CREATE_ROOM, { room: chatId, password });
    Cookies.set("userName", user);

    router.push(`/chat/${chatId}`);
  };

  const handleKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      createChat();
    }
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
            placeholder="Enter your name"
            value={user}
            onChange={(e) => {
              setUser(e.target.value);
              setUserError("");
            }}
            onKeyDown={handleKeydown}
            m={3}
          />
          {userError && (
            <Text mx={3} color="red.500">
              {userError}
            </Text>
          )}
          <Input
            placeholder="Enter chat password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError("");
            }}
            onKeyDown={handleKeydown}
            m={3}
          />
          {passwordError && (
            <Text mx={3} color="red.500">
              {passwordError}
            </Text>
          )}

          <Button onClick={createChat} m={3} w={"100%"}>
            Create Chat
          </Button>
        </Box>
      </AbsoluteCenter>
    </Container>
  );
};

export default HomePage;
