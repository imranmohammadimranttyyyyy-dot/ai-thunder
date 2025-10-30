/* VoiceChat.tsx React + TypeScript single-file component to add voice conversation (mic input -> ASR -> assistant -> TTS) Tailwind-based UI. Default export React component.

Prerequisites (server side):

1. POST /api/transcribe

Accepts audio file (FormData key: "audio")

Returns JSON: { text: string }

Implementation idea: forward audio to Whisper/any ASR model



2. POST /api/respond

Accepts JSON { prompt: string }

Returns JSON: { reply: string, audioBase64?: string }

audioBase64 is optional: server can produce TTS (base64 of audio/mpeg)

Implementation idea: use your assistant LLM to generate reply and TTS (OpenAI TTS or other)




Behavior in this component:

Press and hold or toggle to record voice (uses MediaRecorder)

After recording stops, uploads audio to /api/transcribe

Shows transcribed text, sends it to /api/respond

Plays returned TTS audio if provided; otherwise uses browser SpeechSynthesis

Keeps a chat list (user utterances + assistant replies)


Notes:

This component assumes HTTPS (required for microphone in some browsers) and browser support for MediaRecorder and SpeechSynthesis.

On mobile browsers, behavior varies; test on Chrome/Android and Safari/iOS.


*/

import React, { useEffect, useRef, useState } from "react";

type ChatItem = { id: string; speaker: "user" | "assistant"; text?: string; audioUrl?: string; };

export default function VoiceChat() { const [isRecording, setIsRecording] = useState(false); const [permission, setPermission] = useState<boolean | null>(null); const [chat, setChat] = useState<ChatItem[]>([]); const mediaRecorderRef = useRef<MediaRecorder | null>(null); const recordedChunksRef = useRef<BlobPart[]>([]); const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

useEffect(() => { // Check microphone permission navigator.permissions?.query?.({ name: "microphone" as any }).then((p) => { setPermission(p.state === "granted"); p.onchange = () => setPermission(p.state === "granted"); }).catch(() => setPermission(null)); }, []);

const startRecording = async () => { try { const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); recordedChunksRef.current = []; const mr = new MediaRecorder(stream); mediaRecorderRef.current = mr;

mr.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
  };

  mr.onstop = async () => {
    const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
    await handleRecordedBlob(blob);
    // stop all tracks
    stream.getTracks().forEach((t) => t.stop());
  };

  mr.start();
  setIsRecording(true);
} catch (err) {
  console.error("Mic error", err);
  alert("Microphone access required. Please allow microphone.");
}

};

const stopRecording = () => { const mr = mediaRecorderRef.current; if (mr && mr.state !== "inactive") { mr.stop(); } setIsRecording(false); };

// Convert blob to file and send to /api/transcribe async function handleRecordedBlob(blob: Blob) { // Add user placeholder in chat const userId = Date.now().toString(); setChat((c) => [...c, { id: userId, speaker: "user", text: "(recording...)" }]);

const form = new FormData();
// Some servers prefer 'audio.webm' with type
form.append("audio", blob, "voice.webm");

try {
  const res = await fetch("/api/transcribe", { method: "POST", body: form });
  if (!res.ok) throw new Error("Transcribe failed");
  const data = await res.json();
  const text = data.text || "";

  // update user text with real transcription
  setChat((c) => c.map(item => item.id === userId ? { ...item, text } : item));

  // send to respond endpoint
  await sendToAssistant(text);
} catch (err) {
  console.error(err);
  setChat((c) => c.map(item => item.id === userId ? { ...item, text: "(transcription failed)" } : item));
}

}

async function sendToAssistant(prompt: string) { const assistantId = (Date.now() + 1).toString(); // optimistic assistant message setChat((c) => [...c, { id: assistantId, speaker: "assistant", text: "(thinking...)" }]);

try {
  const res = await fetch("/api/respond", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error("Respond failed");
  const data = await res.json();
  const reply: string = data.reply || "";

  // If server returns audio in base64, create blob URL and play
  if (data.audioBase64) {
    const audioBlob = base64ToBlob(data.audioBase64, "audio/mpeg");
    const url = URL.createObjectURL(audioBlob);
    setChat((c) => c.map(item => item.id === assistantId ? { ...item, text: reply, audioUrl: url } : item));
    playAudioUrl(url);
  } else {
    // update chat and use browser TTS fallback
    setChat((c) => c.map(item => item.id === assistantId ? { ...item, text: reply } : item));
    speakText(reply);
  }
} catch (err) {
  console.error(err);
  setChat((c) => c.map(item => item.id === assistantId ? { ...item, text: "(assistant failed)" } : item));
}

}

function base64ToBlob(base64: string, mime: string) { const byteChars = atob(base64); const byteNumbers = new Array(byteChars.length); for (let i = 0; i < byteChars.length; i++) { byteNumbers[i] = byteChars.charCodeAt(i); } const byteArray = new Uint8Array(byteNumbers); return new Blob([byteArray], { type: mime }); }

function playAudioUrl(url: string) { if (!audioPlayerRef.current) { audioPlayerRef.current = document.createElement("audio"); audioPlayerRef.current.controls = true; audioPlayerRef.current.style.display = "none"; document.body.appendChild(audioPlayerRef.current); } audioPlayerRef.current.src = url; audioPlayerRef.current.play().catch((e) => console.warn(e)); }

function speakText(text: string) { if (!("speechSynthesis" in window)) return; const utter = new SpeechSynthesisUtterance(text); // Optionally set voice, rate, pitch here window.speechSynthesis.cancel(); window.speechSynthesis.speak(utter); }

return ( <div className="max-w-xl mx-auto p-4"> <h2 className="text-xl font-semibold mb-3">Voice Chat (loveable.ai)</h2>

<div className="border rounded-lg p-3 mb-4 h-64 overflow-auto bg-white">
    {chat.length === 0 && <div className="text-sm text-gray-500">Koi conversation nahi — bolna shuru karein.</div>}
    {chat.map(item => (
      <div key={item.id} className={`mb-3 ${item.speaker === 'user' ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block p-2 rounded-2xl ${item.speaker === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
          <div className="text-sm whitespace-pre-wrap">{item.text}</div>
          {item.audioUrl && (
            <div>
              <audio controls src={item.audioUrl}></audio>
            </div>
          )}
        </div>
      </div>
    ))}
  </div>

  <div className="flex items-center gap-3">
    <button
      onPointerDown={startRecording}
      onPointerUp={stopRecording}
      onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
      onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
      className={`px-4 py-2 rounded-full shadow-sm ${isRecording ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'}`}>
      {isRecording ? 'Recording... (release to send)' : 'Hold to Talk'}
    </button>

    <button
      onClick={() => {
        // replay last assistant audio if exists
        const last = [...chat].reverse().find(c => c.speaker === 'assistant' && c.audioUrl);
        if (last?.audioUrl) playAudioUrl(last.audioUrl);
        else if (last?.text) speakText(last.text!);
      }}
      className="px-3 py-2 rounded bg-gray-200">
      Replay
    </button>

    <div className="ml-auto text-sm text-gray-600">Mic permission: {permission === null ? 'unknown' : permission ? 'granted' : 'denied'}</div>
  </div>

  <div className="mt-3 text-xs text-gray-500">
    Tip: Mobile par "Hold to Talk" use karen. Agar aap server pe khud TTS banate hain to /api/respond audioBase64 bheje.
  </div>
</div>

); }