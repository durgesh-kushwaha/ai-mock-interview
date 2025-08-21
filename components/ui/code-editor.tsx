"use client";

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

const languageThemes: Record<string, string> = {
  javascript: 'text-yellow-400',
  typescript: 'text-blue-400',
  python: 'text-green-400',
  java: 'text-red-400',
  html: 'text-orange-400',
  css: 'text-purple-400',
  default: 'text-gray-300'
};

const syntaxHighlighting: Record<string, RegExp[]> = {
  javascript: [
    /\b(function|const|let|var|return|if|else|for|while|class|export|import|from)\b/g,
    /\b(true|false|null|undefined)\b/g,
    /(["'`])(?:(?=(\\?))\2.)*?\1/g,
    /\/\/.*$/gm,
    /\/\*[\s\S]*?\*\//gm,
    /\b(\d+)\b/g,
  ],
  typescript: [
    /\b(function|const|let|var|return|if|else|for|while|class|interface|type|export|import|from)\b/g,
    /\b(true|false|null|undefined)\b/g,
    /(["'`])(?:(?=(\\?))\2.)*?\1/g,
    /\/\/.*$/gm,
    /\/\*[\s\S]*?\*\//gm,
    /\b(\d+)\b/g,
  ],
  python: [
    /\b(def|class|return|if|else|elif|for|while|import|from|as|True|False|None)\b/g,
    /(["'`])(?:(?=(\\?))\2.)*?\1/g,
    /#.*$/gm,
    /\b(\d+)\b/g,
  ],
  java: [
    /\b(public|private|protected|class|interface|void|static|final|return|if|else|for|while|import|package)\b/g,
    /\b(true|false|null)\b/g,
    /(["'`])(?:(?=(\\?))\2.)*?\1/g,
    /\/\/.*$/gm,
    /\/\*[\s\S]*?\*\//gm,
    /\b(\d+)\b/g,
  ],
};

const applySyntaxHighlighting = (code: string, language: string): string => {
  if (!syntaxHighlighting[language]) return code;
  
  let highlighted = code;
  const rules = syntaxHighlighting[language];
  
  rules.forEach((rule, index) => {
    highlighted = highlighted.replace(rule, match => {
      const colors = [
        'text-blue-400',    // keywords
        'text-purple-400',  // booleans/null
        'text-green-400',   // strings
        'text-gray-400',    // comments
        'text-gray-400',    // multi-line comments
        'text-yellow-400',  // numbers
      ];
      return `<span class="${colors[index]}">${match}</span>`;
    });
  });
  
  return highlighted;
};

export function CodeEditor({ 
  value, 
  onChange = () => {}, 
  language = 'javascript', 
  placeholder = "Write your code here...",
  className = "",
  readOnly = false
}: CodeEditorProps) {
  const [isFocused, setIsFocused] = useState(false);

  const themeClass = languageThemes[language] || languageThemes.default;

  return (
    <div className={`relative border border-gray-700 rounded-lg overflow-hidden bg-gray-900 ${className}`}>
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-sm font-mono text-gray-400">
          {language.toUpperCase()}
        </span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
      </div>
      
      {readOnly ? (
        <div 
          className="w-full h-64 p-4 font-mono text-sm overflow-auto bg-gray-900 text-gray-300"
          style={{
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            lineHeight: '1.5',
            whiteSpace: 'pre-wrap'
          }}
          dangerouslySetInnerHTML={{ __html: applySyntaxHighlighting(value, language) }}
        />
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`
            w-full h-64 p-4 font-mono text-sm resize-none
            border-0 focus:ring-0 focus:outline-none
            ${themeClass}
            bg-gray-900 text-gray-300 placeholder-gray-600
          `}
          style={{
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            lineHeight: '1.5',
            tabSize: 2
          }}
        />
      )}
      
      {isFocused && !readOnly && (
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">
          {value.split('\n').length} lines
        </div>
      )}
    </div>
  );
}
