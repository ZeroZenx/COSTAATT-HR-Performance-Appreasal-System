import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AutoSaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  isError: boolean;
  error?: any;
}

export function AutoSaveIndicator({ isSaving, lastSaved, isError, error }: AutoSaveIndicatorProps) {
  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-sm text-blue-600">
        <Clock className="h-4 w-4 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <AlertCircle className="h-4 w-4" />
        <span>Save failed</span>
        {error && (
          <span className="text-xs text-red-500">
            ({error.message || 'Unknown error'})
          </span>
        )}
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span>Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}</span>
      </div>
    );
  }

  return null;
}

