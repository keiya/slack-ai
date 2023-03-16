# Development
## Create Slack App
You should create the app at Slack API (https://api.slack.com) page before starting development.

App Manifest:

```json
{
    "display_information": {
        "name": "ai",
        "description": "powered by chatgpt",
        "background_color": "#59423b"
    },
    "features": {
        "bot_user": {
            "display_name": "ai",
            "always_online": true
        }
    },
    "oauth_config": {
        "scopes": {
            "bot": [
                "app_mentions:read",
                "chat:write",
                "im:read",
                "channels:history",
                "im:write",
                "mpim:history",
                "mpim:write",
                "mpim:read",
                "groups:history",
                "im:history"
            ]
        }
    },
    "settings": {
        "event_subscriptions": {
            "request_url": "https://aabb945aecaf.ngrok.app/slack/events",
            "bot_events": [
                "app_mention",
                "message.channels",
                "message.groups",
                "message.im",
                "message.mpim"
            ]
        },
        "org_deploy_enabled": false,
        "socket_mode_enabled": false,
        "token_rotation_enabled": false
    }
}
```

To configure app, paste this on App Manifest page:

https://app.slack.com/app-settings/xxxxx/xxxxx/app-manifest

All needed permissions to work this app are predefined in this manifest, so you don't need configure manually by clicking annoying on config page!

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
```

## Run
run server with:
```
npm run dev
```

you may need ngrok

## Deploy
```
flyctl secrets import < .env
flyctl deploy
```
