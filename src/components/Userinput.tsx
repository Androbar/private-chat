import {
  AbsoluteCenter,
  Box,
  Button,
  Container,
  Input,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import Cookies from "js-cookie";
import { User } from "@/types";

export function UserInput({
  userName = "",
  socketId,
  room,
  setUser,
}: {
  userName: string | undefined;
  socketId: string | undefined;
  room: string;
  setUser: (user: User) => void;
}) {
  const [name, setName] = useState<string>(userName);
  const [nameError, setNameError] = useState<string>(userName);
  const [password, setPassword] = useState<string>(userName);
  const [passwordError, setPasswordError] = useState<string>(userName);

  const handleSetUser = async () => {
    if (!password) {
      setPasswordError("Password is required");
    }
    if (!name) {
      setNameError("Name is required");
    }
    if (!name || !password) {
      return;
    }
    const response = await fetch(`/api/${room}/verify-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });
    const verified = await response.json();

    if (verified.status !== 200) {
      setPasswordError(verified.body.error);
      return;
    }
    const cleanedName = name.trim();
    if (cleanedName !== "") {
      // set cookie
      Cookies.set("userName", cleanedName);
      setUser({ name: cleanedName, socketId });
    }
  };

  const handleKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSetUser();
    }
  };

  return (
    <Container maxW="container.xl" h={"100vh"} p={4}>
      <AbsoluteCenter>
        <Box>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError("");
            }}
            onKeyDown={handleKeydown}
            placeholder="Enter your name"
            type="text"
            w={"100%"}
            mb={4}
            borderRadius={"md"}
            border={"1px solid #ccc"}
            _focus={{
              borderColor: "brand.500",
            }}
            _placeholder={{
              color: "gray.500",
            }}
          />
          {nameError && (
            <Text mx={3} color="red.500">
              {nameError}
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
          <Button w={"100%"} onClick={() => handleSetUser()}>
            Join
          </Button>
        </Box>
      </AbsoluteCenter>
    </Container>
  );
}
