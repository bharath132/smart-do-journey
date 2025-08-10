// @ts-nocheck
import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    const { taskText } = await req.json()

    if (!taskText) {
      throw new Error('Task text is required')
    }

    const prompt = `You are a productivity assistant. Given a short task title, respond with a strict JSON object and nothing else:
{"priority":"high|medium|low","category":"one of: work, personal, shopping, other","description":"1-2 sentences expanding the title"}
Title: ${taskText}`

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: { temperature: 0.3, maxOutputTokens: 200 }
      })
    })

    if (!response.ok) {
      const errTxt = await response.text()
      throw new Error(`Gemini API error: ${response.status} ${errTxt}`)
    }

    const data = await response.json()
    const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('No content returned from Gemini')

    let result: { priority?: string; category?: string; description?: string } = {}
    try {
      result = JSON.parse(text)
    } catch (_) {
      const lower = text.toLowerCase()
      const validPriorities = ['high','medium','low']
      const p = validPriorities.find(v => lower.includes(v)) || 'medium'
      result = { priority: p, category: 'personal', description: taskText }
    }

    const validPriorities = ['high','medium','low']
    const priority = validPriorities.includes((result.priority||'').toLowerCase()) ? result.priority!.toLowerCase() : 'medium'
    const allowedCategories = ['work','personal','shopping','other']
    const category = allowedCategories.includes((result.category||'').toLowerCase()) ? result.category!.toLowerCase() : 'personal'
    const description = (result.description || taskText).slice(0, 500)

    return new Response(
      JSON.stringify({ priority, category, description }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})