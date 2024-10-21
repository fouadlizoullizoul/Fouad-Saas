import { SubmitButton } from '@/app/components/Submitbuttons'
import prisma from '@/app/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { revalidatePath ,unstable_noStore as noStore} from 'next/cache'
import React from 'react'
async function getData(userId:string){
    noStore()
    const data=await prisma.user.findUnique({
        where:{
            id:userId,
        },
        select:{
            name:true,
            email:true,
            colorSchema:true
        }
    })
    return data
}
const page = async () => {
    const {getUser}=getKindeServerSession()
    const user=await getUser()
    const data=await getData(user?.id as string)

    async function postData(formData:FormData){
        "use server"
        const name =formData.get("name") as string;
        const colorScheme =formData.get("color") as string;
        await prisma.user.update({
            where:{
                id:user.id
            },
            data:{
                name:name ?? undefined,
                colorSchema:colorScheme ?? undefined,
            }
        })
        revalidatePath("/","layout")
    }
  return (
    <div className='grid items-start gap-8'>
        <div className='flex items-center justify-between px-2'>
            <div className="grid gap-1">
                <h1 className="text-3xl md:text-4xl">Settings</h1>
                <p className="text-lg text-muted-foreground">Your Profile settings</p>
            </div>
        </div>
        <Card>
            <form action={postData}>
                <CardHeader>
                    <CardTitle>General Data</CardTitle>
                    <CardDescription>
                        Please provide general information about yourself.Please dont
                        forget to save
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='space-y-2'>
                        <div className='space-y-1'>
                            <Label>Your Name</Label>
                            <Input name='name' defaultValue={data?.name} type="text" id="text" placeholder='Your Name'/>
                        </div>
                        <div className='space-y-1'>
                            <Label>Your Email</Label>
                            <Input name='email' disabled defaultValue={data?.email} type="email" id="email" placeholder='Your Email'/>
                        </div>
                        <div className='space-y-1'>
                            <Label>Color Scheme</Label>
                            <Select name="color" defaultValue={data?.colorSchema}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a color"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Color</SelectLabel>
                                        <SelectItem value="theme-green">Green</SelectItem>
                                        <SelectItem value="theme-blue">Blue</SelectItem>
                                        <SelectItem value="theme-violet">Violet</SelectItem>
                                        <SelectItem value="theme-yellow">Yellow</SelectItem>
                                        <SelectItem value="theme-orange">Orange</SelectItem>
                                        <SelectItem value="theme-red">Red</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type='submit'>
                       <SubmitButton/>
                    </Button>
                </CardFooter>
            </form>
        </Card>
    </div>
  )
}

export default page
