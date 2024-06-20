"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AbsoluteCenter,
  Box,
  Button,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from "react-google-recaptcha-v3";

const LoginForm = () => {
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<null | string>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!executeRecaptcha) {
      setPasswordError("Execute recaptcha not yet available");
      setIsLoading(false);
      return;
    }

    const token = await executeRecaptcha("login");

    if (!password) {
      setPasswordError("Password is required");
      setIsLoading(false);
      return;
    }

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, token }),
    });

    const verified = await response.json();
    if (verified.status === 200) {
      setIsLoading(false);
      router.push("/");
    } else {
      setPasswordError(verified.body.error);
      setIsLoading(false);
    }
  };

  return (
    <Box w={"100%"} h={"100vh"}>
      <AbsoluteCenter>
        <form onSubmit={handleLogin}>
          <VStack gap={4} w={"lg"}>
            <Text alignSelf={"flex-start"} fontSize={"lg"}>
              Please enter the app password
            </Text>
            <Input
              type="password"
              value={password}
              disabled={isLoading}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(null);
              }}
              placeholder="Enter password"
            />
            {passwordError && (
              <Text alignSelf={"flex-start"} fontSize={"sm"} color={"red.600"}>
                {passwordError}
              </Text>
            )}
            <Button
              type="submit"
              w={"100%"}
              colorScheme="blue"
              disabled={isLoading}
              isLoading={isLoading}
            >
              Login
            </Button>
          </VStack>
        </form>
      </AbsoluteCenter>
    </Box>
  );
};

const LoginPage = () => {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
    >
      <LoginForm />
    </GoogleReCaptchaProvider>
  );
};

export default LoginPage;
