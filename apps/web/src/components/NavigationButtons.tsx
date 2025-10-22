import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';

interface NavigationButtonsProps {
  hasUnsavedChanges?: boolean;
  onBack?: () => void;
  onForward?: () => void;
  showWarning?: boolean;
}

export function NavigationButtons({ 
  hasUnsavedChanges = false, 
  onBack, 
  onForward,
  showWarning = true 
}: NavigationButtonsProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (hasUnsavedChanges && showWarning) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave? Your changes will be lost.'
      );
      if (!confirmed) return;
    }
    
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleForward = () => {
    if (hasUnsavedChanges && showWarning) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave? Your changes will be lost.'
      );
      if (!confirmed) return;
    }
    
    if (onForward) {
      onForward();
    } else {
      navigate(1);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && showWarning && (
        <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-1 rounded-md text-sm">
          <AlertTriangle className="w-4 h-4 mr-1" />
          <span>Unsaved changes</span>
        </div>
      )}
      
      {/* Navigation Buttons */}
      <div className="flex items-center space-x-1">
        <button
          onClick={handleBack}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          title="Go back"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        
        <button
          onClick={handleForward}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          title="Go forward"
        >
          Forward
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}

// Hook for tracking unsaved changes
export function useUnsavedChanges(hasChanges: boolean) {
  const [showWarning, setShowWarning] = React.useState(false);

  React.useEffect(() => {
    setShowWarning(hasChanges);
  }, [hasChanges]);

  // Warn user before leaving page
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  return { showWarning };
}
