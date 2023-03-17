import {
  Configuration,
  OpenAIApi,
  type ChatCompletionRequestMessage,
} from 'openai';
import { RingBuffer } from './ringbuffer';

interface Memory {
  createdAt: Date;
  role: 'assistant' | 'user';
  content: string;
}

export class ChatGPT {
  private readonly openai: OpenAIApi;
  private readonly chatMemories: RingBuffer<Memory>;
  public systemPrompt: ChatCompletionRequestMessage;

  constructor(apikey: string) {
    const configuration = new Configuration({
      organization: 'org-XUoM8TRtZzA8sbvDF8q2TRlX',
      apiKey: apikey,
    });
    this.openai = new OpenAIApi(configuration);
    this.chatMemories = new RingBuffer<Memory>(20);
    this.systemPrompt = { role: 'system', content: '' };
  }

  // async listModels () {
  //   return await this.openai.listModels()
  // }

  async ask(prompt: string, user?: string): Promise<string | null> {
    if (user != null) {
      console.log(`ask: ${prompt} [${user}]`);
    }
    try {
      const pastMemories: Memory[] = this.chatMemories
        .toArray()
        .filter((m): m is Memory => m !== null);
      const pastMessages: ChatCompletionRequestMessage[] = pastMemories.map(
        (m) => {
          return { role: m.role, content: m.content };
        }
      );
      const response = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [this.systemPrompt].concat(pastMessages).concat([
          {
            role: 'user',
            content: prompt,
          },
        ]),
        user,
      });
      console.log(response.data);
      const generatedText = response.data.choices[0].message?.content;
      if (generatedText != null) {
        this.chatMemories.enqueue({
          createdAt: new Date(),
          role: 'user',
          content: prompt,
        });
        this.chatMemories.enqueue({
          createdAt: new Date(),
          role: 'assistant',
          content: generatedText,
        });
        return generatedText;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error calling ChatGPT API:', error);
      throw error;
    }
  }
}
