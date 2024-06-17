"use client";

import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Box, Input, Button, Container, HStack } from "@chakra-ui/react";
import { UserInput } from "@/components/Userinput";
import { useSearchParams } from "next/navigation";

type Message = {
  user: string;
  message: string;
};
// const socket = io();
const ChatRoom = ({ params }: { params: { chatId: string } }) => {
  const chatId = params.chatId;
  const [user, setUser] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const searchParamas = useSearchParams();
  const password = searchParamas?.get("password") || "";
  const socketRef = useRef<any>();
  useEffect(() => {
    if (!user) {
      return;
    }
    socketRef.current = io();
    socketRef.current.emit("joinRoom", { room: chatId, password });

    socketRef.current.on("joinedRoom", () => {
      console.log("Joined room:", chatId);
    });

    socketRef.current.on("error", (err: string) => {
      console.error(err);
    });

    socketRef.current.on("loadMessages", (loadedMessages: Message[]) => {
      console.log("Loaded messages:", loadedMessages);
      setMessages(loadedMessages);
    });

    socketRef.current.on("message", (msg: Message) => {
      console.log("Received message:", msg);
      setMessages((prevMessages) => [...prevMessages, msg]);
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
  if (!user) {
    return <UserInput setUser={setUser} />;
  }

  return (
    <Container maxW="container.xl" h={"100vh"} p={4}>
      <Box border={"1px solid #ccc"} borderRadius={"md"} p={4} h={"100%"}>
        <Box overflowY={"scroll"} h={"90%"}>
          {messages.map((msg, index) => (
            <Box key={index}>
              {msg.user}: {msg.message}
            </Box>
          ))}
        </Box>
        <HStack h={"100px"} spacing={4} mt={4}>
          <Input value={message} onChange={(e) => setMessage(e.target.value)} />
          <Button onClick={sendMessage}>Send</Button>
        </HStack>
      </Box>
    </Container>
  );
};

export default ChatRoom;
