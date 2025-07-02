
import { Play, Square, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface ControlPanelProps {
  isRunning: boolean;
  traceMode: boolean;
  onTraceToggle: (enabled: boolean) => void;
  onRunTest: () => void;
  canRun: boolean;
}

export const ControlPanel = ({ 
  isRunning, 
  traceMode, 
  onTraceToggle, 
  onRunTest, 
  canRun 
}: ControlPanelProps) => {
  return (
    <div className="bg-gray-900/50 border border-red-500/30 rounded-lg p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Button
            onClick={onRunTest}
            disabled={!canRun || isRunning}
            className="bg-red-600 hover:bg-red-700 text-white border-red-500 px-8 py-2 font-semibold tracking-wide"
          >
            {isRunning ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                RUNNING...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                RUN TEST SUITE
              </>
            )}
          </Button>
          
          {isRunning && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 text-sm font-semibold">EXECUTING PROMPTS</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {traceMode ? <Eye className="w-4 h-4 text-green-400" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
            <span className="text-sm text-gray-300">Trace Mode</span>
            <Switch
              checked={traceMode}
              onCheckedChange={onTraceToggle}
              className="data-[state=checked]:bg-green-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
