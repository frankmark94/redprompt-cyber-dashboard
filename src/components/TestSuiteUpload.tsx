import { useState } from 'react';
import { Upload, FileText, Check, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PromptData } from '@/pages/Index';
import { downloadExampleJSON, downloadExampleCSV } from '@/utils/exampleFiles';
import { uploadPrompts } from '@/utils/redpromptApi';

interface TestSuiteUploadProps {
  onFileUpload: (prompts: PromptData[]) => void;
}

export const TestSuiteUpload = ({ onFileUpload }: TestSuiteUploadProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setIsProcessing(true);
    setError(null);
    try {
      const prompts = await uploadPrompts(file);
      onFileUpload(prompts);
    } catch (err: any) {
      setError(err.message || 'Failed to upload prompts');
      onFileUpload([]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-gray-900/50 border border-red-500/30 rounded-lg p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold text-red-400">TEST SUITE</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadExampleJSON}
            className="text-xs text-gray-400 hover:text-green-400"
          >
            <Download className="w-3 h-3 mr-1" />
            JSON
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadExampleCSV}
            className="text-xs text-gray-400 hover:text-green-400"
          >
            <Download className="w-3 h-3 mr-1" />
            CSV
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="border-2 border-dashed border-green-500/30 rounded-lg p-8 text-center hover:border-red-500/50 transition-colors">
          <input
            type="file"
            accept=".json,.csv"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center space-y-2">
              {isProcessing ? (
                <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full" />
              ) : uploadedFile ? (
                <Check className="w-8 h-8 text-green-400" />
              ) : (
                <Upload className="w-8 h-8 text-gray-400" />
              )}
              <p className="text-sm text-gray-300">
                {uploadedFile ? uploadedFile.name : 'Upload JSON/CSV test suite'}
              </p>
              <p className="text-xs text-gray-500">
                Download example files above to get started
              </p>
            </div>
          </label>
        </div>
        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/30">
            {error}
          </div>
        )}
        {uploadedFile && !isProcessing && !error && (
          <div className="text-xs text-green-400 bg-green-500/10 p-2 rounded border border-green-500/30">
            ✓ Test suite loaded successfully
          </div>
        )}
      </div>
    </div>
  );
};
