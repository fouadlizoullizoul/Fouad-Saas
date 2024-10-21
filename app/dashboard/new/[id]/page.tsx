import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/app/components/Submitbuttons'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import prisma from '@/app/lib/db'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {unstable_noStore as noStore} from 'next/cache'
async function getData({userId,noteId}:{userId:string;noteId:string}){
    noStore()
    const data=await prisma.note.findUnique({
        where:{
            id:noteId,
            userId:userId,
        },
        select:{
            title:true,
            descriptions:true,
            id:true
        }
    });
    return data
}
const page = async ({params}:{params:{id:string}}) => {
    const {getUser}=getKindeServerSession();
    const user = await getUser()
    const data=await getData({userId:user.id as string , noteId:params.id});
    async function postData(formData:FormData){
        "use server"
        if(!user) throw new Error("you are not allowed")
            const title=formData.get("title") as string;
            const description=formData.get("description") as string;
            await prisma.note.update({
                where:{
                    id:data?.id,
                    userId:user.id,
                },
                data:{
                    descriptions:description,
                    title:title
                }
            })
            revalidatePath("/dashboard")
            return redirect("/dashboard")
    }
  return (
    <Card>
    <form action={postData}>
     <CardHeader>
         <CardTitle>Edit Note</CardTitle>
         <CardDescription>
             Right here you can now edit your notes
         </CardDescription>
     </CardHeader>
     <CardContent className='flex flex-col gap-y-5'>
         <div className='gap-y-2 flex flex-col'>
             <Label>Title</Label>
             <Input
                 required
                 type='text'
                 name='title'
                 placeholder='Title for your note'
                 defaultValue={data?.title}
             />
         </div>
         <div>
             <Label>Description</Label>
             <Textarea name="description" placeholder='Describe your note as you want' defaultValue={data?.descriptions} required/>
         </div>
     </CardContent>
     <CardFooter className='flex justify-between'>
         <Button asChild variant="destructive">
             <Link href="/dashboard">Cancel</Link>
         </Button>
         <SubmitButton/>
     </CardFooter>
    </form>
 </Card>
  )
}

export default page
