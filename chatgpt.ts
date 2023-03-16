import { Configuration, OpenAIApi } from "openai";

export class ChatGPT {
  private openai: OpenAIApi

  constructor(apikey: string) {
    const configuration = new Configuration({
      organization: "org-XUoM8TRtZzA8sbvDF8q2TRlX",
      apiKey: apikey,
    });
    this.openai = new OpenAIApi(configuration);
  }

  listModels() {
    return this.openai.listModels();
  }

  async ask(prompt: string): Promise<string> {
    try {
      const response = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: "user",
          content: prompt,
        }],
      });
      const generatedText = (response.data.choices[0] as any).message.content;
      return generatedText as string;
    } catch (error) {
      console.error("Error calling ChatGPT API:", error);
      throw error;
    }
  }
}
