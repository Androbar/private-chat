import {
  AbsoluteCenter,
  Box,
  Button,
  Container,
  Input,
} from "@chakra-ui/react";
import { useState } from "react";
import Cookies from "js-cookie";

export function UserInput({
  userName = "",
  setUser,
}: {
  userName: string | undefined;
  setUser: (user: string) => void;
}) {
  const [name, setName] = useState<string>(userName);

  const handleSetUser = () => {
    const cleanedName = name.trim();
    if (cleanedName !== "") {
      // set cookie
      Cookies.set("userName", cleanedName);
      setUser(cleanedName);
    }
  };
  return (
    <Container maxW="container.xl" h={"100vh"} p={4}>
      <AbsoluteCenter>
        <Box>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
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
