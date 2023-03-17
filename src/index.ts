import { App, SlackEventMiddlewareArgs, AllMiddlewareArgs, GenericMessageEvent } from "@slack/bolt";
import { ChatGPT } from "./chatgpt";
import 'dotenv/config'
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

if (!process.env.OPENAI_API_KEY) {
  throw new Error("apikey is not set")
}
const gpt = new ChatGPT(process.env.OPENAI_API_KEY)

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  customRoutes: [{
    path: '/',
    method: 'GET',
    handler: (req, res) => { res.writeHead(200); res.end(); },
  }]
});

type MessageArgs = SlackEventMiddlewareArgs<"message"> & AllMiddlewareArgs;

// メッセージリスナー
app.event("message", async (args: MessageArgs) => {
  const event = args.event as GenericMessageEvent
  const client = args.client

  console.log(event)

  // feed chat message with user id
  const prompt = `<@${event.user}>: ${event.text}`;
  const response = await gpt.ask(prompt, event.user);

  try {
    await client.chat.postMessage({
      channel: event.channel,
      text: response,
    });
  } catch (error) {
    console.error("Error posting message to Slack:", error);
  }
});

app.command("/ai", async ({ command, ack, respond }) => {
  await ack();

  console.log(command)

  const cmd = command.text.split(' ')
  switch (cmd[0]) {
    case 'getsystemprompt':
      await respond(`> Showing system role prompt: ${gpt.systemPrompt.content}`);
      break;
    case 'setsystemprompt':
      gpt.systemPrompt.content = cmd[1]
      await respond(`> [SET] Setting system role prompt`);
      break;
  }
});

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

// // Boltアプリの起動
(async () => {
  const port = process.env.PORT || 12001;
  await app.start(port);
  console.log(`ChatGPT Slack bot is running on port ${port}`);
})();
