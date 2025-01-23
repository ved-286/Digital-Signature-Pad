import React from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { useState,useRef,useEffect } from 'react'
import jsPDF from 'jspdf'

function SignaturePad() {

    
        const signatureRef = useRef(null);
        const [signature, setSignature] = useState(null);
        const [history, setHistory] = useState([]);
        const [currentStep, setCurrentStep] = useState(-1);


        const saveCanvasState = () => {
          if (signatureRef.current) {
            const canvas = signatureRef.current.getCanvas();
            const newState = canvas.toDataURL();
            
            // Trim history if we're not at the latest step
            const trimmedHistory = history.slice(0, currentStep + 1);
            
            setHistory([...trimmedHistory, newState]);
            setCurrentStep(trimmedHistory.length);
          }
        };

        const undo = () => {
          if (currentStep > 0) {
            const prevState = history[currentStep - 1];
            const canvas = signatureRef.current.getCanvas();
            const ctx = canvas.getContext('2d');
            
            const img = new Image();
            img.onload = () => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);
              signatureRef.current.fromDataURL(prevState);
              setCurrentStep(currentStep - 1);
            };
            img.src = prevState;
          }
        };

        const redo = () => {
          if (currentStep < history.length - 1) {
            const nextState = history[currentStep + 1];
            const canvas = signatureRef.current.getCanvas();
            const ctx = canvas.getContext('2d');
            
            const img = new Image();
            img.onload = () => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);
              signatureRef.current.fromDataURL(nextState);
              setCurrentStep(currentStep + 1);
            };
            img.src = nextState;
          }
        };

        useEffect(() => {
          saveCanvasState();
        }, []);
      
        // Save state after each drawing
        const handleDrawEnd = () => {
          saveCanvasState();
        };

        const clearSignature = () => {
          if (signatureRef.current) {
            signatureRef.current.clear();
            setHistory([]);
            setCurrentStep(-1);
            saveCanvasState();
          }
        };

        // Advanced PDF Download with Better Quality
  const downloadPDF = () => {
    if (!signatureRef.current) return;

    // Get canvas as high-quality image
    const canvas = signatureRef.current.getCanvas();
    const imageData = canvas.toDataURL('image/png');

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    // Add image to PDF with original canvas dimensions
    pdf.addImage(
      imageData, 
      'PNG', 
      0, 
      0, 
      canvas.width, 
      canvas.height
    );

    // Save PDF
    pdf.save('signature.pdf');
  };
  const saveSignature = () => {
    if (signatureRef.current) {
      const imageData = signatureRef.current.toDataURL('image/png');
      setSignature(imageData);
    }
  };
    

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center p-6">
    <div className="bg-gray-200 shadow-2xl rounded-xl p-6 w-full max-w-2xl">
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
        Digital Signature Pad
      </h1>
      
      <div className="border-4 border-signature-border rounded-lg mb-6">
        <SignatureCanvas
         ref ={signatureRef}
          canvasProps={{
            className: 'w-full h-80 bg-signature-bg',
          }}
          penColor="red"
          onEnd={handleDrawEnd}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          onClick={clearSignature}
          className="bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
        >
          Reset
        </button>
        <button 
          onClick={saveSignature}
          className="bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
        >
          Save
        </button>
        <button 
          onClick={undo}
          className="bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition"
        >
          Undo
        </button>
        <button 
            onClick={redo}
            disabled={currentStep >= history.length - 1}
            className={`
              ${currentStep >= history.length - 1 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
              } 
              text-white py-2 rounded-lg transition
            `}
          >
            Redo
          </button>
        <button 
          onClick={downloadPDF}
          className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Download PDF
        </button>
      </div>

      {signature && (
          <div className="mt-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            <img 
              src={signature} 
              alt="Signature" 
              className="mx-auto max-w-full h-40 object-contain border rounded"
            />
          </div>
        )}
    </div>
  </div>
  )
}

export default SignaturePad