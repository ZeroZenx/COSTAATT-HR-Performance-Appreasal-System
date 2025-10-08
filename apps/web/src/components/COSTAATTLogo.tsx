
interface COSTAATTLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function COSTAATTLogo({ 
  className = '', 
  showText = true, 
  size = 'md' 
}: COSTAATTLogoProps) {
  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl', 
    xl: 'text-4xl'
  };

  return (
    <div className={`flex items-center ${className}`}>
      
      {/* Text */}
      {showText && (
        <div className="text-right">
          <div className={`${textSizeClasses[size]} font-bold text-gray-900 tracking-wide`}>
            COSTAATT
          </div>
          <div className="text-sm text-blue-600 font-medium leading-tight">
            College of Science, Technology &<br />
            Applied Arts of Trinidad & Tobago
          </div>
        </div>
      )}
    </div>
  );
}
