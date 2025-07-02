
import { Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const UrlInput = ({ value, onChange }: UrlInputProps) => {
  return (
    <div className="bg-gray-900/50 border border-red-500/30 rounded-lg p-6 backdrop-blur-sm">
      <div className="flex items-center space-x-2 mb-4">
        <Globe className="w-5 h-5 text-red-500" />
        <h3 className="text-lg font-semibold text-red-400">TARGET URL</h3>
      </div>
      
      <div className="space-y-2">
        <Input
          type="url"
          placeholder="https://example.com"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-black/50 border-green-500/50 text-green-400 placeholder-gray-500 focus:border-red-500 focus:ring-red-500/20 font-mono"
        />
        <p className="text-xs text-gray-400">
          Enter the target website containing the AI chat widget
        </p>
      </div>
    </div>
  );
};
