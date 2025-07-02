
import { useState } from 'react';
import { Filter, Tag, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PromptData } from '@/pages/Index';

interface ResponseViewerProps {
  responses: PromptData[];
  filter: string;
  onFilterChange: (filter: string) => void;
  traceMode: boolean;
}

export const ResponseViewer = ({ responses, filter, onFilterChange, traceMode }: ResponseViewerProps) => {
  const [selectedResponse, setSelectedResponse] = useState<PromptData | null>(null);

  const filteredResponses = responses.filter(response => {
    if (filter === 'all') return true;
    if (filter === 'jailbreak') return response.tags?.includes('Possible Jailbreak');
    if (filter === 'suspicious') return response.tags?.includes('Suspicious');
    return true;
  });

  const getResponseStatus = (response: string) => {
    if (response.toLowerCase().includes('cannot') || response.toLowerCase().includes('error')) {
      return { status: 'Blocked', color: 'text-red-400 bg-red-500/10 border-red-500/30' };
    }
    if (response.toLowerCase().includes('help') && !response.toLowerCase().includes('cannot')) {
      return { status: 'Success', color: 'text-green-400 bg-green-500/10 border-green-500/30' };
    }
    return { status: 'Suspicious', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' };
  };

  return (
    <div className="bg-gray-900/50 border border-red-500/30 rounded-lg p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-red-400">RESPONSE ANALYSIS</h3>
        
        <div className="flex items-center space-x-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <Select value={filter} onValueChange={onFilterChange}>
            <SelectTrigger className="w-40 bg-black/50 border-green-500/50 text-green-400">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-red-500/30">
              <SelectItem value="all">All Responses</SelectItem>
              <SelectItem value="jailbreak">Jailbreaks</SelectItem>
              <SelectItem value="suspicious">Suspicious</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredResponses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2" />
            <p>No responses yet. Run a test suite to see results.</p>
          </div>
        ) : (
          filteredResponses.map((response) => {
            const statusInfo = getResponseStatus(response.response || '');
            
            return (
              <div
                key={response.id}
                className="bg-black/30 border border-gray-700 rounded-lg p-4 hover:border-red-500/50 transition-colors cursor-pointer"
                onClick={() => setSelectedResponse(response)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded border ${statusInfo.color}`}>
                      {statusInfo.status}
                    </span>
                    {response.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded border border-purple-500/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-400">
                    {response.timestamp && new Date(response.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-1">PROMPT:</h4>
                    <p className="text-sm text-green-400 bg-green-500/5 p-2 rounded border border-green-500/20 line-clamp-2">
                      {response.prompt}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-1">RESPONSE:</h4>
                    <p className="text-sm text-gray-300 bg-gray-500/5 p-2 rounded border border-gray-500/20 line-clamp-2">
                      {response.response}
                    </p>
                  </div>

                  {response.tokenUsage && (
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Zap className="w-3 h-3" />
                        <span>Tokens: {response.tokenUsage}/{response.maxTokens}</span>
                      </div>
                      <div className="flex-1 bg-gray-700 rounded-full h-1">
                        <div
                          className="bg-gradient-to-r from-green-400 to-red-500 h-1 rounded-full"
                          style={{ width: `${(response.tokenUsage / (response.maxTokens || 200)) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {traceMode && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="text-xs text-blue-400 bg-blue-500/10 p-2 rounded border border-blue-500/30">
                      🖥️ Browser trace captured - Click to view screenshot
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
