import { Box, keyframes } from "@chakra-ui/react";

// Define the keyframes for the dot animation
const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-8px); }
`;

// Create an animation for the dots
const dotAnimation = `${bounce} 1.4s infinite ease-in-out both`;

export const TypingIndicator: React.FC = () => {
  return (
    <Box display="flex" alignItems="center">
      <Box
        width="8px"
        height="8px"
        bg="green.300"
        borderRadius="50%"
        sx={{ animation: dotAnimation, animationDelay: "0s" }}
      ></Box>
      <Box
        width="8px"
        height="8px"
        bg="green.300"
        borderRadius="50%"
        mx="2px"
        sx={{ animation: dotAnimation, animationDelay: "0.2s" }}
      ></Box>
      <Box
        width="8px"
        height="8px"
        bg="green.300"
        borderRadius="50%"
        sx={{ animation: dotAnimation, animationDelay: "0.4s" }}
      ></Box>
    </Box>
  );
};
