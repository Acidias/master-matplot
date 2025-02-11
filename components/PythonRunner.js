"use client"; // Ensures this runs only in the browser

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import CodeMirror to prevent SSR issues
const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
});
import { python } from "@codemirror/lang-python";

export default function PythonRunner({ initialCode, height = "200px" }) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("Loading Python...");
  const [pyodideLoaded, setPyodideLoaded] = useState(false);
  const [pyodideInstance, setPyodideInstance] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    async function loadPyodideAndPackages() {
      if (typeof window === "undefined") return; // Prevents SSR errors

      if (!window.loadPyodide) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js";
        script.async = true;
        script.onload = async () => {
          const pyodide = await window.loadPyodide();
          await pyodide.loadPackage("matplotlib");
          setPyodideInstance(pyodide);
          setPyodideLoaded(true);
          setOutput("Pyodide loaded. Press 'Run Code' to execute.");
        };
        document.body.appendChild(script);
      } else {
        const pyodide = await window.loadPyodide();
        await pyodide.loadPackage("matplotlib");
        setPyodideInstance(pyodide);
        setPyodideLoaded(true);
        setOutput("Pyodide loaded. Press 'Run Code' to execute.");
      }
    }
    loadPyodideAndPackages();
  }, []);

  async function runPython() {
    if (!pyodideInstance) return;
    try {
      setImageSrc(null);

      await pyodideInstance.runPythonAsync(`
import sys
import io
sys.stdout = io.StringIO()
      `);

      await pyodideInstance.runPythonAsync(`
import matplotlib.pyplot as plt
import io
import base64

fig, ax = plt.subplots()
${code}

buf = io.BytesIO()
fig.savefig(buf, format='png', bbox_inches='tight')
buf.seek(0)
encoded = base64.b64encode(buf.read()).decode('utf-8')
plt.close(fig)
print(encoded)
      `);

      const encodedImage = pyodideInstance.runPython("sys.stdout.getvalue()").trim();
      setImageSrc(`data:image/png;base64,${encodedImage}`);
      setOutput("Plot generated successfully.");
    } catch (error) {
      setOutput("Error: " + error);
    }
  }

  return (
    <div>
      {/* CodeMirror for Python syntax highlighting */}
      <CodeMirror
        value={code}
        height={height}
        extensions={[python()]}
        theme="light"
        onChange={(value) => setCode(value)}
        style={{
          fontSize: "14px",
          border: "1px solid #ccc",
          borderRadius: "5px",
          padding: "10px",
          boxSizing: "border-box",
        }}
      />

      {/* Run Button */}
      <button
        onClick={runPython}
        disabled={!pyodideLoaded}
        style={{
          marginTop: "10px",
          padding: "8px 16px",
          cursor: "pointer",
          background: "#007BFF",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Run Code
      </button>

      {/* Output Text */}
      <div
        style={{
          marginTop: "10px",
          padding: "10px",
          background: "#f9f9f9",
          border: "1px solid #ccc",
          fontSize: "14px",
          borderRadius: "5px",
        }}
      >
        <pre>{output}</pre>
      </div>

      {/* Display the Image */}
      {imageSrc && (
        <div style={{ marginTop: "10px", textAlign: "center" }}>
          <img
            src={imageSrc}
            alt="Generated Matplotlib Plot"
            style={{ maxWidth: "100%", border: "1px solid #ccc" }}
          />
        </div>
      )}
    </div>
  );
}
