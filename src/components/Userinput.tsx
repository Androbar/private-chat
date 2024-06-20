import {
  AbsoluteCenter,
  Box,
  Button,
  Container,
  Input,
} from "@chakra-ui/react";
import { useState } from "react";
import Cookies from "js-cookie";
import { User } from "@/types";

export function UserInput({
  userName = "",
  socketId,
  setUser,
}: {
  userName: string | undefined;
  socketId: string | undefined;
  setUser: (user: User) => void;
}) {
  const [name, setName] = useState<string>(userName);

  const handleSetUser = () => {
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
            onChange={(e) => setName(e.target.value)}
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
          <Button w={"100%"} onClick={() => handleSetUser()}>
            Join
          </Button>
        </Box>
      </AbsoluteCenter>
    </Container>
  );
}
