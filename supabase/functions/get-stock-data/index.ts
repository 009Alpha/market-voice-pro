import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const EXA_API_KEY = "708e6367-2375-404e-b4fb-c31dbd95f1f0"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, language } = await req.json()

    // Search for real-time stock information using EXA API
    const exaResponse = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': EXA_API_KEY,
      },
      body: JSON.stringify({
        query: `${query} stock price latest market data financial news`,
        type: 'neural',
        useAutoprompt: true,
        numResults: 5,
        contents: {
          text: true,
          highlights: true,
        },
        category: 'financial',
        startPublishedDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
      }),
    })

    if (!exaResponse.ok) {
      throw new Error(`EXA API error: ${exaResponse.status}`)
    }

    const stockData = await exaResponse.json()

    // Extract relevant stock information
    const stockInfo = stockData.results?.map((result: any) => ({
      title: result.title,
      url: result.url,
      snippet: result.text?.substring(0, 200) + '...',
      highlights: result.highlights,
      publishedDate: result.publishedDate,
    })) || []

    // Compile context for AI response
    const context = stockInfo.map((info: any) => 
      `Title: ${info.title}\nContent: ${info.snippet}\nDate: ${info.publishedDate}`
    ).join('\n\n')

    return new Response(
      JSON.stringify({ 
        success: true, 
        stockData: stockInfo,
        context: context,
        query: query 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in get-stock-data function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    )
  }
})