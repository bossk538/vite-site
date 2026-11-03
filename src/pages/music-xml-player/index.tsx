import React, { useState, useEffect, useRef } from 'react';
import { OpenSheetMusicDisplay as OSMD } from 'opensheetmusicdisplay';
import AudioPlayer from 'osmd-audio-player';

export default function MusicXMLPlayer() {
  const [musicXmlData, setMusicXmlData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  
  const divRef = useRef(null);
  const osmdRef = useRef(null);
  const playerRef = useRef(null);

  // 1. Initialize OSMD and Audio Player once on mount
  useEffect(() => {
    if (divRef.current && !osmdRef.current) {
      osmdRef.current = new OSMD(divRef.current, {
        autoResize: true,
        drawingParameters: "default"
      });
      
      playerRef.current = new AudioPlayer();
      
      // Sync player events to toggle play state if audio ends naturally
      playerRef.current.on('end', () => setIsPlaying(false));
    }

    // Cleanup audio player when component unmounts
    return () => {
      if (playerRef.current) {
        playerRef.current.stop();
      }
    };
  }, []);

  // 2. Load and render new MusicXML files into both the visual and audio engines
  useEffect(() => {
    if (musicXmlData && osmdRef.current && playerRef.current) {
      setIsPlayerReady(false);
      setIsPlaying(false);
      
      // Visual load
      osmdRef.current.load(musicXmlData)
        .then(() => {
          osmdRef.current.render();
          osmdRef.current.cursor.show();
          
          // Audio load (Attaches the visual score instance to the synthesizer)
          return playerRef.current.loadScore(osmdRef.current);
        })
        .then(() => {
          setIsPlayerReady(true);
        })
        .catch((err) => console.error("Error loading file:", err));
    }
  }, [musicXmlData]);

  // 3. File Upload Handler
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setMusicXmlData(e.target.result);
    };
    reader.readAsText(file);
  };

  // 4. Play/Pause Controller
  const handlePlayPause = async () => {
    if (!isPlayerReady || !playerRef.current) return;

    // Resumes Web Audio context security policies in modern browsers
    if (playerRef.current.context && playerRef.current.context.state === 'suspended') {
      await playerRef.current.context.resume();
    }

    if (isPlaying) {
      playerRef.current.pause();
      setIsPlaying(false);
    } else {
      playerRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h2>MusicXML Sheet Music Viewer & Audio Player</h2>

      {/* Upload controls */}
      <div style={{ marginBottom: '15px' }}>
        <input
          type="file"
          accept=".musicxml,.xml"
          onChange={handleFileUpload}
        />
        {fileName && <p>Loaded: <strong>{fileName}</strong></p>}
      </div>

      {/* Audio controls */}
      {musicXmlData && (
        <div style={{ marginBottom: '15px' }}>
          <button
            onClick={handlePlayPause}
            disabled={!isPlayerReady}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              cursor: isPlayerReady ? 'pointer' : 'not-allowed',
              backgroundColor: !isPlayerReady ? '#ccc' : isPlaying ? '#ff4d4d' : '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}
          >
            {!isPlayerReady ? 'Loading Synthesizer...' : isPlaying ? 'Pause' : 'Play Audio'}
          </button>
        </div>
      )}

      {/* Visual Canvas Target */}
      <div
        ref={divRef}
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          minHeight: '400px',
          backgroundColor: '#fff',
          overflowX: 'auto'
        }}
      />
    </div>
  );
}

