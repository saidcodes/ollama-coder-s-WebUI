import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "../types";
import CodeBlock from "./CodeBlock";
import { UserCircleIcon, SparklesIcon, SpeakerXMarkIcon, SpeakerWaveIcon, ClipboardIcon, CheckIcon } from "../constants"; // Using Sparkles for AI, Added Clipboard and Check Icons
import { TTSService } from "../services/tts";
import { useTTS } from "@/contexts/TTSContext";
import useCopyToClipboard from '../hooks/useCopyToClipboard'; // Import the hook
 
 
 interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}
// Custom component for react-markdown
interface CustomCodeComponentProps {
  node?: any; // Make node optional to match react-markdown's typing
  inline?: boolean;
  className?: string;
  children?: React.ReactNode; // Make children optional
  style?: React.CSSProperties; // Optional style prop
  [key: string]: any; // To catch any other props passed by react-markdown
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isStreaming }) => {
  const { role, content } = message;
  const isUser = role === "user";
  const [isPlaying, setIsplaying] = React.useState(false);
  const {selectedVoice}=useTTS()
  const [isCopied, copyToClipboard] = useCopyToClipboard(); // Initialize copy hook
 
  const handleCopy = async () => { // Add copy handler
    await copyToClipboard(content);
  };
 
   const Icon = isUser ? UserCircleIcon : SparklesIcon;
  const bgColor = isUser ? "bg-neutral-700" : "bg-transparent"; //no bg for the ai
  const textColor = "text-neutral-100"; // Consistent text color
  
  // function to handle the tts service
  const handleSpeak = async () => {
    try {
      if (!isStreaming && !isUser) {
        setIsplaying(true);
        await TTSService.speak(content,selectedVoice);

      }
      setIsplaying(false);
    } catch (error) {
      setIsplaying(false)
      alert("Text-to-speech service error. Please make sure the API is running.");
    }
    
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`flex items-start max-w-xl lg:max-w-2xl xl:max-w-3xl ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <Icon
          className={`w-7 h-7 rounded-full p-1 flex-shrink-0 ${
            isUser
              ? "ml-2 bg-blue-500 text-white"
              : "mr-2 bg-purple-500 text-white"
          }`}
        />

        {/* Apply prose styles to this wrapper div, not directly to ReactMarkdown */}
        <div
          className={`px-4 py-3 rounded-xl ${bgColor} ${textColor} prose prose-invert 
  prose-sm max-w-none
  prose-ul:list-disc 
  prose-ul:pl-5
  prose-ol:list-decimal 
  prose-ol:pl-5
  prose-li:my-1
  prose-p:my-2
  prose-headings:text-white
  prose-strong:text-white
  prose-pre:p-0 
  prose-pre:rounded-md 
  overflow-hidden`}
        >
          <div className="flex-shrink"> {/* Add a flex container for content and copy button */}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code: (props: CustomCodeComponentProps) => {
                  // Explicitly type props
                  const { node, inline, className, children, ...rest } = props;

                // Convert children to string for CodeBlock's value prop.
                // String(children) works because ReactNodeArray stringifies by concatenation.
                const value = String(children).replace(/\n$/, "");
                const match = /language-(\w+)/.exec(className || "");

                if (!inline && match) {
                  return (
                    <CodeBlock
                      language={match[1]}
                      value={value}
                      {...rest} // Pass remaining props
                    />
                  );
                }
                if (!inline) {
                  // For code blocks without explicit language
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
                  <code
                    className={`${
                      className || ""
                    } bg-neutral-700 text-sm text-emerald-300 px-1 py-0.5 rounded`}
                    {...rest}
                  >
                    {children}
                  </code>
                );
              },
              // For p, ul, ol, a, the existing ({node, ...props}) syntax is generally fine
              // if 'node' is not strictly typed or used in complex ways.
              // The errors were specific to ReactMarkdown's top-level props and the 'code' component's 'inline' prop.
              p: ({ node, ...props }) => (
                <p className="mb-2 last:mb-0" {...props} />
              ),
              ul: ({ node, ...props }) => <ul {...props} />,
              ol: ({ node, ...props }) => <ol {...props} />,
              a: ({ node, ...props }) => (
                <a
                  className="text-blue-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                />
              ),
            }}
          >
            {content + (isStreaming ? "▍" : "")}
          </ReactMarkdown>
          <button
             onClick={handleCopy}
             className="flex-shrink-0 p-1.5 hover:bg-neutral-700 rounded-lg transition-colors ml-2" // Add margin-left for spacing
             aria-label={isCopied ? 'Copied!' : 'Copy message'}
             title={isCopied ? 'Copied!' : 'Copy message'}
           >
             {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5 text-neutral-400" />}
           </button>
          {!isUser && !isStreaming && (
            <button
              aria-label="Listen to response"
              onClick={handleSpeak}
              disabled={isStreaming}
              className="flex-shrink-0 p-1.5 hover:bg-neutral-700 rounded-lg transition-colors ml-2" // Add margin-left for spacing
              title="Listen to response"
            >
                       {isPlaying ? (
              <SpeakerWaveIcon className="w-5 h-5 text-green-500 animate-pulse" />
            ) : (
              <SpeakerXMarkIcon className="w-5 h-5 text-neutral-400" />
            )}
            </button>
          )}
        </div> {/* Closing tag for the flex container */}
</div> {/* Closing tag for the prose styles div */}
      </div>
    </div>
  );
};

export default ChatMessage;
