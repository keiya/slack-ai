# Development

## Create Slack App

You should create the app at Slack API (https://api.slack.com) page before starting development.

(CHANGE URL if you're going to developing locally!)

App Manifest:

```json
{
  "display_information": {
    "name": "ai2",
    "description": "powered by chatgpt",
    "background_color": "#59423b"
  },
  "features": {
    "bot_user": {
      "display_name": "ai2",
      "always_online": true
    },
    "slash_commands": [
      {
        "command": "/ai2",
        "description": "Set/Get AI Config",
        "usage_hint": "[getsystemprompt | setsystemprompt] value",
        "should_escape": false
      }
    ]
  },
  "oauth_config": {
    "scopes": {
      "bot": [
        "app_mentions:read",
        "channels:history",
        "chat:write",
        "commands",
        "groups:history",
        "im:history",
        "im:read",
        "im:write",
        "mpim:history",
        "mpim:read",
        "mpim:write",
        "reactions:write"
      ]
    }
  },
  "settings": {
    "event_subscriptions": {
      "bot_events": [
        "app_mention",
        "message.channels",
        "message.groups",
        "message.im",
        "message.mpim"
      ]
    },
    "org_deploy_enabled": false,
    "socket_mode_enabled": true,
    "token_rotation_enabled": false
  }
}
```

To configure app, paste this on App Manifest page:

https://app.slack.com/app-settings/xxxxx/xxxxx/app-manifest

All needed permissions to work this app are predefined in this manifest, so you don't need configure manually by clicking annoying on config page!

You need SLACK_APP_TOKEN if you want to use Socket Mode. Webhook mode is also available without SLACK_APP_TOKEN.

**DO NOT OVERWRITE CONFIGURE PRODUCTION ai-chan app!**

You should develop on your own app, not ai-chan production.

## Install app

Install created app to the workspace.

## Prepare Environment Variables

create `.env` with these secrets:

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SLACK_BOT_TOKEN=xoxb-xxxxxxxxxxxxxxxxxxxxxxxx
SLACK_SIGNING_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
SLACK_APP_TOKEN=xapp-xxxxxxxxxxxxxxxxxxxxxxxx
SENTRY_DSN=
SYSTEM_MESSAGE=
```

## Run

run server with:

```
npm run dev
```

you don't need ngrok.

## Debug Repl

You can use REPL for debug purposes.

```
% npm run debug

> openai@1.0.0 debug
> ts-node src/repl.ts

> const gpt = new ChatGPT(process.env.OPENAI_API_KEY)
undefined
> await gpt.ask("語尾ににゃをつけて")
{
  id: 'chatcmpl-6unkIG0TNPJHqFbtLaGrZcOv3UgZr',
  object: 'chat.completion',
  created: 1678995610,
  model: 'gpt-3.5-turbo-0301',
  usage: { prompt_tokens: 19, completion_tokens: 42, total_tokens: 61 },
  choices: [ { message: [Object], finish_reason: 'stop', index: 0 } ]
}
'「こんにちはにゃ！」「ありがとうにゃ♪」「ごめんにゃさい」「おやすみにゃん♪」「いただきにゃ！」など。'
> await gpt.ask("語尾になんてつければいいんだっけ？")
{
  id: 'chatcmpl-6unkWbxSXsSYSitzwBxlUAYAvWkkt',
  object: 'chat.completion',
  created: 1678995624,
  model: 'gpt-3.5-turbo-0301',
  usage: { prompt_tokens: 43, completion_tokens: 27, total_tokens: 70 },
  choices: [ { message: [Object], finish_reason: 'stop', index: 0 } ]
}
'語尾ににゃをつければにゃ。にゃんにゃん。'

> await (new ChatGPT(process.env.OPENAI_API_KEY)).ask("123*321^12")
```

You can retrieve models by:

```
(await new ChatGPT(process.env.OPENAI_API_KEY).listModels()).data
```

## Deploy

```
flyctl secrets import < .env.production
flyctl deploy
```
