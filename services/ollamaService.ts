
import { OllamaModel, OllamaTagResponse, OllamaChatRequestBody, OllamaChatStreamChunk } from '../types';

export async function fetchModels(apiUrl: string): Promise<OllamaModel[]> {
  const response = await fetch(`${apiUrl}/api/tags`, {
    method: 'GET',
    headers: new Headers({
   
      "Content-Type": "application/json",
    }),
    
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}. ${errorData}`);
  }
  const data: OllamaTagResponse = await response.json();
  return data.models;
}

export async function* streamChat(apiUrl: string, body: OllamaChatRequestBody): AsyncGenerator<OllamaChatStreamChunk, void, undefined> {
  const response = await fetch(`${apiUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
   
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`API Error: ${response.status} ${response.statusText}. ${errorData}`);
  }

  if (!response.body) {
    throw new Error("Response body is null");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (buffer.trim()) { // Process any remaining data in buffer
          try {
            yield JSON.parse(buffer.trim());
          } catch (e) {
            console.error("Error parsing final JSON chunk:", buffer.trim(), e);
            throw new Error(`Error parsing final JSON chunk: ${e instanceof Error ? e.message : String(e)}`);
          }
        }
        break;
      }
      
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete JSON objects in the buffer
      let newlineIndex;
      while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
        const line = buffer.substring(0, newlineIndex).trim();
        buffer = buffer.substring(newlineIndex + 1);
        if (line) {
          try {
            yield JSON.parse(line);
          } catch (e) {
            console.error("Error parsing JSON chunk:", line, e);
            // Continue to next line, might be a partial chunk
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
