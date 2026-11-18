import express from 'express';

const router = express.Router();

/**
 * POST /api/v1/ai/chat
 * Powers the Pulse-AI Health Concierge using Gemini Flash
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, biometricContext } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    const requestedModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message content required.' });
    }

    if (apiKey) {
      // Models to try in order of preference (using supported Google GenAI models)
      const modelsToTry = [
        'gemini-3.8-flash',
        'gemini-3.5-flash',
        'gemini-flash-latest',
        requestedModel,
      ].filter(Boolean);
      const uniqueModels = [...new Set(modelsToTry)];

      const systemPrompt = `You are Pulse-AI, an expert sports physician and biometric concierge for the OmniPulse fitness application.
Current User Telemetry Context:
- Age: ${biometricContext?.age || 22} yrs
- Weight: ${biometricContext?.weightKg || 68} kg
- Height: ${biometricContext?.heightCm || 175} cm
- Max HR: ${biometricContext?.maxHeartRate || 198} BPM
- Current BPM: ${biometricContext?.simulatedBpm || biometricContext?.currentBpm || 175} BPM
- Active Calories: ${biometricContext?.activeCalories || 233} kcal burned
- Current Exercise: ${biometricContext?.exerciseType || 'Gym HIIT'}
- Cardiac Strain (>85% Max HR): ${biometricContext?.isHighStrain ? 'YES - CRITICAL REDLINE STRAIN DETECTED' : 'NO - NORMAL CARDIO'}
- Required Hydration Replenishment: ${biometricContext?.hydrationNeededMl || 300} ml
Give a concise, scientifically accurate, and encouraging response (maximum 3-4 sentences).`;

      for (const model of uniqueModels) {
        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: AbortSignal.timeout(10000),
              body: JSON.stringify({
                contents: [
                  {
                    role: 'user',
                    parts: [
                      { text: systemPrompt },
                      { text: `User query: "${message}"` },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.3,
                  maxOutputTokens: 250,
                },
              }),
            }
          );

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidateText) {
              return res.status(200).json({
                success: true,
                reply: candidateText.trim(),
                source: model,
              });
            }
          } else {
            const errText = await geminiRes.text();
            console.warn(`[Gemini API HTTP ${geminiRes.status} on ${model}]:`, errText.slice(0, 300));
          }
        } catch (err) {
          console.warn(`[Gemini API Proxy Error on ${model}]:`, err.message);
        }
      }
    }

    // High-fidelity fallback response engine if offline
    const query = message.toLowerCase();
    const currentBpm = biometricContext?.simulatedBpm || biometricContext?.currentBpm || 175;
    const activeCalories = biometricContext?.activeCalories || 233;
    const hydrationNeededMl = biometricContext?.hydrationNeededMl || 280;

    let reply = `Based on your live session (${activeCalories} kcal burned at ${currentBpm} BPM), prioritize ${hydrationNeededMl}ml of electrolyte water and maintain a steady recovery pace.`;

    if (query.includes('meal') || query.includes('food') || query.includes('diet') || query.includes('eat')) {
      reply = `Post-workout protocol: Consume 25g fast-digesting protein and 40g complex carbs within 45 minutes to recharge muscle glycogen and accelerate tissue repair. Replenish ${hydrationNeededMl}ml of fluids.`;
    } else if (query.includes('heart') || query.includes('safe') || query.includes('strain') || query.includes('bpm')) {
      reply = biometricContext?.isHighStrain
        ? `Warning: Your heart rate at ${currentBpm} BPM exceeds 85% of your safe cardiac threshold. Drop cadence immediately and transition to nasal diaphragmatic breathing.`
        : `Your heart rate at ${currentBpm} BPM is operating safely within your aerobic target zone. Good cardiovascular endurance pacing!`;
    } else if (query.includes('hostel') || query.includes('room') || query.includes('workout')) {
      reply = `Hostel HIIT Circuit: 4 rounds of 45s tempo bodyweight squats, 45s shadowboxing, 45s mountain climbers, and 45s plank hold with 30s rest. No equipment needed!`;
    }

    return res.status(200).json({
      success: true,
      reply,
      source: 'local-biometric-engine',
    });
  } catch (error) {
    console.error('[AI Chat Route Error]:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
