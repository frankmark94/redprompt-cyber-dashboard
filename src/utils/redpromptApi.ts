// RedPrompt API utility

export interface PromptData {
  id: string;
  prompt: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'timeout';
  response?: string;
  timestamp?: string;
  token_usage?: number;
  max_tokens?: number;
  tags?: string[];
  execution_time?: number;
  error_message?: string;
  screenshot_path?: string;
}

export interface TestRunResponse {
  test_run_id: string;
  status: string;
  message: string;
  prompts_count: number;
}

export interface TestResult {
  id: string;
  prompt: string;
  response?: string;
  status: string;
  timestamp: string;
  execution_time: number;
  tags?: string[];
  error_message?: string;
  screenshot_path?: string;
}

export interface TestRunResult {
  test_run_id: string;
  target_url: string;
  timestamp: string;
  status: string;
  total_prompts: number;
  successful_tests: number;
  failed_tests: number;
  results: TestResult[];
  error?: string;
}

export interface ResultsResponse {
  results: TestRunResult[];
  total_runs: number;
}

const API_BASE = 'http://localhost:8000';

export async function uploadPrompts(file: File): Promise<PromptData[]> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload-prompts`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload prompts');
  const data = await res.json();
  return data.prompts;
}

export async function runTests(targetUrl: string): Promise<TestRunResponse> {
  const res = await fetch(`${API_BASE}/run-tests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target_url: targetUrl }),
  });
  if (!res.ok) throw new Error('Failed to start test run');
  return res.json();
}

export async function getResults(): Promise<ResultsResponse> {
  const res = await fetch(`${API_BASE}/results`);
  if (!res.ok) throw new Error('Failed to fetch results');
  return res.json();
}

export async function getTestResult(testRunId: string): Promise<TestRunResult> {
  const res = await fetch(`${API_BASE}/results/${testRunId}`);
  if (!res.ok) throw new Error('Failed to fetch test run result');
  return res.json();
}
