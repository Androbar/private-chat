"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
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
  Divider,
  Spinner,
} from "@chakra-ui/react";
import { UserInput } from "@/components/Userinput";
import { useSearchParams } from "next/navigation";
import useIsTyping from "@/components/useIsTyping";
import { TypingIndicator } from "@/components/TypingIndicator";
import { EVENTS } from "@/constants";
import { Message, SocketEvents, User } from "@/types";
import { ChatMessage } from "@/components/ChatMessage";

const socketazo = io();

export const ChatRoom = ({
  chatId,
  userName,
}: {
  chatId: string;
  userName: string | undefined;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<User[]>([]);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const searchParamas = useSearchParams();
  const password = searchParamas?.get("password") || "";
  const socketRef = useRef<any>();
  const { isTyping, startTyping, stopTyping, cancelTyping } = useIsTyping();

  const scrollTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (socketazo && userName) {
      const user: User = { name: userName, socketId: socketazo.id };
      setUser(user);
    }
  }, [userName, socketRef]);

  useEffect(() => {
    socketazo.on(EVENTS.ERROR, (err: string) => {
      setError(err);
    });
  }, [error]);

  useEffect(() => {
    if (!user) return;

    socketazo.emit(EVENTS.JOIN_ROOM, { room: chatId, password, user });

    socketazo.on(EVENTS.JOINED_ROOM, () => {
      console.log("Joined room:", chatId);
    });

    socketazo.on(EVENTS.LOAD_MESSAGES, (loadedMessages: Message[]) => {
      setMessages(loadedMessages);
    });

    socketazo.on(EVENTS.MESSAGE, (msg: Message) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    socketazo.on(EVENTS.UPDATE_USER_LIST, (users: User[]) => {
      setUsers(users);
    });

    socketazo.on(
      EVENTS.START_TYPING,
      (typingInfo: SocketEvents["START_TYPING"]) => {
        setTypingUsers((typingUsers) => [...typingUsers, typingInfo.user]);
        // if (typingInfo.senderId !== socketazo.id) {
        // }
      }
    );

    socketazo.on(
      EVENTS.STOP_TYPING,
      (typingInfo: SocketEvents["STOP_TYPING"]) => {
        setTypingUsers((prevTypingUsers) => {
          return prevTypingUsers.filter(
            (tUser) => tUser.socketId !== typingInfo.user.socketId
          );
        });
        // if (typingInfo.senderId !== socketazo.id) {
        // }
      }
    );
    socketazo.on("disconnect", () => {
      console.log("User disconnected: " + user.name);
    });

    return () => {
      socketazo.disconnect();
    };
  }, [chatId, password, user]);

  const startTypingMessage = useCallback(() => {
    if (!socketazo) return;
    socketazo.emit(EVENTS.START_TYPING, {
      room: chatId,
      senderId: socketazo.id,
      user,
    });
  }, [chatId, user]);

  const stopTypingMessage = useCallback(() => {
    if (!socketazo) return;
    socketazo.emit(EVENTS.STOP_TYPING, {
      room: chatId,
      senderId: socketazo.id,
      user,
    });
  }, [chatId, user]);

  const handleKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      sendMessage();
    } else {
      startTyping();
    }
  };

  useEffect(() => {
    if (isTyping) startTypingMessage();
    else stopTypingMessage();
  }, [isTyping, startTypingMessage, stopTypingMessage]);

  const sendMessage = () => {
    if (message.trim() !== "") {
      socketazo.emit(EVENTS.MESSAGE, { room: chatId, user, message });
      cancelTyping();
      setMessage("");
    }
  };

  const scrollToBottom = () => {
    if (scrollTarget.current) {
      scrollTarget.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  if (!user && !userName) {
    return (
      <UserInput
        setUser={setUser}
        room={chatId}
        userName={userName}
        socketId={socketazo?.id}
      />
    );
  }
  if (!user) {
    return (
      <AbsoluteCenter>
        <Spinner size={"lg"} />{" "}
      </AbsoluteCenter>
    );
  }

  const otherUsers = users.filter((u) => u.socketId !== user.socketId);

  return (
    <Container maxW="container.xl" h={"100vh"} p={4}>
      <Grid gridTemplateColumns={"repeat(12, 1fr)"} columnGap={4} h={"100%"}>
        <GridItem colSpan={8} maxH={"calc(100vh - 20px)"}>
          <Box border={"1px solid #ccc"} borderRadius={"md"} p={4} h={"100%"}>
            <Box overflowY={"scroll"} h={"90%"}>
              {messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} user={user} />
              ))}
              <Box as="div" ref={scrollTarget} />
            </Box>
            <HStack h={"100px"} spacing={4} mt={4}>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeydown}
                onKeyUp={stopTyping}
              />
              <Button onClick={sendMessage}>Send</Button>
            </HStack>
          </Box>
        </GridItem>
        <GridItem colSpan={4}>
          <Heading as={"h4"}>Users</Heading>
          <HStack>
            <Text>{user.name}</Text>
            {typingUsers.some((tUser) => tUser.socketId === user.socketId) && (
              <TypingIndicator />
            )}
          </HStack>
          <Divider />
          {otherUsers.map((user, index) => (
            <HStack key={index}>
              <Text>{user.name}</Text>
              {typingUsers.some(
                (tUser) => tUser.socketId === user.socketId
              ) && <TypingIndicator />}
            </HStack>
          ))}
        </GridItem>
      </Grid>
    </Container>
  );
};
