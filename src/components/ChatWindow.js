import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ChatWindow.css';

const logo = process.env.PUBLIC_URL + '/images/logo.png';
const micIcon = process.env.PUBLIC_URL + '/images/mic-icon.png';
const stopIcon = process.env.PUBLIC_URL + '/images/stop-icon.png';
const speakerIcon = process.env.PUBLIC_URL + '/images/speaker-icon.png';

const ChatWindow = ({ currentUser, handleLogout }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [maxHeight, setMaxHeight] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [transcribedText, setTranscribedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const messagesContainerRef = useRef(null);

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);

        recorder.ondataavailable = event => {
          if (event.data.size > 0) {
            setRecordedAudio(event.data);
          }
        };

        recorder.start();
        setIsRecording(true);
      })
      .catch(error => {
        console.error('Error accessing media devices.', error);
      });
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const sendAudio = useCallback(async () => {
    if (recordedAudio) {
      setIsTranscribing(true); // Show transcribing message
      const formData = new FormData();
      formData.append('audio', recordedAudio, 'recording.mp3');

      try {
        const response = await fetch('http://localhost:5001/api/speech', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Log the response for debugging
        console.log('Transcribed text:', data.text, 'Length:', data.text.length);

        if (data.text) {
          setTranscribedText(data.text);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsTranscribing(false); // Hide transcribing message
      }
    }
  }, [recordedAudio]);

  useEffect(() => {
    if (transcribedText.trim() !== '') {
      // Populate the input field with transcribed text
      setNewMessage(transcribedText);
      setTranscribedText(''); // Clear transcribed text after setting it
    }
  }, [transcribedText]);

  useEffect(() => {
    if (recordedAudio) {
      console.log('Recorded audio is available, sending for transcription');
      sendAudio();
    }
  }, [recordedAudio, sendAudio]);

  const fetchData = async (message) => {
    if (message.trim() !== '') {
      setIsLoading(true);
      try {
        const requestBody = { message };
        const response = await fetch('http://localhost:5001/api/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Log the response for debugging
        console.log('Fetched response:', data);

        // Add the new message and response message
        setMessages(prevMessages => [
          ...prevMessages,
          { text: message, isSystem: false },
          { text: data.message, isSystem: true, audioUrl: data.audio_url }
        ]);
        setNewMessage('');
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const playAudio = (url) => {
    const audio = new Audio(url);
    audio.play();
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const adjustMaxHeight = useCallback(() => {
    const singleLineHeight = 30;
    const linesToShow = 6;
    const minimumHeight = singleLineHeight * 2;
    let totalLines = 0;
    messages.forEach(message => {
      totalLines += Math.ceil(message.text.length / 50);
    });

    setMaxHeight(Math.max(totalLines * singleLineHeight, minimumHeight, singleLineHeight * linesToShow));
  }, [messages]);

  const handleSubmit = () => {
    if (newMessage.trim()) {
      fetchData(newMessage);
    }
  };

  useEffect(() => {
    scrollToBottom();
    adjustMaxHeight();
  }, [messages, adjustMaxHeight]);

  return (
    <div className="container">
      <div className="center">
        <img src={logo} alt="Logo" className="logo" />
        <h1><span className="welcome-text">Welcome to Smile2Steps</span></h1>
      </div>
      <div className="strip">
        <div className="center faded-text">Empowering Parents, Enriching Childhood</div>
      </div>
      <div className="card-container">
        <div className="card" onClick={() => setNewMessage("Help me with baby's first food")}>Help me with baby's first food</div>
        <div className="card" onClick={() => setNewMessage("How to improve my child's sleep?")}>How to improve my child's sleep?</div>
        <div className="card" onClick={() => setNewMessage("What are fun activities for toddlers?")}>What are fun activities for toddlers?</div>
        <div className="card" onClick={() => setNewMessage("When should my baby start crawling?")}>When should my baby start crawling?</div>
      </div>
      {isLoading && (
        <div className="loading-message">Fetching your personalized response...</div>
      )}
      {isTranscribing && (
        <div className="transcribing-message">Processing your speech input...</div>
      )}
      {messages.length > 0 && (
        <div className="messages-container" style={{ maxHeight: `${maxHeight}px`, border: '1px solid #ccc' }} ref={messagesContainerRef}>
          {messages.map((message, index) => (
            <div key={index} className={message.isSystem ? 'system-message-container' : 'user-message-container'}>
              {message.isSystem && <img src={logo} alt="Logo" className="small-logo" />}
              <div className={message.isSystem ? 'system-message' : 'user-message'}>
                {message.text}
                {message.isSystem && message.audioUrl && (
                  <button onClick={() => playAudio(`https://appwithpostgre.onrender.com${message.audioUrl}`)} className="play-audio-button">
                    <img src={speakerIcon} alt="Play Audio" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="input-container">
        <input
          type="text"
          className="input-field"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyUp={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          placeholder="Ask a question..."
        />
        <button 
          className={`mic-btn ${isRecording ? 'recording' : ''}`} 
          onClick={() => {
            if (isRecording) {
              stopRecording();
            } else {
              startRecording();
            }
          }}
        >
          <img src={isRecording ? stopIcon : micIcon} alt={isRecording ? "Stop Recording" : "Start Recording"} />
        </button>
        <button className="input-btn" onClick={handleSubmit}>Enter</button>
      </div>
    </div>
  );
};

export default ChatWindow;
