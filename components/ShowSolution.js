import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism' // Use the CJS version

export default function ShowSolution({ solution }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ marginTop: 20 }}>
      <button
        onClick={() => setShow(!show)}
        style={{
          padding: '8px 16px',
          backgroundColor: '#007BFF',
          color: '#fff',
          border: 'none',
          borderRadius: 5,
          cursor: 'pointer',
        }}
      >
        {show ? 'Hide Solution' : 'Show Solution'}
      </button>
      {show && (
        <div
          style={{
            marginTop: 10,
            padding: 10,
            background: '#f9f9f9',
            border: '1px solid #ccc',
            borderRadius: 5,
            overflowX: 'auto',
          }}
        >
          <ReactMarkdown
            components={{
              code({ inline, className, children, ...props }) {
                return (
                  <SyntaxHighlighter language="python" style={vscDarkPlus} className="inline-code">
                    {String(children)}
                  </SyntaxHighlighter>
                ) 
              },
            }}
          >
            {solution}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}
