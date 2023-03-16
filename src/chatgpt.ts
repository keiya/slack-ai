import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";
import { RingBuffer } from "./ringbuffer";

interface Memory {
  askedAt: Date,
  prompt: string,
}

export class ChatGPT {
  private openai: OpenAIApi
  private chatMemories: RingBuffer<Memory>

  constructor(apikey: string) {
    const configuration = new Configuration({
      organization: "org-XUoM8TRtZzA8sbvDF8q2TRlX",
      apiKey: apikey,
    });
    this.openai = new OpenAIApi(configuration);
    this.chatMemories = new RingBuffer<Memory>(10)
  }

  listModels() {
    return this.openai.listModels();
  }

  async ask(prompt: string): Promise<string> {
    try {
      const pastMemories = this.chatMemories.toArray()
      const pastMessages: ChatCompletionRequestMessage[] = pastMemories.map(m => { return { role: "user", content: m.prompt } })
      const response = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: pastMessages.concat([{
          role: "user",
          content: prompt,
        }]),
      });
      console.log(response.data)
      const generatedText = (response.data.choices[0] as any).message.content;
      this.chatMemories.enqueue({ askedAt: new Date(), prompt })
      return generatedText as string;
    } catch (error) {
      console.error("Error calling ChatGPT API:", error);
      throw error;
    }
  }
}
