import React, { useState, useRef, useEffect, memo } from 'react';
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { registerLanguages, normalizeLanguage } from '../utils/codeLanguages'; // Added normalizeLanguage
import { ClipboardIcon, CheckIcon, EyeIcon, EyeSlashIcon, PencilIcon } from '../constants';
import useCopyToClipboard from '../hooks/useCopyToClipboard';


// Register all languages
registerLanguages(SyntaxHighlighter);

interface CodeBlockProps {
  language: string;
  value: string;
  onChange?: (value: string) => void;
}

interface CodeRendererProps {
  content: string;
  lang: string;
  isEditing: boolean;
  isHtml: boolean;
  onEdit: (newValue: string) => void;
  onEditComplete: () => void;
}

const CodeRenderer = memo(({ content, lang, isEditing, isHtml, onEdit, onEditComplete }: CodeRendererProps) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      onEditComplete();
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      onEdit(content.substring(0, start) + '  ' + content.substring(end));
      
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = editorRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div
      className="relative">
      {isEditing && isHtml ? (
        <div className="relative group">
          <textarea
            ref={editorRef}
            value={content}
            onChange={(e) => onEdit(e.target.value)}
            onBlur={onEditComplete}
            onKeyDown={handleKeyDown}
            className="w-full font-mono text-sm bg-neutral-900 text-neutral-100 p-4 border border-blue-500/30 outline-none resize-none rounded"
            style={{
              minHeight: '100px',
              fontFamily: 'monospace',
              whiteSpace: 'pre',
              overflowX: 'auto',
              lineHeight: '1.5'
            }}
            spellCheck="false"
          />
          <div className="absolute bottom-2 right-2 text-xs text-neutral-500 opacity-0 group-hover:opacity-100">
            Esc to cancel • Ctrl+S to save
          </div>
        </div>
      ) : (
        <div className={`${isHtml ? 'cursor-text hover:bg-neutral-800/50' : ''} transition-colors`}>
          <SyntaxHighlighter
            language={lang}
            style={vscDarkPlus}
            customStyle={{ 
              margin: 0, 
              padding: '1rem',
              fontSize: '0.875rem',
              maxHeight: '100%',
              overflow: 'hidden',
              overflowX: 'auto'
            }}
            wrapLongLines
            showLineNumbers
            PreTag="div"
          >
            {content}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
});

CodeRenderer.displayName = 'CodeRenderer';

interface CodeBlockHeaderProps {
  displayLanguage: string;
  isHtml: boolean;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  showPreview: boolean;
  setShowPreview: (showPreview: boolean) => void;
  isCopied: boolean;
  handleCopy: () => Promise<void>;
}

interface HtmlPreviewProps {
  showPreview: boolean;
  editableValue: string;
  setShowPreview: (showPreview: boolean) => void;
}

const HtmlPreview: React.FC<HtmlPreviewProps> = ({ showPreview, editableValue, setShowPreview }) => {
  return (
    <>
      {showPreview && (
        <div className="border-t border-neutral-700">
          <div className="flex justify-between items-center px-3 py-2 bg-neutral-800">
            <span className="text-sm text-neutral-400">
              Preview
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-neutral-400 hover:text-neutral-100 transition-colors p-1 rounded opacity-60 hover:opacity-100"
                title={showPreview ? "Hide Preview" : "Show Preview"}
              >
                {showPreview ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <iframe
            srcDoc={editableValue}
            title="HTML Preview"
            sandbox="allow-scripts allow-same-origin"
            className="w-full bg-white"
            style={{
              height: '400px',
              minHeight: '200px',
              maxHeight: '800px'
            }}
          />
        </div>
      )}
    </>
  );
};

const CodeBlockHeader: React.FC<CodeBlockHeaderProps> = ({
  displayLanguage,
  isHtml,
  isEditing,
  setIsEditing,
  showPreview,
  setShowPreview,
  isCopied,
  handleCopy,
}) => {
  return (
    <div className=" flex justify-between items-center px-3 py-1.5 bg-neutral-700 border-b border-neutral-700">
      <span className=" text-xs text-neutral-400 font-mono">{displayLanguage}</span>
      <div className="flex items-center space-x-2">
        {isHtml && (
          <>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-neutral-400 hover:text-neutral-100 transition-colors p-1 rounded opacity-60 hover:opacity-100 group-hover:opacity-100"
              aria-label={isEditing ? 'Save changes' : 'Edit code'}
              title={isEditing ? 'Save changes' : 'Edit code'}
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-neutral-400 hover:text-neutral-100 transition-colors p-1 rounded opacity-60 hover:opacity-100 group-hover:opacity-100"
              aria-label={showPreview ? 'Hide Preview' : 'Show Preview'}
              title={showPreview ? 'Hide Preview' : 'Show Preview'}
            >
              {showPreview ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
            </button>
          </>
        )}
        <button
          onClick={handleCopy}
          className="text-neutral-400 hover:text-neutral-100 transition-colors p-1 rounded opacity-60 hover:opacity-100 group-hover:opacity-100"
          aria-label={isCopied ? 'Copied!' : 'Copy code'}
          title={isCopied ? 'Copied!' : 'Copy code'}
        >
          {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <ClipboardIcon className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value, onChange }) => {
  const [isCopied, copyToClipboard] = useCopyToClipboard();
  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableValue, setEditableValue] = useState(value);

  const displayLanguage = normalizeLanguage(language);
  const isHtml = displayLanguage === 'html';

  useEffect(() => {
    setEditableValue(value);
  }, [value]);

  const handleCopy = async () => {
    await copyToClipboard(editableValue);
  };

  const handleEdit = (newValue: string) => {
    setEditableValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleEditComplete = () => {
    setIsEditing(false);
    if (onChange && editableValue !== value) {
      onChange(editableValue);
    }
  };

  return (
    <div className="sticky top-0 group my-2 bg-neutral-900 rounded-lg overflow-hidden shadow-md">
      <CodeBlockHeader
        displayLanguage={displayLanguage}
        isHtml={isHtml}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        isCopied={isCopied}
        handleCopy={handleCopy}
      />
      
      <CodeRenderer
        content={editableValue}
        lang={displayLanguage}
        isEditing={isEditing}
        isHtml={isHtml}
        onEdit={handleEdit}
        onEditComplete={handleEditComplete}
      />

      {isHtml && (
        <HtmlPreview
          showPreview={showPreview}
          editableValue={editableValue}
          setShowPreview={setShowPreview}
        />
      )}
    </div>
  );
};

export default memo(CodeBlock);