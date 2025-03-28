"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, MoreHorizontal, BotMessageSquareIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { useEffect, useState } from "react"
import { ChatModal } from "@/components/chat-modal"

export default function AgentsPage() {
  const { isLoaded, isSignedIn, userId } = useAuth()

  // const agents = useMutation(api.tasks.getUserAgent,{owner:userId})
  const userAgent = useMutation(api.tasks.getUserAgent)
  const agent = userAgent({
    owner: userId || "user_2usykddvvkCNH1ykUs2DrFcqPOG",
  })
  const [agents, setagents] = useState<Agent[]>([])
  useEffect(() => {
    agent.then((resolvedAgent) => {
      setagents(resolvedAgent)
    })
  }, [])
  if (!isLoaded || !agent) {
    return <div>Loading...</div>
  }
  interface Agent {
    _id: string
    _creationTime: number
    owner: string
    description: string
    name: string
    nodes: {
      type: string
      id: string
      position: { x: number; y: number }
      measured: { width: number; height: number }
      data: Record<string, unknown>
    }[]
    edges: Record<string, unknown>[]
    monetizationData: {
      monetizationModel: string
      isMarketplaceListed: boolean
    }
    isActive: boolean
  }

  const [isChatOpen, setIsChatOpen] = useState(false)

  if (!isSignedIn) {
    // You could also add a redirect to the sign-in page here
    return <div>Sign in to view this page</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link
            href={"/"}
            className="flex items-center gap-2 font-bold text-xl"
          >
            <Bot className="h-6 w-6 text-primary" />
            <span>AutoAgent</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/agents"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              My Agents
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <UserButton />
          </div>
        </div>
      </header> */}
      <main className="flex-1 py-8 px-6">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My AI Agents</h1>
              <p className="text-muted-foreground">Manage and monitor your AI agents</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/builder">
                <Button className="mt-4 md:mt-0 gap-2">
                  <Plus className="h-4 w-4" /> Create New Agent
                </Button>
              </Link>
              <Button
                variant={"outline"}
                className="mt-4 md:mt-0 gap-2 border-2 hover:shadow hover:shadow-purple-800 border-purple-800"
                onClick={() => setIsChatOpen(true)}
              >
                <BotMessageSquareIcon className="h-4 w-4" /> Ask Auto
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agents?.map((agent) => (
              <Card key={agent._id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {agent.name}
                        {agent.isActive === true && (
                          <Badge variant="default" className="ml-2">
                            Active
                          </Badge>
                        )}
                        {agent.isActive === false && (
                          <Badge variant="outline" className="ml-2">
                            Draft
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{agent.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem>Analytics</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Model</div>
                      <div className="font-medium">{agent.monetizationData.monetizationModel}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Created</div>
                      <div className="font-medium">{agent._creationTime}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Pricing</div>
                      <div className="font-medium">{agent.monetizationData.isMarketplaceListed?'50$':'free'}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Type</div>
                      <div className="font-medium capitalize">{!agent.monetizationData.isMarketplaceListed?"User model":"Paid model"}</div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <div className="flex justify-between w-full">
                    <Link href={"/builder2/" + agent._id}>
                      <Button variant="outline" size="sm">
                        Preview
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      onClick={() => {
                      navigator.clipboard.writeText(`http://localhost:3000/api/agents/${agent._id}`).then(() => {
                        alert("Agent data copied to clipboard!");
                      });
                      }}
                    >
                      Get Endpoint
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <ChatModal open={isChatOpen} onOpenChange={setIsChatOpen} />
    </div>
  )
}

