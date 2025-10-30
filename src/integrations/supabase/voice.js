// src/integrations/voice.js
export async function startVoiceConversation(onTextCallback) {
  // Microphone permission
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);

  // Voice recognition (Web Speech API)
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US'; // ya 'hi-IN' agar Hindi chahiye
  recognition.continuous = true;

  recognition.onresult = (event) => {
    const text = event.results[event.results.length - 1][0].transcript;
    onTextCallback(text);
  };

  recognition.start();
  console.log("🎤 Voice listening started...");
}

// Text-to-Speech (AI ka reply bolne ke liye)
export function speakText(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = 'en-US'; // ya 'hi-IN'
  window.speechSynthesis.speak(speech);
}