
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { PromptData } from '@/pages/Index';

interface PromptQueueProps {
  prompts: PromptData[];
  isRunning: boolean;
}

export const PromptQueue = ({ prompts, isRunning }: PromptQueueProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'running':
        return <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-gray-400';
      case 'running':
        return 'text-yellow-400';
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-900/50 border border-red-500/30 rounded-lg p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-red-400">PROMPT QUEUE</h3>
        <div className="text-sm text-gray-400">
          {prompts.length} prompts loaded
        </div>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {prompts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>No test suite loaded</p>
          </div>
        ) : (
          prompts.map((prompt, index) => (
            <div
              key={prompt.id}
              className="bg-black/30 border border-gray-700 rounded p-3 hover:border-red-500/50 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(prompt.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">#{index + 1}</span>
                    <span className={`text-xs font-semibold uppercase ${getStatusColor(prompt.status)}`}>
                      {prompt.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2">
                    {prompt.prompt}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
