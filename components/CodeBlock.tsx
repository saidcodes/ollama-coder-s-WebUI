import React, { useState } from 'react';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
// Choose a dark theme, e.g., vscDarkPlus or atomOneDark
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
// Register common languages for highlighting (add more as needed)
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import csharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import html from 'react-syntax-highlighter/dist/esm/languages/prism/markup'; // 'markup' is often used for HTML


import { ClipboardIcon, CheckIcon, EyeIcon, EyeSlashIcon } from '../constants';
import useCopyToClipboard from '../hooks/useCopyToClipboard';

SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('csharp', csharp);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('html', html);


interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [isCopied, copyToClipboard] = useCopyToClipboard();
  const [showPreview, setShowPreview] = useState(false);

  const handleCopy = () => {
    copyToClipboard(value);
  };

  // Normalize language string (e.g., 'js' to 'javascript')
  const normalizedLanguage = language ? language.toLowerCase() : 'text';
  const displayLanguage = ['js', 'javascript'].includes(normalizedLanguage) ? 'javascript' : 
                          ['py', 'python'].includes(normalizedLanguage) ? 'python' :
                          ['ts', 'typescript'].includes(normalizedLanguage) ? 'typescript' :
                          ['htm', 'html', 'markup'].includes(normalizedLanguage) ? 'html' : // Added html mapping
                           normalizedLanguage;
  
  const isHtml = displayLanguage === 'html';

  return (
    <div className="relative group my-2 bg-neutral-900 rounded-lg overflow-hidden shadow-md">
      <div className="flex justify-between items-center px-3 py-1.5 bg-neutral-800 border-b border-neutral-700">
        <span className="text-xs text-neutral-400 font-mono">{displayLanguage}</span>
        <div className="flex items-center">
          {isHtml && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-neutral-400 hover:text-neutral-100 transition-colors p-1 rounded opacity-60 hover:opacity-100 group-hover:opacity-100"
              aria-label={showPreview ? 'Hide Preview' : 'Show Preview'}
              title={showPreview ? 'Hide Preview' : 'Show Preview'}
            >
              {showPreview ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="text-neutral-400 hover:text-neutral-100 transition-colors p-1 rounded opacity-60 hover:opacity-100 group-hover:opacity-100 ml-1.5"
            aria-label={isCopied ? 'Copied!' : 'Copy code'}
            title={isCopied ? 'Copied!' : 'Copy code'}
          >
            {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <SyntaxHighlighter
        language={displayLanguage}
        style={vscDarkPlus}
        customStyle={{ margin: 0, padding: '1rem', fontSize: '0.875rem', maxHeight: '500px', overflow: 'auto' }}
        wrapLongLines={true}
        showLineNumbers={false} // Optional: can be true if desired
      >
        {value}
      </SyntaxHighlighter>
      {isHtml && showPreview && (
        <div className="border-t border-neutral-700">
          <iframe
            srcDoc={value}
            title="HTML Preview"
            sandbox="allow-scripts allow-same-origin" // allow-same-origin might be useful if preview needs to load relative assets, though unlikely for snippets. allow-scripts is for JS execution.
            className="w-full h-72 border-none bg-white" // Default height, could be adjustable
            aria-label="HTML Preview Content"
          />
        </div>
      )}
    </div>
  );
};

export default CodeBlock;