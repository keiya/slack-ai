import {
  Configuration,
  OpenAIApi,
  type ChatCompletionRequestMessage,
  type ChatCompletionRequestMessageFunctionCall,
} from 'openai';
import { RingBuffer } from './ringbuffer';

import { Sandbox } from './sandbox';

interface Memory extends ChatCompletionRequestMessage {
  createdAt: Date;
}

interface ChatCompletionResult {
  text: string;
  funcRequest?: string;
  funcResponse?: string;
}

export class ChatGPT {
  private readonly openai: OpenAIApi;
  private readonly chatMemories: RingBuffer<Memory>;
  public systemPrompt: ChatCompletionRequestMessage;

  constructor(apikey: string, defaultSystemMessage?: string) {
    const configuration = new Configuration({
      organization: 'org-XUoM8TRtZzA8sbvDF8q2TRlX',
      apiKey: apikey,
    });
    this.openai = new OpenAIApi(configuration);
    this.chatMemories = new RingBuffer<Memory>(30);
    this.systemPrompt = { role: 'system', content: defaultSystemMessage ?? '' };
  }

  // async listModels(): Promise<any> {
  //   return await this.openai.listModels();
  // }

  async functionCall(
    funcCall: ChatCompletionRequestMessageFunctionCall
  ): Promise<string> {
    let result = '';
    if (funcCall?.arguments == null || funcCall?.arguments === '')
      return result;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const funcArgs: any = JSON.parse(funcCall.arguments);
    switch (funcCall.name) {
      case 'javascript': {
        const js = funcArgs.script;
        const sandbox = new Sandbox({});
        result = sandbox.runScript(js);
        break;
      }
      case 'get_from_url': {
        const url = funcArgs.url;
        try {
          result = await fetch(url).then(
            async (response) => await response.text()
          );
        } catch (e) {
          console.error(e);
        }
        break;
      }
      default:
        console.error(`Unknown function called`);
        break;
    }
    console.log('Func Exec: ', result);
    return result;
  }

  async requestChatCompletion(
    messages: ChatCompletionRequestMessage[],
    user?: string
  ): Promise<ChatCompletionResult> {
    const response = await this.openai.createChatCompletion({
      model: 'gpt-4',
      messages,
      user,
      functions: [
        {
          name: 'javascript',
          description: 'Run JavaScript code. Final value is returned.',
          parameters: {
            type: 'object',
            properties: {
              script: {
                type: 'string',
                description: 'JavaScript code to run',
              },
            },
            required: ['script'],
          },
        },
        {
          name: 'get_from_url',
          description:
            'Fetch from a URL. Returns the response body as a string.',
          parameters: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'URL to fetch from',
              },
            },
            required: ['url'],
          },
        },
      ],
      function_call: 'auto',
    });

    const respMessage = response.data.choices[0].message;
    console.log(respMessage);

    let generatedCompletion: ChatCompletionResult = {
      text: respMessage?.content ?? '',
    };

    // if function call is requested by ChatGPT, execute
    if (respMessage?.function_call != null) {
      const funcCall = respMessage.function_call;
      const funcCallResult = JSON.stringify(await this.functionCall(funcCall));
      const requestMessages: ChatCompletionRequestMessage[] = [
        { ...respMessage },
        {
          role: 'function',
          name: funcCall.name,
          content: funcCallResult,
        },
      ];
      generatedCompletion = await this.requestChatCompletion(
        requestMessages,
        user
      );
      generatedCompletion.funcRequest = JSON.stringify(funcCall);
      generatedCompletion.funcResponse = funcCallResult;
    } else {
      if (generatedCompletion.text != null) {
        this.chatMemories.enqueue({
          createdAt: new Date(),
          role: 'assistant',
          content: generatedCompletion.text,
        });
      }
    }

    return generatedCompletion;
  }

  async ask(prompt: string, user?: string): Promise<string | null> {
    console.log(`ask: ${prompt}`);
    try {
      const filterDatetime = Date.now() - 1000 * 3600 * 3;
      const pastMemories: Memory[] = this.chatMemories
        .toArray()
        .filter((m): m is Memory => m !== null)
        .filter((m) => m.createdAt.getTime() > filterDatetime);
      const pastMessages: ChatCompletionRequestMessage[] = pastMemories.map(
        (m) => {
          return { role: m.role, content: m.content };
        }
      );
      const messages = [this.systemPrompt]
        .concat(pastMessages)
        .concat([
          {
            role: 'user',
            content: prompt,
          },
        ])
        .filter((m) => m.content != null && m.content.length > 0);

      console.log(messages);

      this.chatMemories.enqueue({
        createdAt: new Date(),
        role: 'user',
        content: prompt,
      });

      const generatedCompletion = await this.requestChatCompletion(
        messages,
        user
      );

      let resultText = '';
      if (generatedCompletion.funcRequest != null) {
        resultText +=
          '```\nFunction Call:\n' + generatedCompletion.funcRequest + '\n```\n';
      }
      if (generatedCompletion.funcResponse != null) {
        resultText +=
          '```\nFunction Result:\n' +
          generatedCompletion.funcResponse +
          '\n```\n\n';
      }
      resultText += generatedCompletion.text;

      return resultText;
    } catch (error) {
      console.error('Error calling ChatGPT API:', error);
      throw error;
    }
  }
}
