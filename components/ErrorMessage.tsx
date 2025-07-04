import React from 'react';

interface ErrorMessageProps {
  error: string | null;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  if (!error) {
    return null;
  }

  return (
    <div className="text-red-400 bg-red-900/50 p-3 rounded-md text-sm">
      {error}
    </div>
  );
};

export default ErrorMessage;