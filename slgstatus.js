//=========\\
// Modules: \\
//////////////////////////////////////////////////////////////////
var discord = require("discord.js"),                            // Discord integration
    fs = require("fs")
    token = fs.readFileSync(process.argv.slice(2)[0],'utf-8'),  // The bot's token to log into.
    client = new discord.Client();                              // This is the bot's client object.
    func = require('./data/functions.js'),                      // This file contains functions that will be used for various commands.
//////////////////////////////////////////////////////////////////

//========\\
// Events: \\
//////////////////////////////////////////////////////////////////////////
client.login(token);                                                    // This will log into Discord as your bot.
client.on('ready', () => {                                              // When the client is ready to recieve requests.
    console.log("Ready");                                               // This message will appear if you have successfully activated your bot.
    client.user.setActivity("otters in water",{type:"WATCHING"});       // Sets the bot's activity to "Watching out for downtime!"
    //client.channels.get("479836705084538890").send("Hey y'all, I'm a bot that checks for the server statuses!\nHere are the current server statuses, they update every 6 minutes:")
    func.check();                                                       //
});                                                                     //
//////////////////////////////////////////////////////////////////////////
