//@ts-nocheck
"use client";
import type React from "react";

import { useState, useCallback, useRef, createContext, use, useEffect } from "react";
import {
  MiniMap,
  Background,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  ReactFlow,
  reconnectEdge,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";

import {
  Bot,
  Save,
  Play,
  MessageSquare,
  GitBranch,
  FileJson,
  Upload,
  Cable,
  Text,
  BrainIcon,
  ScissorsIcon,
  TextIcon,
  BrainCog,
  XIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import AIAgentNode from "@/components/nodes/AIAgent";
import TextMergeNode from "@/components/nodes/TextMerge";
import EndNode from "@/components/nodes/End";
import StartNode from "@/components/nodes/Start";
import { MonetizationDialog } from "@/components/MonetizationDialog";
import APINode from "@/components/nodes/API";
import DescriptionNode from "@/components/nodes/Description";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import CustomModelNode from "./nodes/CustomModel";


const DataPassing = createContext<{
    nodes: any[];
    edges: any[];
    setNodes: React.Dispatch<React.SetStateAction<any[]>>;
    setEdges: React.Dispatch<React.SetStateAction<any[]>>;
    fileUploadIndicator: number;
} | null>(null);

const nodeDefinitions = [
  {
    type: "Start",
    icon: <GitBranch className="h-4 w-4" />,
    label: "Start Node",
    group: "Processing",
  },
  {
    type: "End",
    icon: <GitBranch className="h-4 w-4" />,
    label: "End Node",
    group: "Processing",
  },
  {
    type: "AIAgent",
    icon: <Bot className="h-4 w-4" />,
    label: "AI Agent Node",
    group: "Models",
  },
  {
    type: "TextMerge",
    icon: <MessageSquare className="h-4 w-4" />,
    label: "Text Merge Node",
    group: "Text",
  },
  {
    type: "API",
    icon: <Cable className="h-4 w-4" />,
    label: "API Node",
    group: "Text",
  },
  {
    type: "Description",
    icon: <Text className="h-4 w-4" />,
    label: "Description Node",
    group: "Text",
  },
  {
    type: "CustomModel",
    icon: <BrainCog className="h-4 w-4" />,
    label: "Custom Model Node",
    group: "Models",
  },
];

const nodeTypes = {
  AIAgent: AIAgentNode,
  TextMerge: TextMergeNode,
  End: EndNode,
  Start: StartNode,
  API: APINode,
  Description: DescriptionNode,
  CustomModel: CustomModelNode
};

export default function AgentBuilder(props?: { initialData?: { nodes: any[]; edges: any[] } }) {
    const [nodes, setNodes] = useState(props?.initialData?.nodes || []);
    const [edges, setEdges] = useState(props?.initialData?.edges || []);
    const [output, setOutput] = useState("")
    const [fileUploadIndicator, setFileUploadIndicator] = useState<number>(1);
    const fileInputRef = useRef<HTMLInputElement>(null);
    let globalGraph = {}; // Changed to normal variable
    let executionResults = { "0": [], "1": [], "2": [], "3": [], "4": [] };
    const edgeReconnectSuccessful = useRef(false);
 

    useEffect(() => {
        setNodes(props?.initialData?.nodes || []);
        setEdges(props?.initialData?.edges || []);
    },[props?.initialData]);
    
    const buildGraph = useCallback(() => {
        const graph: {
            [key: string]: {
                incoming: string[];
                outgoing: string[];
            };
        } = {};

        nodes.forEach((node) => {
            graph[node.id] = { incoming: [], outgoing: [] };
        });

        edges.forEach((edge) => {
            graph[edge.source].outgoing.push(edge.target);
            graph[edge.target].incoming.push(edge.source);
        });
        globalGraph = graph; // Update the normal variable directly
        return graph;
    }, [nodes, edges]);

    // Find all nodes reachable from the start node using DFS
    const getReachableNodes = useCallback(
        (startNodeId: string) => {
            const graph = buildGraph();
            const visited = new Set<string>();
            const stack = [startNodeId];

            while (stack.length > 0) {
                const nodeId = stack.pop()!;
                if (!visited.has(nodeId)) {
                    visited.add(nodeId);
                    graph[nodeId].outgoing.forEach((targetId) => {
                        if (!visited.has(targetId)) {
                            stack.push(targetId);
                        }
                    });
                }
            }

            return visited;
        },
        [buildGraph]
    );

    // Topological sort to determine execution order, only including reachable nodes
    const determineExecutionOrder = useCallback(() => {
        const graph = buildGraph();
        const startNode = nodes.find((node) => node.data.isStart);
        const endNode = nodes.find((node) => node.data.isEnd);

        if (!startNode || !endNode) return [];

        const reachableNodes = getReachableNodes(startNode.id);
        const inDegree: { [key: string]: number } = {};
        const queue: string[] = [];
        const executionOrder: string[] = [];

        Object.keys(graph).forEach((nodeId) => {
            if (reachableNodes.has(nodeId)) {
                inDegree[nodeId] = graph[nodeId].incoming.filter((id) =>
                    reachableNodes.has(id)
                ).length;
                if (inDegree[nodeId] === 0) {
                    queue.push(nodeId);
                }
            }
        });

        while (queue.length > 0) {
            const currentNode = queue.shift()!;
            if (reachableNodes.has(currentNode)) {
                executionOrder.push(currentNode);
                graph[currentNode].outgoing.forEach((nextNodeId) => {
                    if (reachableNodes.has(nextNodeId)) {
                        inDegree[nextNodeId]--;
                        if (inDegree[nextNodeId] === 0) {
                            queue.push(nextNodeId);
                        }
                    }
                });
            }
        }

        return executionOrder.filter((nodeId) => reachableNodes.has(nodeId));
    }, [nodes, edges, buildGraph, getReachableNodes]);

    // Recursive function to execute nodes based on execution order
    const executeNodeRecursively = async (
        executionOrder: string[],
        index: number = 0
    ) => {
        // Base case: if index reaches the end of executionOrder, stop
        if (index >= executionOrder.length) return;

        const nodeId = executionOrder[index];
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) {
            // Skip to next node if current node not found
            await executeNodeRecursively(executionOrder, index + 1);
            return;
        }

        try {
            // Get results from incoming nodes
            const incomingResults =
                globalGraph[nodeId]?.incoming
                    .map((id) => executionResults[id])
                    .filter((result) => result !== undefined) || [];

            //console.log(`Executing node ${nodeId} with inputs:`, incomingResults);

            // Execute the node with incoming results
            const result = await node.data.execute(incomingResults, node.data);

            // Update executionResults
            executionResults[nodeId] = result;

            //console.log(`Node ${nodeId} execution result:`, result);

            // Recursively execute the next node in order
            await executeNodeRecursively(executionOrder, index + 1);
        } catch (error) {
            console.error(`Error executing node ${nodeId}:`, error);
        }
    };

    const start = async () => {
        // Reset executionResults and globalGraph
        executionResults = { "0": [], "1": [], "2": [], "3": [], "4": [] };

        // Build the graph and get execution order
        globalGraph = buildGraph();
        const executionOrder = determineExecutionOrder();
        console.log("Execution Order:", executionOrder);

        if (executionOrder.length === 0) {
            console.error("No valid execution order found");
            return;
        }

        // Start recursive execution from the first node in the order
        await executeNodeRecursively(executionOrder, 0);
    };

    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData("application/reactflow", nodeType);
        event.dataTransfer.effectAllowed = "move";
    };

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const onDrop = useCallback((event) => {
        event.preventDefault();

        const type = event.dataTransfer.getData("application/reactflow");

        if (typeof type === "undefined" || !type) {
            return;
        }

        const position = {
            x: event.screenX,
            y: event.screenY,
        };

        const newNode = {
            id: `${Date.now()}`,
            type,
            position,
            data: {
                value: 123,
                isExecuting: false,
                execute: () => {},
                ...(type === "Start" && { isStart: true }),
                ...(type === "End" && { isEnd: true }),
            },
        };

        setNodes((nds) => nds.concat(newNode));
    }, []);

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
    );

    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges]
    );

    const onConnect = useCallback(
        (connection) => setEdges((eds) => addEdge(connection, eds)),
        [setEdges]
    );

    const exportFlow = () => {
        const flow = { nodes, edges };
        const dataStr = JSON.stringify(flow, null, 2);
        const dataUri =
            "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
        const exportFileDefaultName = "agent-flow.json";
        const linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", exportFileDefaultName);
        linkElement.click();
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target?.result as string);

                if (jsonData.nodes && jsonData.edges) {
                    setNodes(jsonData.nodes);
                    setEdges(jsonData.edges);
                    setFileUploadIndicator((prev) => prev + 1);
                } else {
                    console.error("Invalid JSON structure. Expected { nodes, edges }");
                    alert("Invalid file format. Please upload a valid agent flow JSON.");
                }
            } catch (error) {
                console.error("Error parsing JSON:", error);
                alert("Error uploading file. Please ensure it is a valid JSON.");
            }
        };
        reader.readAsText(file);
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    const renderNodeGroup = (group) => {
        return nodeDefinitions
            .filter((node) => node.group === group)
            .map((node) => (
                <div
                    key={node.type}
                    className="flex items-center p-2 border shadow rounded-md mb-2 cursor-move hover:bg-muted/50"
                    draggable
                    onDragStart={(event) => onDragStart(event, node.type)}
                >
                    {node.icon}
                    <span className="ml-2 text-sm">{node.label}</span>
                </div>
            ));
    };

    const onReconnectStart = useCallback(() => {
        edgeReconnectSuccessful.current = false;
    }, []);

    const onReconnect = useCallback(
        (oldEdge, newConnection) => {
            edgeReconnectSuccessful.current = true;
            setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
        },
        [setEdges]
    );

    const onReconnectEnd = useCallback(
        (_, edge) => {
            if (!edgeReconnectSuccessful.current) {
                setEdges((eds) => eds.filter((e) => e.id !== edge.id));
            }
            edgeReconnectSuccessful.current = true;
        },
        [setEdges]
    );

    const [isMonetizationDialogOpen, setIsMonetizationDialogOpen] =
        useState(false);
    const createAgent = useMutation(api.tasks.createUser);

    const rushi = (monetizationdata) => {
        console.log(monetizationdata, nodes, edges);
        createAgent({
            owner: monetizationdata.userId,
            name: monetizationdata.name,
            description:
                monetizationdata.description || "Automatically generated agent",
            nodes: nodes.map((node) => {
                delete node.dragging;
                delete node.selected;
                const { execute, ...rest } = node.data;
                return {
                    ...node,
                    data: {
                        ...rest,
                        value: String(rest.value),
                    },
                };
            }),
            edges: edges,
            monetizationData: {
                monetizationModel: monetizationdata.monetizationModel,
                isMarketplaceListed: monetizationdata.isMarketplaceListed,
            },
            isActive: true,
        });
    };

    return (
        <DataPassing.Provider
            value={{ nodes, edges, setNodes, setEdges, fileUploadIndicator, setOutput }}
        >
            <div className="flex min-h-screen flex-col">
                <div className="absolute z-10 top-10 right-10 flex items-center gap-4">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".json"
                        onChange={handleFileUpload}
                    />
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={triggerFileUpload}
                    >
                        <Upload className="h-4 w-4" />
                        Upload
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={exportFlow}>
                        <FileJson className="h-4 w-4" />
                        Save Json
                    </Button>
                    <Button className="gap-2" onClick={start}>
                        <Play className="h-4 w-4" />
                        Test
                    </Button>
                    <Button
                        className="gap-2"
                        onClick={() => setIsMonetizationDialogOpen(true)}
                    >
                        <Save className="h-4 w-4" />
                        Save Agent
                    </Button>
                </div>
                <MonetizationDialog
                    isOpen={isMonetizationDialogOpen}
                    onOpenChange={setIsMonetizationDialogOpen}
                    onCreateAgent={rushi}
                />
                <main className="flex-1">
                    <Tabs value={"visual"}>
                        <TabsContent value="visual" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6"></div>
                                <div className="w-1/4 z-20 left-5 top-5 fixed">
                                    <Card className="h-[calc(100vh-5rem)]">
                                        <CardHeader className="pb-3">
                                            <CardTitle>Components</CardTitle>
                                            <CardDescription>
                                                Drag and drop nodes to the canvas
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ScrollArea className="h-[calc(100vh-16rem)]">
                                                <Accordion type="single" collapsible defaultValue="AI">
                                                    <AccordionItem value="Processing">
                                                        <AccordionTrigger className="text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <ScissorsIcon />
                                                                Processing
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent>
                                                            {renderNodeGroup("Processing")}
                                                        </AccordionContent>
                                                    </AccordionItem>

                                                    <AccordionItem value="Models">
                                                        <AccordionTrigger className="text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <BrainIcon />
                                                                Models
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent>
                                                            {renderNodeGroup("Models")}
                                                        </AccordionContent>
                                                    </AccordionItem>

                                                    <AccordionItem value="Text">
                                                        <AccordionTrigger className="text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <TextIcon />
                                                                Text
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent>
                                                            {renderNodeGroup("Text")}
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                </Accordion>
                                            </ScrollArea>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="col-span-4">
                                    <div className="h-screen w-full">
                                        <ReactFlow
                                            nodes={nodes}
                                            edges={edges}
                                            onNodesChange={onNodesChange}
                                            onEdgesChange={onEdgesChange}
                                            onConnect={onConnect}
                                            nodeTypes={nodeTypes}
                                            onDrop={onDrop}
                                            onDragOver={onDragOver}
                                            onReconnectStart={onReconnectStart}
                                            onReconnect={onReconnect}
                                            onReconnectEnd={onReconnectEnd}
                                            fitView
                                        >
                                            <MiniMap />
                                            <Background gap={12} size={1} />
                                        </ReactFlow>
                                    </div>
                                    {
                                        output &&
                                        <div className="absolute bg-white border w-1/3 top-24 right-20 rounded-xl p-10 z-20">
                                            <div className=" text-xl font-semibold mb-2 flex items-center justify-between">
                                                <p>Output</p>
                                                <button className="cursor-pointer" onClick={()=>setOutput("")}><XIcon /></button>
                                            </div>
                                            <p>{output}</p>
                                        </div>
                                    }
                                </div>
                            </TabsContent>
                    </Tabs>
                </main>
            </div>
        </DataPassing.Provider>
    );
}

export { DataPassing };
