
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function ArticleSkeleton() {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4">
          <Link to="/articles">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Link>
        </Button>
      </div>
      
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-pulse text-center w-full">
          <div className="h-8 w-2/3 bg-muted rounded mb-4 mx-auto"></div>
          <div className="h-4 w-1/2 bg-muted rounded mx-auto mb-8"></div>
          <div className="space-y-2 w-full">
            <div className="h-4 w-full bg-muted rounded"></div>
            <div className="h-4 w-full bg-muted rounded"></div>
            <div className="h-4 w-3/4 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
