import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (<div className='flex justify-center items-center w-screen h-screen bg-white'>
    <SignIn />
    </div>)
}