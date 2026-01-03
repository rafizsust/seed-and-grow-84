-- Backfill audio_url for existing AI practice listening tests that were created from presets
-- but have NULL audio_url (the bug we're fixing)

UPDATE ai_practice_tests apt
SET audio_url = gta.audio_url
FROM generated_test_audio gta
WHERE apt.module = 'listening'
  AND apt.audio_url IS NULL
  AND apt.payload->>'isPreset' = 'true'
  AND apt.payload->>'presetId' IS NOT NULL
  AND gta.id = (apt.payload->>'presetId')::uuid
  AND gta.audio_url IS NOT NULL;