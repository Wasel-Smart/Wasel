import React, { useState, useCallback } from 'react';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4=';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
}

export function ImageWithFallback({
  src,
  alt,
  fallbackSrc = ERROR_IMG_SRC,
  style,
  className,
  onError,
  ...rest
}: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setDidError(true);
    setIsLoading(false);
    onError?.(event);
  }, [onError]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  if (didError) {
    return (
      <div
        className={`inline-block bg-neutral-100 text-center align-middle ${className ?? ''}`}
        style={style}
        role="img"
        aria-label={`Failed to load image: ${alt}`}
      >
        <div className="flex items-center justify-center w-full h-full">
          <img 
            src={fallbackSrc} 
            alt={`Error loading ${alt}`} 
            {...rest} 
            data-original-url={src}
            className="opacity-50"
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div 
          className={`inline-block bg-neutral-100 animate-pulse ${className ?? ''}`}
          style={style}
          aria-label="Loading image"
        />
      )}
      <img 
        src={src} 
        alt={alt} 
        className={`${className ?? ''} ${isLoading ? 'hidden' : ''}`}
        style={style} 
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
        {...rest} 
      />
    </>
  );
}
