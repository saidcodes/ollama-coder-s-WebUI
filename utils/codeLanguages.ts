
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import html from 'react-syntax-highlighter/dist/esm/languages/prism/markup';

// Language mapping for normalization
const languageMap: Record<string, string> = {
  js: 'javascript',
  javascript: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  typescript: 'typescript',
  py: 'python',
  python: 'python',
  html: 'html',
  htm: 'html',
  markup: 'html'
};

export const normalizeLanguage = (language: string): string => {
  const normalized = language?.toLowerCase() || 'text';
  return languageMap[normalized] || normalized;
};

export const registerLanguages = (SyntaxHighlighter: any): void => {
  SyntaxHighlighter.registerLanguage('jsx', jsx);
  SyntaxHighlighter.registerLanguage('javascript', javascript);
  SyntaxHighlighter.registerLanguage('typescript', typescript);
  SyntaxHighlighter.registerLanguage('python', python);
  SyntaxHighlighter.registerLanguage('html', html);
};