/**
 * Extracts a JSON object from a Claude response that may contain markdown
 * code fences (```json ... ```) or plain text with extra whitespace.
 */
export function extractJson<T>(text: string): T {
  const trimmed = text.trim();

  // Strip ```json ... ``` or ``` ... ``` fences
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = fenced ? fenced[1].trim() : trimmed;

  try {
    return JSON.parse(jsonText) as T;
  } catch {
    // Last resort: find the first { ... } block
    const start = jsonText.indexOf('{');
    const end = jsonText.lastIndexOf('}');
    if (start !== -1 && end > start) {
      return JSON.parse(jsonText.slice(start, end + 1)) as T;
    }
    throw new Error(`Could not parse JSON from Claude response: ${text.slice(0, 200)}`);
  }
}
