import { useRef, useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Trash2, Download } from 'lucide-react';

interface SignaturePadProps {
  onSignatureChange: (signature: string) => void;
  disabled?: boolean;
  width?: number;
  height?: number;
}

export function SignaturePad({ 
  onSignatureChange, 
  disabled = false, 
  width = 400, 
  height = 200 
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
  }, [width, height]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.type.includes('touch') 
      ? (e as React.TouchEvent).touches[0].clientX - rect.left
      : (e as React.MouseEvent).clientX - rect.left;
    const y = e.type.includes('touch')
      ? (e as React.TouchEvent).touches[0].clientY - rect.top
      : (e as React.MouseEvent).clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.type.includes('touch')
      ? (e as React.TouchEvent).touches[0].clientX - rect.left
      : (e as React.MouseEvent).clientX - rect.left;
    const y = e.type.includes('touch')
      ? (e as React.TouchEvent).touches[0].clientY - rect.top
      : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check if there's any content on the canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, width, height);
    const hasContent = imageData.data.some((value, index) => {
      // Check alpha channel (every 4th value starting from index 3)
      return index % 4 === 3 && value > 0;
    });

    if (hasContent) {
      setHasSignature(true);
      const signature = canvas.toDataURL('image/png');
      onSignatureChange(signature);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    setHasSignature(false);
    onSignatureChange('');
  };

  const downloadSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'signature.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`cursor-crosshair ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{ touchAction: 'none' }}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {hasSignature ? 'Signature captured' : 'Sign above to capture your signature'}
        </div>
        
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearSignature}
            disabled={disabled || !hasSignature}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={downloadSignature}
            disabled={disabled || !hasSignature}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}
