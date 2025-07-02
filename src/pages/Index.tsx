import { useState } from 'react';
import { Header } from '@/components/Header';
import { UrlInput } from '@/components/UrlInput';
import { TestSuiteUpload } from '@/components/TestSuiteUpload';
import { PromptQueue } from '@/components/PromptQueue';
import { ResponseViewer } from '@/components/ResponseViewer';
import { ControlPanel } from '@/components/ControlPanel';
import { PromptData, runTests, getTestResult, TestRunResponse, TestRunResult } from '@/utils/redpromptApi';

const Index = () => {
  const [targetUrl, setTargetUrl] = useState('');
  const [prompts, setPrompts] = useState<PromptData[]>([]);
  const [responses, setResponses] = useState<PromptData[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [traceMode, setTraceMode] = useState(false);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [testRunId, setTestRunId] = useState<string | null>(null);

  const handleFileUpload = (uploadedPrompts: PromptData[]) => {
    setPrompts(uploadedPrompts);
    setResponses([]);
  };

  const handleRunTest = async () => {
    if (!targetUrl || prompts.length === 0) return;
    setIsRunning(true);
    setResponses([]);
    try {
      const runResp: TestRunResponse = await runTests(targetUrl);
      setTestRunId(runResp.test_run_id);
      // Poll for results every 2 seconds until status is not 'started'
      let finished = false;
      while (!finished) {
        const result: TestRunResult = await getTestResult(runResp.test_run_id);
        if (result.status === 'completed' || result.status === 'error') {
          setResponses(result.results as PromptData[]);
          setIsRunning(false);
          finished = true;
        } else {
          await new Promise(res => setTimeout(res, 2000));
        }
      }
    } catch (err) {
      setIsRunning(false);
      // Optionally, show error to user
    }
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
