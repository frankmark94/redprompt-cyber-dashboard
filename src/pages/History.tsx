import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { getResults, TestRunResult } from '@/utils/redpromptApi';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

const History = () => {
  const [runs, setRuns] = useState<TestRunResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getResults();
        setRuns(res.results);
      } catch (err: any) {
        setError(err.message || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <div className="bg-gradient-to-b from-red-950/20 to-black min-h-screen">
        <Header />
        <div className="container mx-auto px-6 py-8 space-y-6">
          <h2 className="text-xl font-semibold text-red-400">TEST RUN HISTORY</h2>
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : runs.length === 0 ? (
            <p className="text-gray-400">No previous runs found.</p>
          ) : (
            <Table className="bg-gray-900/50 border border-red-500/30 rounded-lg">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Target URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total Prompts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => (
                  <TableRow key={run.test_run_id}>
                    <TableCell className="font-mono text-xs">
                      {run.test_run_id}
                    </TableCell>
                    <TableCell>{run.target_url}</TableCell>
                    <TableCell>{run.status}</TableCell>
                    <TableCell>
                      {new Date(run.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{run.total_prompts}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
