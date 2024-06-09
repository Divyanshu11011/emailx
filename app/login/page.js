'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { EnvelopeOpenIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const { data: session } = useSession();
  const { register, handleSubmit } = useForm();
  const router = useRouter();
  const [openAiKey, setOpenAiKey] = useState('');

  const onSubmit = (data) => {
    const userEmail = session?.user?.email;
    if (userEmail) {
      localStorage.setItem(`openAiKey-${userEmail}`, data.openAiKey);
    }
    setOpenAiKey(data.openAiKey);
    router.push('/dashboard');  // Redirect to the dashboard after submitting the OpenAI key
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
       <CardHeader>
  <CardTitle className="text-2xl">
    {session ? 'API Key' : 'Get Started'}
  </CardTitle>
  <CardDescription>
    {session
      ? `Hey ${session.user.name}, please enter your OpenAI key below.`
      : 'Welcome to EmailX ! Please SignIn With Your Google Account'}
  </CardDescription>
</CardHeader>

        <CardContent className="grid gap-4">
          {session ? (
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="openAiKey">OpenAI Key</Label>
                <Input
                  id="openAiKey"
                  name="openAiKey"
                  type="text"
                  {...register('openAiKey', { required: true })}
                />
              </div>
              <Button type="submit" className="w-full">
                Submit
              </Button>
              <Button variant="outline" className="w-full" onClick={() => signOut()}>
                Sign out
              </Button>
            </form>
          ) : (
            <Button onClick={() => signIn('google')} className="w-full">
              <EnvelopeOpenIcon className="mr-2 h-4 w-4" /> Login with Google
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
