import {
  AbsoluteCenter,
  Box,
  Button,
  Container,
  Input,
} from "@chakra-ui/react";
import { useState } from "react";

export function UserInput({ setUser }: { setUser: (user: string) => void }) {
  const [name, setName] = useState<string>("");
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
          <Button
            w={"100%"}
            onClick={() => {
              if (name.trim() !== "") {
                setUser(name.trim());
              }
            }}
          >
            Join
          </Button>
        </Box>
      </AbsoluteCenter>
    </Container>
  );
}
