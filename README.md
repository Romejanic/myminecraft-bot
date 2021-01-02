# myminecraft-bot
A Discord bot for checking statuses of personal Minecraft servers.

## Official Links
[Invite to your server](https://discord.com/api/oauth2/authorize?client_id=793150744533925888&permissions=60480&scope=bot)

[Support Server](https://discord.gg/x3AtYWtKp6)

## Bug Reports
If you encounter any bugs when using this bot, or you have a suggestion for a new feature or fix, please submit a [new issue](https://github.com/Romejanic/myminecraft-bot/issues/new/choose) on Github, or join the support server and report it in the `#bug-reports` channel.

## Commands
All commands begin with the `mc?` prefix, followed directly by the command name with no space afterwards (e.g. `mc?info`). A detailed description of these commands can be found by typing `mc?help`.

Optional arguments are surrounded by `[]`, required arguments are surrounded by `<>`.

|Command|Arguments|Admin Required|Description|
|-------|---------|--------------|-----------|
|mc?help|`[command]`|No|Shows a list of commands. If a command name is given, shows a detailed description of that command's usage.|
|mc?info|None|No|Shows the bot's version, as well as system and usage information.|
|mc?list|None|No|Lists your saved servers and their IP addresses. This command *DOES NOT* ping the servers, use `mc?status` for that instead.|
|mc?status|`[server number]`|No|Lists the saved servers and shows their online status and current player counts. If a server number is given, it will show a detailed description of that server including version, ping, player count, description and server icon.|
|mc?add|None|Yes|Starts the process to save a new server. You will need to enter a server name, the server IP address and then verify that it is correct.|
|mc?remove|`<server number>`|Yes|Removes the given server from your saved list.|


## Getting Started
You will need:
- a [Node.js installation](https://nodejs.org/en/)
- a [MySQL server](https://dev.mysql.com/downloads/installer/) with the correct setup ([a script is provided to do so](init-db.sql))
- a [Discord bot token](https://discord.com/developers/applications)

```sh
$ git clone https://github.com/Romejanic/myminecraft-bot.git
$ cd myminecraft-bot
$ npm install        # download dependencies
$ npm run start      # generate config
$ nano config.json   # add discord token and mysql login
$ npm run start      # start bot
```

You can also run the bot without blocking the terminal by typing (macOS/Linux only):
```sh
$ npm run async
```

## Contributing
Any contributions to the code of this bot would be greatly appreciated! Please begin by looking at the [issues page](https://github.com/Romejanic/myminecraft-bot/issues) for inspiration for what to do.

Once you're finished, create a pull request to the main repo. Hopefully all is well and your changes will be merged into the repo!

**Bonus:** if you include your Discord username and discriminator number in your pull request, you will be given the `Contributor` role on the support server if your pull request is approved!