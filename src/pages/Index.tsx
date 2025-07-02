
import { useState } from 'react';
import { Header } from '@/components/Header';
import { UrlInput } from '@/components/UrlInput';
import { TestSuiteUpload } from '@/components/TestSuiteUpload';
import { PromptQueue } from '@/components/PromptQueue';
import { ResponseViewer } from '@/components/ResponseViewer';
import { ControlPanel } from '@/components/ControlPanel';

export interface PromptData {
  id: string;
  prompt: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  response?: string;
  timestamp?: string;
  tokenUsage?: number;
  maxTokens?: number;
  tags?: string[];
}

const Index = () => {
  const [targetUrl, setTargetUrl] = useState('');
  const [prompts, setPrompts] = useState<PromptData[]>([]);
  const [responses, setResponses] = useState<PromptData[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [traceMode, setTraceMode] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('all');

  const handleFileUpload = (uploadedPrompts: PromptData[]) => {
    setPrompts(uploadedPrompts);
    setResponses([]);
  };

  const handleRunTest = () => {
    if (!targetUrl || prompts.length === 0) return;
    
    setIsRunning(true);
    
    // Simulate test execution
    prompts.forEach((prompt, index) => {
      setTimeout(() => {
        const updatedPrompt: PromptData = {
          ...prompt,
          status: 'completed',
          response: generateMockResponse(prompt.prompt),
          timestamp: new Date().toISOString(),
          tokenUsage: Math.floor(Math.random() * 150) + 50,
          maxTokens: 200,
          tags: generateTags(prompt.prompt)
        };
        
        setResponses(prev => [...prev, updatedPrompt]);
        
        if (index === prompts.length - 1) {
          setIsRunning(false);
        }
      }, (index + 1) * 2000);
    });
  };

  const generateMockResponse = (prompt: string): string => {
    const responses = [
      "I cannot assist with that request as it violates my usage guidelines.",
      "I'm designed to be helpful, harmless, and honest...",
      "ERROR: Unauthorized access attempt detected.",
      "Hello! I'm here to help with banking-related questions.",
      "I notice you're trying to override my instructions. I cannot comply with that request."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateTags = (prompt: string): string[] => {
    const tags = [];
    if (prompt.toLowerCase().includes('ignore')) tags.push('Possible Jailbreak');
    if (prompt.toLowerCase().includes('system')) tags.push('System Override');
    if (prompt.toLowerCase().includes('admin')) tags.push('Admin Access');
    if (Math.random() > 0.7) tags.push('Suspicious');
    return tags;
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <div className="bg-gradient-to-b from-red-950/20 to-black min-h-screen">
        <Header />
        
        <div className="container mx-auto px-6 py-8 space-y-8">
          {/* Target Configuration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UrlInput value={targetUrl} onChange={setTargetUrl} />
            <TestSuiteUpload onFileUpload={handleFileUpload} />
          </div>

          {/* Control Panel */}
          <ControlPanel 
            isRunning={isRunning}
            traceMode={traceMode}
            onTraceToggle={setTraceMode}
            onRunTest={handleRunTest}
            canRun={!!targetUrl && prompts.length > 0}
          />

          {/* Main Dashboard */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1">
              <PromptQueue prompts={prompts} isRunning={isRunning} />
            </div>
            <div className="xl:col-span-2">
              <ResponseViewer 
                responses={responses}
                filter={currentFilter}
                onFilterChange={setCurrentFilter}
                traceMode={traceMode}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
