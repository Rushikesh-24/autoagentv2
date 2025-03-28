"use client"

import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";

interface ModelConfigFormProps {
  config: any;
  onConfigChange: (config: any) => void;
  onDatasetUpload: (file: File) => void;
  disabled?: boolean;
}

export default function ModelConfigForm({
  config,
  onConfigChange,
  onDatasetUpload,
  disabled = false,
}: ModelConfigFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm({
    defaultValues: {
      modelType: config.modelType || "",
      modelName: config.modelName || "",
    },
    mode: "onChange",
  });

  const handleFormSubmit = (data: any) => {
    const finalConfig = {
      ...data,
      datasetFile: selectedFile,
    };
    onConfigChange(finalConfig);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onDatasetUpload(file);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Model Type Select */}
        <FormField
          control={form.control}
          name="modelType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value} 
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="regression">Regression</SelectItem>
                  <SelectItem value="classification">Classification</SelectItem>
                  <SelectItem value="clustering">Clustering</SelectItem>
                  <SelectItem value="neuralNetwork">Neural Network</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Select the type of model you want to train</FormDescription>
            </FormItem>
          )}
        />

        {/* Model Name Input */}
        <FormField
          control={form.control}
          name="modelName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter model name" 
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
              <FormDescription>Provide a name for your model</FormDescription>
            </FormItem>
          )}
        />

        {/* File Upload Section */}
        <FormItem>
          <FormLabel>Upload Dataset</FormLabel>
          <FormControl>
            <div className="flex items-center gap-4">
              <Input 
                type="file" 
                accept=".csv,.json" 
                onChange={handleFileChange} 
                disabled={disabled} 
              />
              {selectedFile && (
                <span className="text-sm text-muted-foreground">
                  {selectedFile.name}
                </span>
              )}
            </div>
          </FormControl>
          <FormDescription>Upload your dataset in CSV or JSON format.</FormDescription>
        </FormItem>

        <Button 
          type="submit" 
          disabled={disabled} 
          className="w-full"
        >
          Save Configuration
        </Button>
      </form>
    </Form>
  );
}