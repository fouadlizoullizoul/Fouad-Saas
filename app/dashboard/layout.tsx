import { ReactNode } from "react";
import DashboardNav from "../components/DashboardNav";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "../lib/db";
import { stripe } from "@/lib/stripe";
import {unstable_noStore as noStore} from 'next/cache'
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";
import { redirect } from "next/navigation";
noStore()
async function getData({
  email,
  id,
  firstName,
  lastName,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  stripeCustomerId,
}: {
  email: string;
  id: string;
  firstName: string ;
  lastName: string ;
  profileImage:string;
  stripeCustomerId: string;
}) {
  try {
     const user=await prisma.user.findUnique({
        where:{
            id:id
        },
        select:{
            id:true,
            stripeCustomerId:true,
        }
    })
    if(!user){
      const name=`${firstName ?? ''} ${lastName ?? ''}`
      await prisma.user.create({
          data:{
              id:id,
              email:email,
              name:name,
          }
      })
  }
  if(!user?.stripeCustomerId){
      const data=await stripe.customers.create({
        email:email,
      });
      await prisma.user.update({
        where:{
          id:id,
        },
        data:{
          stripeCustomerId:data.id
        }
      })
  }
  } catch (error) {
    console.error("Error in getData:", error);
  }
   
  
}

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { getUser } = getKindeServerSession();
  const user = await getUser() as KindeUser<Record<string,unknown>> &{
    stripeCustomerId?:string;
  };
  if (!user) {
    return redirect("/");
  }
  await getData({
    email:user.email as string,
    firstName:user.given_name as string,
    id:user.id as string,
    lastName:user.family_name as string,
    profileImage:user.picture as string,
    stripeCustomerId: user.stripeCustomerId as string,
})
  return (
    <div className="flex flex-col space-y-6 mt-10 items-center">
      <div className=" grid flex-1 gap-12 md:grid-cols-[200px_1fr] container">
        <aside className="hidden w-[200px] flex-col md:flex">
          <DashboardNav />
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
