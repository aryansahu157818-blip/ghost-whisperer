import React from 'react';
import ReactMarkdown from 'react-markdown';

interface SafeMarkdownProps {
  content: string;
  className?: string;
}

export const SafeMarkdown: React.FC<SafeMarkdownProps> = ({ content, className }) => {
  try {
    // Basic sanitization to prevent crashes from malformed content
    const sanitizedContent = content || '';
    
    return (
      <div className={className}>
        <ReactMarkdown>
          {sanitizedContent}
        </ReactMarkdown>
      </div>
    );
  } catch (error) {
    console.error('Error rendering markdown:', error);
    // Fallback to displaying the raw content as plain text
    return <div className={className}>{content || 'No content'}</div>;
  }
};