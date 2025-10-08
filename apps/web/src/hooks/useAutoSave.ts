import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

interface UseAutoSaveOptions {
  saveFunction: (data: any) => Promise<any>;
  delay?: number;
  enabled?: boolean;
  onSave?: (data: any) => void;
  onError?: (error: any) => void;
  showToast?: boolean;
  toastMessage?: string;
}

export function useAutoSave({
  saveFunction,
  delay = 2000,
  enabled = true,
  onSave,
  onError,
  showToast = false,
  toastMessage = 'Changes saved automatically'
}: UseAutoSaveOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<any>(null);

  const saveMutation = useMutation({
    mutationFn: saveFunction,
    onMutate: () => {
      setIsSaving(true);
    },
    onSuccess: (data) => {
      setLastSaved(new Date());
      setIsSaving(false);
      if (onSave) onSave(data);
      if (showToast) {
        toast.success(toastMessage, { id: 'autosave-toast' });
      }
    },
    onError: (error) => {
      setIsSaving(false);
      if (onError) onError(error);
      if (showToast) {
        toast.error(`Autosave failed: ${error.message}`, { id: 'autosave-toast' });
      }
    },
  });

  const triggerSave = useCallback((data: any) => {
    if (!enabled || !data) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      // Only save if data has actually changed
      if (JSON.stringify(data) !== JSON.stringify(lastDataRef.current)) {
        lastDataRef.current = data;
        saveMutation.mutate(data);
      }
    }, delay);
  }, [enabled, delay, saveMutation]);

  const saveNow = useCallback((data: any) => {
    if (!enabled || !data) return;
    
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    lastDataRef.current = data;
    saveMutation.mutate(data);
  }, [enabled, saveMutation]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    triggerSave,
    saveNow,
    isSaving,
    lastSaved,
    isError: saveMutation.isError,
    error: saveMutation.error,
  };
}

// Hook for form auto-save with field-level tracking
export function useFormAutoSave<T extends Record<string, any>>({
  saveFunction,
  delay = 2000,
  enabled = true,
  onSave,
  onError,
  showToast = false,
  toastMessage = 'Changes saved automatically'
}: UseAutoSaveOptions) {
  const [formData, setFormData] = useState<T>({} as T);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const autoSave = useAutoSave({
    saveFunction,
    delay,
    enabled: enabled && hasUnsavedChanges,
    onSave: (data) => {
      setHasUnsavedChanges(false);
      if (onSave) onSave(data);
    },
    onError,
    showToast,
    toastMessage,
  });

  const updateField = useCallback((field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    autoSave.triggerSave({ ...formData, [field]: value });
  }, [formData, autoSave]);

  const updateForm = useCallback((newData: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...newData }));
    setHasUnsavedChanges(true);
    autoSave.triggerSave({ ...formData, ...newData });
  }, [formData, autoSave]);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearFieldError = useCallback((field: keyof T) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const saveForm = useCallback(() => {
    if (hasUnsavedChanges) {
      autoSave.saveNow(formData);
    }
  }, [hasUnsavedChanges, formData, autoSave]);

  return {
    formData,
    setFormData,
    updateField,
    updateForm,
    hasUnsavedChanges,
    isSaving: autoSave.isSaving,
    lastSaved: autoSave.lastSaved,
    isError: autoSave.isError,
    error: autoSave.error,
    fieldErrors,
    setFieldError,
    clearFieldError,
    saveForm,
  };
}

