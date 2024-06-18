import { VertexAI } from "@google-cloud/vertexai"

// Initialize Vertex with your Cloud project and location
const vertex_ai = new VertexAI({
  project: "causal-sky-426707-u3",
  location: "us-central1",
})
const model = "gemini-1.5-flash-001"

// Instantiate the models
const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: model,
  generationConfig: {
    maxOutputTokens: 8192,
    temperature: 1,
    topP: 0.95,
  },
  safetySettings: [
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
  ],
})

export async function generateContent(descriptionObject) {
  const req = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Сделай мне небольшое привлекательное описание объекта недвижимости
             для клиента в 1-2-х абзацах на русском языке,
             исходя из следующих полей объекта формата JSON:
             ${descriptionObject}`,
          },
        ],
      },
    ],
  }

  const streamingResp = await generativeModel.generateContentStream(req)
  let answer = ""

  for await (const item of streamingResp.stream) {
    const response = item.candidates[0].content.parts[0].text
    answer += response.replace(/[*|\n]/g, "")
  }

  return answer
  //  let finalResponse;
  //  if (streamingResp.response.candidates && streamingResp.response.candidates.length > 0) {
  //    finalResponse = streamingResp.response.candidates[0].content.parts[0].text;
  //  } else {
  //    finalResponse = "No response generated.";  // Default message
  //  }

  //  process.stdout.write('Final response: ' + finalResponse + '\n');
}
