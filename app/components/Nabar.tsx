import Link from "next/link";
import React from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  RegisterLink,
  LoginLink,
  LogoutLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import UserNav from "./UserNav";
const Nabar = async () => {
  const { getUser,isAuthenticated } = getKindeServerSession();
  const user=await getUser()
  return (
    <nav className="border-b bg-background h-[10vh] justify-center flex items-center ">
      <div className="flex items-center justify-between container">
        <Link href="/">
          <h1 className="font-bold text-2xl">
            Fouad <span className="text-primary">Saas</span>
          </h1>
        </Link>
        <div className="flex items-center gap-x-5">
          <ThemeToggle />
          <div className="flex items-center gap-x-5">
            {(await isAuthenticated()) ? (
              <>
                <UserNav name={user?.given_name as string} email={user?.email as string} image={user?.picture as string}/>
                <LogoutLink>
                  <Button>
                  Logout
                  </Button>
                </LogoutLink>
              </>
            ) : (
              <>
                <LoginLink>
                  <Button>Sign In</Button>
                </LoginLink>
                <RegisterLink>
                  <Button variant="secondary">Sign Up</Button>
                </RegisterLink>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Nabar;
