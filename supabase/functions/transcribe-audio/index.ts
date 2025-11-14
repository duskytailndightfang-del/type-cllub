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

    const abacusApiKey = Deno.env.get("ABACUS_AI_API_KEY");
    if (!abacusApiKey) {
      return new Response(
        JSON.stringify({ error: "Abacus AI API key not configured" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

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
        JSON.stringify({ error: "Failed to transcribe audio" }),
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
      JSON.stringify({ error: "Internal server error" }),
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
