const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const apiKey = formData.get("apiKey") as string;

    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: "Audio file is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Get API key from request or environment
    // Client passes it from their .env file since edge functions can't access VITE_ vars
    const abacusApiKey = apiKey ||
                         Deno.env.get("ABACUS_AI_API_KEY") ||
                         Deno.env.get("ABACUS_API_KEY");

    console.log("API key source:", apiKey ? "from request" : "from environment");
    console.log("API key available:", !!abacusApiKey);

    if (!abacusApiKey) {
      console.error("Abacus AI API key not found");
      return new Response(
        JSON.stringify({
          error: "Abacus AI API key not configured",
          hint: "API key must be passed in request or set in environment"
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("Abacus AI API key found, proceeding with transcription");

    console.log("Transcribing audio file:", audioFile.name, "Size:", audioFile.size);

    const transcriptionFormData = new FormData();
    transcriptionFormData.append("file", audioFile);

    const abacusResponse = await fetch(
      "https://api.abacus.ai/api/v0/audioToText",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${abacusApiKey}`,
        },
        body: transcriptionFormData,
      }
    );

    if (!abacusResponse.ok) {
      const errorText = await abacusResponse.text();
      console.error("Abacus AI API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to transcribe audio", details: errorText }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const transcriptionData = await abacusResponse.json();
    console.log("Transcription successful");

    return new Response(
      JSON.stringify({
        transcript: transcriptionData.text || transcriptionData.transcription || "",
        success: true,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in transcribe-audio function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});