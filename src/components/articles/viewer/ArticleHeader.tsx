
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ChevronLeft, User, Tag } from 'lucide-react';

interface ArticleHeaderProps {
  title: string;
  createdAt: string;
  authorId?: string;
  category?: string;
}

export function ArticleHeader({ title, createdAt, authorId, category }: ArticleHeaderProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4">
          <Link to="/articles">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Articles
          </Link>
        </Button>
      </div>
      
      <CardHeader>
        <div className="space-y-2">
          <CardTitle className="text-3xl">{title}</CardTitle>
          
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              {formatDate(createdAt)}
            </div>
            
            <div className="flex items-center">
              <User className="mr-1 h-4 w-4" />
              {authorId || 'Unknown'}
            </div>
            
            {category && (
              <div className="flex items-center">
                <Tag className="mr-1 h-4 w-4" />
                {category}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
    </>
  );
}
