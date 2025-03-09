
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";

interface StepHeaderProps {
  title: string;
  description: string;
  progress: number;
}

export function StepHeader({ title, description, progress }: StepHeaderProps) {
  return (
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="w-full bg-gray-200 h-2 rounded-full mt-4">
        <div 
          className="bg-primary h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </CardHeader>
  );
}
