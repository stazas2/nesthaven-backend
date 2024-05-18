import fs from "fs/promises"

export default async () => {
  try {
    const rawData = await fs.readFile("./config/default.json", "utf-8")
    return JSON.parse(rawData)
  } catch (e) {
    console.log(e)
  }
}
