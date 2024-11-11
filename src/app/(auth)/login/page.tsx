"use client";

import Button from "@/components/ui/Button";
import { signIn } from "next-auth/react";
import { FC, useState } from "react";
import toast from "react-hot-toast";

const Page: FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function loginWithGoogle() {
    setIsLoading(true);
    try {
      await signIn("google");
    } catch (error) {
      toast.error("Something went wrong with your login.");
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <>
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full flex flex-col items-center max-w-md space-y-8">
          <div className="flex flex-col items-center gap-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 110.62 173.65"
              fill="#4f46e5"
              className="border-indigo-600 border-4 rounded-b-full p-2"
            >
              <path d="M55.07,67.91v47.02h24.55l6.7,8.06v-10.52l24.3-27.54v42.76c-12.77,6.75-20.4,18.33-22.76,31.4-.28,1.57-.25,6.76-1.05,7.56-19.33,9.26-43.06,9.36-62.42.15C24.27,151.04,16.02,134.68,0,127.47v-42.54l24.8,27.99v10.08l6.2-8.06h13.14v-36.72H15.87v-10.3h39.2ZM45.65,146.72v-11.19h19.84v11.19l14.4-5.67c-.48-2.92.65-7.43-.14-10.12-.53-1.79-4.24-4.87-4.94-6.95l-38.87.32c-.42.28-4.93,6.52-5.07,7.07-.28,1.15-.34,8.23,0,9.22.17.51.49.68.92.96,1.41.9,10.43,4.42,12.35,4.97.51.15.96.29,1.51.21h0Z" />
              <path d="M110.62,69.25c-4.93-5.35-10.32-10.22-16.36-14.55,13.09-10.42,6.55-29.86-10.7-31.84-14.27,15.95-41.31,15.97-56.01.44-12.78,2.61-19.21,15.86-12.92,26.26.73,1.2,3.41,3.84,3.27,4.66l-9.23,6.52L0,69.71V19.33c30.81-25.83,79.39-25.56,110.61-.45v50.38h.01Z" />
              <polygon points="94.75 78.21 66.48 78.21 66.48 67.91 94.01 67.91 94.75 68.58 94.75 78.21" />
            </svg>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-indigo-600">
              Sign in to your account
            </h2>
          </div>

          <Button
            isLoading={isLoading}
            type="button"
            className="max-w-sm mx-auto w-full bg-indigo-600"
            onClick={loginWithGoogle}
          >
            {isLoading ? null : (
              <svg
                className="mr-2 h-4 w-4"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="github"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
            )}
            Google
          </Button>
        </div>
      </div>
    </>
  );
};

export default Page;
