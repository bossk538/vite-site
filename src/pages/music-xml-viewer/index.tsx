import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

export default function MusicXMLViewer() {
  const containerRef = useRef(null);
  const osmdRef = useRef(null);
  const [xmlData, setXmlData] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState('');

  // Handle file upload and read as text string
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError('');
    setIsLoaded(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      setXmlData(e.target.result);
    };
    reader.onerror = () => {
      setError('Error reading file.');
    };
    reader.readAsText(file);
  };

  // Initialize OSMD and re-render when data updates
  useEffect(() => {
    if (!containerRef.current || !xmlData) return;

    // Create instance if it doesn't exist
    if (!osmdRef.current) {
      osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
        autoResize: true,
        backend: 'svg', // Can be 'svg' or 'canvas'
        drawTitle: true,
      });
    }

    const loadAndRender = async () => {
      try {
        await osmdRef.current.load(xmlData);
        osmdRef.current.render();
        setIsLoaded(true);
      } catch (err) {
        console.error('OSMD Error:', err);
        setError('Failed to render MusicXML file. Ensure it is a valid format.');
      }
    };

    loadAndRender();

    // Cleanup on unmount
    return () => {
      if (osmdRef.current && containerRef.current) {
        containerRef.current.innerHTML = '';
        osmdRef.current = null;
      }
    };
  }, [xmlData]);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px dashed #ccc', borderRadius: '4px' }}>
        <label htmlFor="musicxml-upload" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Upload .musicxml or .xml file:
        </label>
        <input
          id="musicxml-upload"
          type="file"
          accept=".musicxml,.xml"
          onChange={handleFileUpload}
        />
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px', fontWeight: 'bold' }}>
          {error}
        </div>
      )}

      {xmlData && !isLoaded && !error && (
        <div style={{ fontStyle: 'italic', marginBottom: '20px' }}>
          Rendering score...
        </div>
      )}

      {/* Sheet Music target container */}
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          backgroundColor: '#fff', 
          boxShadow: xmlData && isLoaded ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
          borderRadius: '4px',
          padding: xmlData && isLoaded ? '10px' : '0'
        }} 
      />
    </div>
  );
}

