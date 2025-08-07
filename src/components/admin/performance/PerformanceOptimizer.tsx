import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Zap, RefreshCw, CheckCircle } from 'lucide-react';

const PerformanceOptimizer = () => {
  const [optimizing, setOptimizing] = useState(false);
  const [score] = useState(85);

  const runOptimization = async () => {
    setOptimizing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setOptimizing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6" />
          <h1 className="text-3xl font-bold">Otimização de Performance</h1>
        </div>
        <Button onClick={runOptimization} disabled={optimizing}>
          {optimizing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Otimizando...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Otimizar Agora
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Score de Performance: {score}/100</CardTitle>
          <CardDescription>Sistema funcionando de forma otimizada</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={score} className="h-3" />
          <div className="mt-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm">Performance excelente</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceOptimizer;