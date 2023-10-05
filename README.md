# myminecraft-bot
A Discord bot for checking statuses of personal Minecraft servers.

## Official Links
[Invite to your server](https://discord.com/api/oauth2/authorize?client_id=793150744533925888&permissions=60480&scope=bot)

[Support Server](https://discord.gg/fawJ2dTxFS)

[top.gg page](https://top.gg/bot/793150744533925888)

## Bug Reports
If you encounter any bugs when using this bot, or you have a suggestion for a new feature or fix, please submit a [new issue](https://github.com/Romejanic/myminecraft-bot/issues/new/choose) on Github, or join the support server and report it in the `#mymc-bug-reports` channel.

## Commands
You can find a list of commands by typing `/` into your chat box and selecting `MyMinecraft` from the list on the left.

|Command|Permission Required|Description|
|-------|-------------------|-----------|
|/info|None|Shows the bot's version, as well as system and usage information.|
|/ping|None|Pings a server directly based on the provided IP address. Does not save the server, just shows the live status.|
|/list|None|Lists your saved servers and their IP addresses. This command *DOES NOT* ping the servers, use `/status` for that instead.|
|/status|None|Lists the saved servers and shows their online status and current player counts. If a server is selected, it will show a detailed description of that server including version, ping, player count, description and server icon.|
|/players|None|Pings the saved servers and displays their player counts. If a server is selected, it will show a sample of the player names if one is provided by the server.|
|/add|Manage Server|Starts the process to save a new server. You will need to enter a server name, the server IP address and then verify that it is correct.|
|/remove|Manage Server|Removes the given server from your saved list.|


## Getting Started
**NOTE:** This bot uses *Bun* as it's underlying runtime, NOT Node.js. Running this bot with Node.js will not work.

You will need:
- a [Bun installation](https://bun.sh/)
- a [MySQL server](https://dev.mysql.com/downloads/installer/)
- a [Discord bot token](https://discord.com/developers/applications)

```sh
$ git clone https://github.com/Romejanic/myminecraft-bot.git
$ cd myminecraft-bot
$ bun install                # download dependencies
$ cp .env.example .env       # create .env file
$ vi .env                    # add database credentials
$ bunx prisma migrate deploy # migrate database to match schema
$ bunx slasher               # deploy commands and save bot token
$ bun dev                    # start bot in watch mode for development
```

You can also run the bot asynchronously using [pm2](https://pm2.keymetrics.io/):
```sh
$ npm run async
```

## Contributing
Any contributions to the code of this bot would be greatly appreciated! Please begin by looking at the [issues page](https://github.com/Romejanic/myminecraft-bot/issues) for inspiration for what to do. Also be sure to follow the [contribution guidelines](./CONTRIBUTING.md).

Once you're finished, create a pull request to the main repo. Hopefully all is well and your changes will be merged into the repo!

**Bonus:** if you include your Discord username in your pull request, you will be given the `Contributor` role on the support server if your pull request is approved!