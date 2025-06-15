
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const googleApiKey = Deno.env.get('GOOGLE_TRANSLATE_API_KEY');
const translateApiUrl = `https://translation.googleapis.com/language/translate/v2`;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, targetLang } = await req.json();

    if (!text || !targetLang) {
      throw new Error('Missing required parameters: text and targetLang');
    }
    
    if (!googleApiKey) {
      throw new Error('Google Translate API key is not configured.');
    }

    const response = await fetch(`${translateApiUrl}?key=${googleApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        target: targetLang,
        format: 'text',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Translate API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to translate text');
    }

    const result = await response.json();
    // Google Translate API can return HTML entities, so we decode them.
    const decodedText = result.data.translations[0].translatedText
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
      
    return new Response(
      JSON.stringify({ translatedText: decodedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in translate-text function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
