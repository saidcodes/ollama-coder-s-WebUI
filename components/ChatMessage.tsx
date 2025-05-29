import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';
import CodeBlock from './CodeBlock';
import { UserCircleIcon, SparklesIcon } from '../constants'; // Using Sparkles for AI

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

// Define a specific type for the props our custom code component will receive
// This should align with react-markdown's CodeProps.
// 'node' is an AST node from HAST; 'any' is used for simplicity here if 'hast' types aren't directly available.
// 'children' is typically React.ReactNode[] for custom component renderers.
interface CustomCodeComponentProps {
  node: any; // Ideally: import { Element } from 'hast'; then use 'Element' here.
  inline?: boolean;
  className?: string;
  children: React.ReactNode[]; // react-markdown passes children as an array to components
  style?: React.CSSProperties; // Optional style prop
  [key: string]: any; // To catch any other props passed by react-markdown
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isStreaming }) => {
  const { role, content } = message;
  const isUser = role === 'user';

  const Icon = isUser ? UserCircleIcon : SparklesIcon;
  const bgColor = isUser ? 'bg-neutral-750' : 'bg-neutral-800'; // Slightly different bg for user/AI
  const textColor = 'text-neutral-100'; // Consistent text color

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`flex items-start max-w-xl lg:max-w-2xl xl:max-w-3xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <Icon className={`w-7 h-7 rounded-full p-1 flex-shrink-0 ${isUser ? 'ml-2 bg-blue-500 text-white' : 'mr-2 bg-purple-500 text-white'}`} />
        {/* Apply prose styles to this wrapper div, not directly to ReactMarkdown */}
        <div className={`px-4 py-3 rounded-xl ${bgColor} ${textColor} shadow prose prose-sm prose-invert max-w-none prose-pre:bg-neutral-900 prose-pre:p-0 prose-pre:rounded-md`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: (props: CustomCodeComponentProps) => { // Explicitly type props
                const { node, inline, className, children, ...rest } = props;
                
                // Convert children to string for CodeBlock's value prop.
                // String(children) works because ReactNodeArray stringifies by concatenation.
                const value = String(children).replace(/\n$/, '');
                const match = /language-(\w+)/.exec(className || '');

                if (!inline && match) {
                  return (
                    <CodeBlock
                      language={match[1]}
                      value={value}
                      {...rest} // Pass remaining props
                    />
                  );
                }
                if (!inline) { // For code blocks without explicit language
                     return (
                        <CodeBlock
                          language="text" // default or try to guess
                          value={value}
                          {...rest} // Pass remaining props
                        />
                     );
                }
                // For inline code, use the standard <code> element
                // Ensure className from markdown (e.g., for syntax highlighting hints) is preserved if passed.
                return (
                  <code className={`${className || ''} bg-neutral-700 text-sm text-emerald-300 px-1 py-0.5 rounded`} {...rest}>
                    {children}
                  </code>
                );
              },
              // For p, ul, ol, a, the existing ({node, ...props}) syntax is generally fine
              // if 'node' is not strictly typed or used in complex ways.
              // The errors were specific to ReactMarkdown's top-level props and the 'code' component's 'inline' prop.
              p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
              a: ({node, ...props}) => <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
            }}
          >
            {content + (isStreaming ? '▍' : '')}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;