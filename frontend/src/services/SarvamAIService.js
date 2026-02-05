/**
 * Sarvam AI Service
 * Translates Hindi slangs/casual language into professional corporate communication
 */

const SARVAM_API_KEY = process.env.REACT_APP_SARVAM_API_KEY;
const SARVAM_API_URL = 'https://api.sarvam.ai/v1/chat/completions';

// Tone configurations
const TONES = {
  formal: {
    label: 'Formal',
    emoji: '🎩',
    description: 'Highly professional, suitable for senior management and official communications'
  },
  friendly: {
    label: 'Friendly',
    emoji: '😊',
    description: 'Warm and approachable while maintaining professionalism'
  },
  assertive: {
    label: 'Assertive',
    emoji: '💪',
    description: 'Confident and direct, good for making strong points'
  }
};

// Channel-specific formatting instructions
const CHANNEL_FORMATS = {
  email: {
    label: 'Email',
    instructions: `Format as a professional email with:
- Appropriate greeting (Dear/Hi based on tone)
- Clear subject line suggestion
- Well-structured body with paragraphs
- Professional sign-off`
  },
  linkedin: {
    label: 'LinkedIn Post',
    instructions: `Format as an engaging LinkedIn post with:
- Hook in the first line to grab attention
- Use line breaks for readability
- Include relevant emojis sparingly
- Add a call-to-action at the end
- Suggest 3-5 relevant hashtags`
  },
  whatsapp: {
    label: 'WhatsApp',
    instructions: `Format as a professional WhatsApp message:
- Keep it concise and to the point
- Use appropriate emojis
- Break into short paragraphs
- Maintain professional yet approachable tone`
  }
};

/**
 * Build the system prompt for Hindi slang translation
 */
function buildSystemPrompt(tone, channel) {
  const toneConfig = TONES[tone] || TONES.formal;
  const channelConfig = CHANNEL_FORMATS[channel] || CHANNEL_FORMATS.email;

  return `You are a language transformation expert specializing in converting Hindi slangs, Hinglish, and casual Indian expressions into polished corporate communication.

Your task is to:
1. Understand the intent and meaning behind Hindi slangs and casual expressions
2. Transform them into professional ${toneConfig.label.toLowerCase()} language
3. Maintain the original message's core meaning and emotion
4. Make it suitable for ${channelConfig.label} communication

TONE: ${toneConfig.label} - ${toneConfig.description}

OUTPUT FORMAT:
${channelConfig.instructions}

IMPORTANT RULES:
- Preserve the speaker's intent and key points
- Remove any inappropriate or unprofessional language
- If the input contains Hindi/Hinglish, translate to English while keeping the meaning
- Make the output sound natural, not robotic
- Adapt formality level based on the tone selected

Common Hindi slangs to understand:
- "yaar" = friend/buddy (context: casual address)
- "boss ko chutiya banana" = deceiving the boss (rephrase professionally)
- "jugaad" = creative workaround/innovation
- "bakchodi" = nonsense/time waste (rephrase as unproductive)
- "fundae" = fundamentals/concepts
- "jhakaas" = excellent/awesome
- "mast" = great/cool
- "kya scene hai" = what's the situation
- "set hai" = it's sorted/arranged
- And many more...

Always output ONLY the transformed professional text, no explanations.`;
}

/**
 * Translate Hindi slang to corporate language
 * @param {string} inputText - The casual/slang Hindi text to translate
 * @param {string} tone - The tone to use (formal, friendly, assertive)
 * @param {string} channel - The output channel (email, linkedin, whatsapp)
 * @returns {Promise<{success: boolean, result?: string, error?: string}>}
 */
export async function translateToCorporate(inputText, tone = 'formal', channel = 'email') {
  if (!inputText?.trim()) {
    return { success: false, error: 'Please enter some text to translate' };
  }

  try {
    const response = await fetch(SARVAM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': SARVAM_API_KEY
      },
      body: JSON.stringify({
        model: 'sarvam-m',
        messages: [
          {
            role: 'system',
            content: buildSystemPrompt(tone, channel)
          },
          {
            role: 'user',
            content: `Transform this into professional ${channel} content:\n\n"${inputText}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;

    if (!result) {
      throw new Error('No response received from AI');
    }

    return { success: true, result: result.trim() };

  } catch (error) {
    console.error('Sarvam AI Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to translate. Please try again.'
    };
  }
}

/**
 * Get available tones
 */
export function getTones() {
  return TONES;
}

/**
 * Get available channels
 */
export function getChannels() {
  return CHANNEL_FORMATS;
}

/**
 * Speech to Text using Sarvam AI
 * @param {Blob} audioBlob - The audio blob to transcribe
 * @returns {Promise<{success: boolean, transcript?: string, error?: string}>}
 */
export async function speechToText(audioBlob) {
  if (!audioBlob) {
    return { success: false, error: 'No audio provided' };
  }

  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', 'saarika:v2');
    formData.append('language_code', 'hi-IN');

    const response = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'api-subscription-key': SARVAM_API_KEY
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `STT API failed with status ${response.status}`);
    }

    const data = await response.json();
    const transcript = data.transcript;

    if (!transcript) {
      throw new Error('No transcript received');
    }

    return { success: true, transcript: transcript.trim() };

  } catch (error) {
    console.error('Sarvam STT Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to transcribe audio. Please try again.'
    };
  }
}

export default {
  translateToCorporate,
  getTones,
  getChannels,
  speechToText
};
