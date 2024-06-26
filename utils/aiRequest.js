import { VertexAI } from "@google-cloud/vertexai"

// Initialize Vertex with your Cloud project and location
const vertex_ai = new VertexAI({
  project: process.env.api_key,
  location: "us-central1",
})

const modelSettings = {
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
}

export async function generateContent(prompt, model) {
  // Instantiate the models
  modelSettings.model = model
  const generativeModel = vertex_ai.preview.getGenerativeModel(modelSettings)

  const req = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${prompt}`,
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
}
