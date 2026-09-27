# Florida State Roleplay Discord Bot

## What it does
- `/verifypanel` — posts a Verify button embed. Clicking it gives the **Verified** role.
- `/infraction` — posts an infraction embed in the channel + DMs the member.
- `/promotion` — posts a promotion embed in the channel + DMs the member.

## Setup

### 1. Create the Discord bot
1. Go to https://discord.com/developers/applications → New Application.
2. Go to "Bot" tab → Add Bot → copy the **Token** (this is your `DISCORD_TOKEN`).
3. Go to "OAuth2 → General" → copy the **Client ID** (this is your `CLIENT_ID`).
4. Under "Bot" tab, enable **Server Members Intent**.
5. Go to OAuth2 → URL Generator: check `bot` and `applications.commands` scopes, and permissions: Manage Roles, Send Messages, Embed Links, Read Message History. Use the generated URL to invite the bot to your server.
6. In your server, create a role called exactly **Verified**, and make sure the bot's role is placed ABOVE the Verified role in Server Settings → Roles.

### 2. Upload banners
The 3 banner PNGs are in the `/banners` folder. Upload them somewhere public and get direct image links, e.g.:
- Easiest: send them in any Discord channel, right click → Copy Link (Discord CDN links work great and never expire as long as the message isn't deleted).
- Or upload to imgur.com and grab the direct image link (ends in .png).

### 3. Set environment variables (on Render)
When you deploy, add these environment variables in Render's dashboard:
- `DISCORD_TOKEN`
- `CLIENT_ID`
- `VERIFY_BANNER_URL`
- `INFRACTION_BANNER_URL`
- `PROMOTION_BANNER_URL`

### 4. Deploy on Render
1. Push this whole `bot` folder to a GitHub repo.
2. Go to render.com → New → Background Worker (not Web Service, since this bot has no web server).
3. Connect your GitHub repo.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add the environment variables from step 3.
7. Deploy.

Once deployed, the bot logs in and registers its slash commands automatically — give it a minute or two for commands to show up in Discord.
