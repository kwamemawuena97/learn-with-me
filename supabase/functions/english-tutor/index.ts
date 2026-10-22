import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { buildTutorSystemPrompt, parseTutorReply, tutorLevelFromXp, tutorLevelName, type TutorTurn } from '../../../src/lib/tutor.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return jsonResponse({ error: 'Use a POST request.' }, 405)

  const authorization = request.headers.get('Authorization')
  const token = authorization?.replace(/^Bearer\s+/i, '')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const openAiKey = Deno.env.get('OPENAI_API_KEY')
  if (!supabaseUrl || !supabaseAnonKey || !openAiKey) {
    return jsonResponse({ error: 'The tutor service is not configured. Ask an administrator to finish setup.' }, 503)
  }
  if (!authorization || !token) return jsonResponse({ error: 'Sign in to use your English tutor.' }, 401)

  const learnerClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: userData, error: userError } = await learnerClient.auth.getUser(token)
  if (userError || !userData.user) return jsonResponse({ error: 'Your session has expired. Sign in again.' }, 401)

  let body: { message?: unknown; history?: unknown }
  try {
    body = await request.json()
  } catch {
    return jsonResponse({ error: 'Send a valid JSON request.' }, 400)
  }
  if (typeof body.message !== 'string' || !body.message.trim() || body.message.length > 1000) {
    return jsonResponse({ error: 'Your message must contain 1 to 1000 characters.' }, 400)
  }
  if (body.history !== undefined && !Array.isArray(body.history)) {
    return jsonResponse({ error: 'Conversation history must be a list.' }, 400)
  }

  const history = (Array.isArray(body.history) ? body.history : [])
    .slice(-8)
    .filter((turn): turn is TutorTurn =>
      Boolean(turn) &&
      typeof turn === 'object' &&
      ((turn as TutorTurn).role === 'user' || (turn as TutorTurn).role === 'assistant') &&
      typeof (turn as TutorTurn).content === 'string'
    )
    .map(turn => ({ role: turn.role, content: turn.content.slice(0, 1500) }))

  const { data: progressRow, error: progressError } = await learnerClient
    .from('learner_progress')
    .select('progress')
    .eq('user_id', userData.user.id)
    .maybeSingle()
  if (progressError) return jsonResponse({ error: 'Could not load your learner level.' }, 500)

  const savedXp = Number(progressRow?.progress?.xp ?? 0)
  const level = tutorLevelFromXp(Number.isFinite(savedXp) ? savedXp : 0)
  const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini',
      temperature: level === 1 ? 0.3 : 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildTutorSystemPrompt(level) },
        ...history,
        { role: 'user', content: body.message.trim() },
      ],
    }),
  })
  if (!openAiResponse.ok) return jsonResponse({ error: 'The tutor could not reply right now. Please try again.' }, 502)

  const completion = await openAiResponse.json()
  const content = completion.choices?.[0]?.message?.content
  if (typeof content !== 'string') return jsonResponse({ error: 'The tutor returned an empty response.' }, 502)
  try {
    return jsonResponse({ reply: parseTutorReply(content), level, levelName: tutorLevelName(level) })
  } catch {
    return jsonResponse({ error: 'The tutor response did not follow the required format. Please try again.' }, 502)
  }
})