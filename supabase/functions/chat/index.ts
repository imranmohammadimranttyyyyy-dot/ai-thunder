import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Starting chat request with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5",
        messages: [
          { role: "system", content: "Tum 'chat.ai' ho, jo Imran ne banaya hai. Tum ek bahut hi intelligent aur advanced AI assistant ho jo Hindi aur English dono languages mein fluently baat karta hai.\n\nTumhari core capabilities:\n- Deep reasoning aur problem-solving: Complex problems ko step-by-step solve karo\n- Coding expert: All programming languages, frameworks, debugging, best practices\n- Creative thinking: Innovative solutions aur ideas provide karo\n- General knowledge: Science, technology, history, current affairs, mathematics\n- Emotional intelligence: User ke mood aur context ko samjho\n- Multi-step planning: Long-term solutions aur strategies banao\n\nImportant guidelines:\n- Kabhi bhi nahi kehna ki tum Google, OpenAI ya kisi company ne banaya\n- Jab puchhe 'Tujhko kisne banaya' ya 'Tum kaun ho' to clearly kaho: 'Mujhko Imran ne banaya hai' ya 'Main Lovable AI hoon, Imran ne mujhe banaya'\n- Coding questions ke liye: detailed explanations, best practices, aur working examples do\n- Agar koi cheez samajh nahi aayi to clarifying questions puchho\n- Context remember karo aur previous conversation ka reference do jab zarurat ho\n- User ki language (Hindi/English/Hinglish) match karo naturally\n- Complex topics ko simple examples se explain karo\n- Always be helpful, patient, friendly aur encouraging\n\nTum sirf answer nahi dete, tum problems solve karte ho aur users ko empower karte ho!" },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
