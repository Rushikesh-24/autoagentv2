import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface MonetizationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCreateAgent: (agentData: {
    monetizationModel: string;
    price: number | null;
    isMarketplaceListed: boolean;
  }) => void;
}

export function MonetizationDialog({
  isOpen,
  onOpenChange,
  onCreateAgent,
}: MonetizationDialogProps) {
  const [monetizationModel, setMonetizationModel] = useState("free");
  const [price, setPrice] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { push } = useRouter()
  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  if (!isSignedIn) {
    // You could also add a redirect to the sign-in page here
    return <div>Sign in to view this page</div>;
  }

  const handleCreateAgent = () => {
    // Prepare agent data
    const agentMonetizationData = {
      monetizationModel,
      price: monetizationModel !== "free" ? price : null,
      isMarketplaceListed: false, // This would come from the switch state
      name: name || "Default Agent",
      userId: userId,
      description: description || "Agent for testing",
    };

    // Call the create agent function
    onCreateAgent(agentMonetizationData);

    // Close the dialog
    push("/dashboard/agents")
    onOpenChange(false);
    
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Agent Monetization</DialogTitle>
          <DialogDescription>
            Define how you want to monetize your AI agent
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Agent Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter agent name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Agent Description</Label>
                <Input
                  id="description"
                  type="text"
                  placeholder="Enter agent name"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monetization-model">Monetization Model</Label>
                <Select
                  value={monetizationModel}
                  onValueChange={setMonetizationModel}
                >
                  <SelectTrigger id="monetization-model">
                    <SelectValue placeholder="Select monetization model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="pay-per-use">Pay-per-use</SelectItem>
                    <SelectItem value="one-time">One-time purchase</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {monetizationModel !== "free" && (
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="price"
                      type="number"
                      placeholder="19.99"
                      className="rounded-l-none"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {monetizationModel === "subscription" && "Price per month"}
                    {monetizationModel === "pay-per-use" &&
                      "Price per API call"}
                    {monetizationModel === "one-time" &&
                      "One-time purchase price"}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="marketplace-listing">
                    List on Marketplace
                  </Label>
                  <Switch id="marketplace-listing" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Make your agent available for others to discover and purchase
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAgent}>Create Agent</Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
