import { useEffect, useState } from "react";

export default function PythonRunner({ initialCode }) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("Loading Python...");
  const [pyodideLoaded, setPyodideLoaded] = useState(false);
  const [pyodideInstance, setPyodideInstance] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    async function loadPyodideAndPackages() {
      if (!window.loadPyodide) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js";
        script.async = true;
        script.onload = async () => {
          const pyodide = await window.loadPyodide();
          await pyodide.loadPackage(["matplotlib", "io"]);
          setPyodideInstance(pyodide);
          setPyodideLoaded(true);
          setOutput("Pyodide loaded. Press 'Run Code' to execute.");
        };
        document.body.appendChild(script);
      } else {
        const pyodide = await window.loadPyodide();
        await pyodide.loadPackage(["matplotlib"]);
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
      // Reset image
      setImageSrc(null);

      // Capture stdout
      await pyodideInstance.runPythonAsync(`
import sys
import io
sys.stdout = io.StringIO()
      `);

      // Run user code
      await pyodideInstance.runPythonAsync(`
import matplotlib.pyplot as plt
import io
import base64

# Create the figure in memory
fig, ax = plt.subplots()
${code}
buf = io.BytesIO()
fig.savefig(buf, format='png')
buf.seek(0)
encoded = base64.b64encode(buf.read()).decode('utf-8')
plt.close(fig)
print(encoded)  # Output as base64
      `);

      // Retrieve base64-encoded image
      const encodedImage = pyodideInstance.runPython("sys.stdout.getvalue()").trim();
      setImageSrc(`data:image/png;base64,${encodedImage}`);
      setOutput("Plot generated successfully.");
    } catch (error) {
      setOutput("Error: " + error);
    }
  }

  return (
    <div>
      {/* Code Editor */}
      <textarea
        style={{
          width: "100%",
          height: "150px",
          fontFamily: "monospace",
          fontSize: "14px",
          padding: "8px",
          boxSizing: "border-box",
        }}
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      {/* Run Button */}
      <button
        onClick={runPython}
        disabled={!pyodideLoaded}
        style={{ marginTop: "10px", padding: "8px 16px" }}
      >
        Run Code
      </button>

      {/* Output Text */}
      <div style={{ marginTop: "10px", padding: "10px", background: "#f9f9f9", border: "1px solid #ccc" }}>
        <pre>{output}</pre>
      </div>

      {/* Display the Image */}
      {imageSrc && (
        <div style={{ marginTop: "10px", textAlign: "center" }}>
          <img src={imageSrc} alt="Generated Matplotlib Plot" style={{ maxWidth: "100%", border: "1px solid #ccc" }} />
        </div>
      )}
    </div>
  );
}
