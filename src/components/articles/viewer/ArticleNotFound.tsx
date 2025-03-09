
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function ArticleNotFound() {
  return (
    <div className="container py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Article not found</h1>
        <p className="text-muted-foreground mb-6">
          The article you're looking for might have been removed or doesn't exist.
        </p>
        <Button asChild>
          <Link to="/articles">Return to Articles</Link>
        </Button>
      </div>
    </div>
  );
}
