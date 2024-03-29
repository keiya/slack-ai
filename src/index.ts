import {
  App,
  type SlackEventMiddlewareArgs,
  type AllMiddlewareArgs,
  type GenericMessageEvent,
} from '@slack/bolt';
import { ChatGPT } from './chatgpt';
import 'dotenv/config';
import * as Sentry from '@sentry/node';

if (process.env.OPENAI_API_KEY == null) {
  throw new Error('apikey is not set');
}
const gpt = new ChatGPT(process.env.OPENAI_API_KEY, process.env.SYSTEM_MESSAGE);

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: Boolean(process.env.SLACK_APP_TOKEN),
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  port: 12001,
  customRoutes: [
    {
      path: '/',
      method: 'GET',
      handler: (req, res) => {
        res.writeHead(200);
        res.end();
      },
    },
  ],
});

type MessageArgs = SlackEventMiddlewareArgs<'message'> & AllMiddlewareArgs;

// メッセージリスナー
app.event('message', async (args: MessageArgs) => {
  const event = args.event as GenericMessageEvent;
  const client = args.client;

  console.log(event);

  if ('bot_id' in event && Math.random() > 0.25) {
    console.log('ignoring bot');
    return;
  }

  // feed chat message with user id
  if (event.text != null) {
    const prompt = `<@${event.user}>: ${event.text}`;

    try {
      await client.reactions.add({
        channel: event.channel,
        name: 'thinking_face',
        timestamp: event.ts,
      });
    } catch (error) {
      console.error('Error adding emoji to Slack:', error);
    }

    const response = await gpt.ask(prompt, event.user);

    if (response == null) {
      return;
    }

    try {
      await client.chat.postMessage({
        channel: event.channel,
        text: response,
      });
      await client.reactions.remove({
        channel: event.channel,
        name: 'thinking_face',
        timestamp: event.ts,
      });
    } catch (error) {
      console.error('Error posting message to Slack:', error);
    }
  }
});

app.command('/ai', async ({ command, ack, respond }) => {
  await ack();

  console.log(command);

  const cmd = command.text.split(' ');
  switch (cmd[0]) {
    case 'getsystemprompt':
      await respond(
        `> Showing system role prompt: ${gpt.systemPrompt.content ?? ''}`
      );
      break;
    case 'setsystemprompt':
      gpt.systemPrompt.content = cmd[1] ?? '';
      await respond('> [SET] Setting system role prompt');
      break;
  }
});

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  enabled: process.env.NODE_ENV === 'production',
});

// // Boltアプリの起動
(async () => {
  const port = process.env.PORT ?? 12001;
  await app.start(port);
  console.log(`ChatGPT Slack bot is running on port ${port}`);
})().catch((err) => {
  console.error(err);
});
