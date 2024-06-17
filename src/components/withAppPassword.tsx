import { useEffect } from "react";
import { useRouter } from "next/navigation";

const withAppPassword = (WrappedComponent: React.ComponentType) => {
  return (props: any) => {
    const router = useRouter();

    useEffect(() => {
      const appPassword = process.env.NEXT_PUBLIC_APP_PASSWORD;
      const inputPassword = prompt("Enter app password:");
      if (inputPassword !== appPassword) {
        router.push("/");
      }
    }, [router]);

    return <WrappedComponent {...props} />;
  };
};
withAppPassword.displayName = "withAppPassword";
export default withAppPassword;
