"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import {
  Box,
  Input,
  Button,
  Container,
  HStack,
  Text,
  AbsoluteCenter,
  Grid,
  GridItem,
  Heading,
} from "@chakra-ui/react";
import { UserInput } from "@/components/Userinput";
import { useSearchParams } from "next/navigation";
import useIsTyping from "@/components/useIsTyping";
import { TypingIndicator } from "@/components/TypingIndicator";
import { EVENTS } from "@/constants";
import { Message, User } from "@/types";
import { ChatMessage } from "@/components/ChatMessage";

export const ChatRoom = ({
  chatId,
  userName,
}: {
  chatId: string;
  userName: string | undefined;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const searchParamas = useSearchParams();
  const password = searchParamas?.get("password") || "";
  const socketRef = useRef<any>();
  const { isTyping, startTyping, stopTyping, cancelTyping } = useIsTyping();

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io();
    }
    socketRef.current.on(EVENTS.ERROR, (err: string) => {
      console.log("error", error);
      setError(err);
    });
  }, [error]);

  useEffect(() => {
    if (!user) return;

    if (!socketRef.current) {
      socketRef.current = io();
    }
    socketRef.current.emit(EVENTS.JOIN_ROOM, { room: chatId, password, user });

    socketRef.current.on(EVENTS.JOINED_ROOM, () => {
      console.log("Joined room:", chatId);
    });

    socketRef.current.on(EVENTS.LOAD_MESSAGES, (loadedMessages: Message[]) => {
      console.log("Loaded messages:", loadedMessages);
      setMessages(loadedMessages);
    });

    socketRef.current.on(EVENTS.MESSAGE, (msg: Message) => {
      console.log("Received message:", msg);
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    socketRef.current.on(EVENTS.UPDATE_USER_LIST, (users: User[]) => {
      console.log("User joined:", users);
      setUsers(users);
    });

    socketRef.current.on(
      EVENTS.START_TYPING,
      (typingInfo: { user: string; room: string; senderId: string }) => {
        setTypingUsers((typingUsers) => [...typingUsers, typingInfo.user]);
        // if (typingInfo.senderId !== socketRef.current.id) {
        // }
      }
    );

    socketRef.current.on(
      EVENTS.STOP_TYPING,
      (typingInfo: { user: string; room: string; senderId: string }) => {
        setTypingUsers((prevTypingUsers) => {
          return prevTypingUsers.filter((u) => u !== typingInfo.user);
        });
        // if (typingInfo.senderId !== socketRef.current.id) {
        // }
      }
    );
    socketRef.current.on("disconnect", () => {
      console.log("User disconnected: " + user.name);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [chatId, password, user]);

  const startTypingMessage = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit(EVENTS.START_TYPING, {
      room: chatId,
      senderId: socketRef.current.id,
      user,
    });
  }, [chatId, user]);

  const stopTypingMessage = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit(EVENTS.STOP_TYPING, {
      room: chatId,
      senderId: socketRef.current.id,
      user,
    });
  }, [chatId, user]);

  useEffect(() => {
    if (isTyping) startTypingMessage();
    else stopTypingMessage();
  }, [isTyping, startTypingMessage, stopTypingMessage]);

  const sendMessage = () => {
    if (message.trim() !== "") {
      socketRef.current.emit(EVENTS.MESSAGE, { room: chatId, user, message });
      cancelTyping();
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
    return (
      <UserInput
        setUser={setUser}
        userName={userName}
        socketId={socketRef.current?.id}
      />
    );
  }

  return (
    <Container maxW="container.xl" h={"100vh"} p={4}>
      <Grid gridTemplateColumns={"repeat(12, 1fr)"} columnGap={4} h={"100%"}>
        <GridItem colSpan={8} maxH={"calc(100vh - 20px)"}>
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
                onKeyDown={startTyping}
                onKeyUp={stopTyping}
              />
              <Button onClick={sendMessage}>Send</Button>
            </HStack>
          </Box>
        </GridItem>
        <GridItem colSpan={4}>
          <Heading as={"h4"}>Users</Heading>
          {users.map((user, index) => (
            <HStack key={index}>
              <Text>{user.name}</Text>
              {typingUsers.includes(user.name) && <TypingIndicator />}
            </HStack>
          ))}
        </GridItem>
      </Grid>
    </Container>
  );
};