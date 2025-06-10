
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const SetViewSkeleton = () => (
  <div className="min-h-screen bg-background">
    <div className="border-b p-4">
      <Skeleton className="h-8 w-48" />
    </div>
    
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-20" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <Skeleton className="h-3 w-12 mb-1" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div>
                  <Skeleton className="h-3 w-12 mb-1" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  </div>
);

export const DecksSkeleton = () => (
  <div className="min-h-screen bg-background">
    <div className="border-b p-4">
      <Skeleton className="h-8 w-48" />
    </div>
    
    <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  </div>
);

export const CardEditorSkeleton = () => (
  <div className="min-h-screen bg-background">
    <div className="border-b p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>
    </div>
    
    <div className="flex h-[calc(100vh-60px)]">
      <div className="w-64 border-r p-4">
        <Skeleton className="h-6 w-32 mb-4" />
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full mb-2" />
        ))}
      </div>
      
      <div className="flex-1 p-4">
        <div className="bg-white rounded-lg shadow-sm border h-96 flex items-center justify-center">
          <Skeleton className="h-64 w-full max-w-md" />
        </div>
      </div>
    </div>
  </div>
);
