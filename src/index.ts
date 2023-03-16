import { App, ExpressReceiver } from "@slack/bolt";
import axios from "axios";
import { ChatGPT } from "./chatgpt";
import 'dotenv/config'

if (!process.env.OPENAI_API_KEY) {
  throw new Error("apikey is not set")
}
const gpt = new ChatGPT(process.env.OPENAI_API_KEY)

// // 環境変数から設定を取得
const slackBotToken = process.env.SLACK_BOT_TOKEN || '';
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET || '';
const openaiApiKey = process.env.OPENAI_API_KEY || '';

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  customRoutes: [{
    path: '/',
    method: 'GET',
    handler: (req, res) => { res.writeHead(200); res.end(); },
  }]
});


// メッセージリスナー
app.event("message", async ({ event, client }) => {
  const prompt = (<any>event).text;
  const response = await gpt.ask(prompt);

  try {
    await client.chat.postMessage({
      channel: event.channel,
      text: response,
    });
  } catch (error) {
    console.error("Error posting message to Slack:", error);
  }
});

// // Boltアプリの起動
(async () => {
  const port = process.env.PORT || 12001;
  await app.start(port);
  console.log(`ChatGPT Slack bot is running on port ${port}`);
})();
