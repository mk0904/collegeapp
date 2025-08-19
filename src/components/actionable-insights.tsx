'use client';

import { useEffect, useState } from 'react';
import { getActionableInsights, type ActionableInsightsOutput } from '@/ai/flows/actionable-insights';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ActionableInsights() {
  const [data, setData] = useState<ActionableInsightsOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await getActionableInsights({});
        setData(result);
      } catch (e) {
        setError('Failed to fetch actionable insights.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
            <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
            </Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error || 'No insights data available.'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {data.insights.map((insight) => (
        <Card key={insight.metric} className={insight.isOutlier ? 'border-destructive/50 ring-1 ring-destructive/20' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{insight.metric}</CardTitle>
            {insight.isOutlier ? (
              <AlertCircle className="h-4 w-4 text-destructive" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insight.value.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{insight.explanation}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
