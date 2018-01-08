//=========\\
// Modules: \\
//////////////////////////////////////////////////////////////////
var discord = require("discord.js"),                            // Discord integration
    gamedig = require("gamedig"),                               // Allows for sending requests to Steam to check for the server
    fs = require("fs"),                                         // Filesystem module, to write the server's cache.
    delay = require("delay"),                                   // Delays any function, used for 6 minute interval.
    token = fs.readFileSync(process.argv.slice(2)[0],'utf-8'),  // The bot's token to log into.
    servers = require("./servers.json"),                        // The servers that will be checked.
    channel = "398827969386381312",                             // The channel where statuses will be sent to.
    e = true,                                                   // A bool that will be disabled after the first server check.
    client = new discord.Client();                              // This is the bot's client object.
//////////////////////////////////////////////////////////////////

//========\\
// Events: \\
//////////////////////////////////////////////////////////////////////////
client.login(token);                                                    // This will log into Discord as your bot.
client.on('ready', () => {                                              // When the client is ready to recieve requests.
    console.log("Ready");                                               // This message will appear if you have successfully activated your bot.
    client.user.setActivity("out for downtime!",{type:"WATCHING"});     // Sets the bot's activity to "Watching out for downtime!"
    check();                                                            //
});                                                                     //
//////////////////////////////////////////////////////////////////////////

function check() { // Allows intervals of checks
    var d = "360000" // 6 minutes
    if(e){d = "1000";e=false} // Set delay for the first check to be one second
    else console.log("Check completed.")
    delay(d).then(() => {
        console.log("Checking...")
        for (i = 0; i < servers.length; i++) {
            justwork(servers[i])
        }
        delay("5000").then(() => {
            return check()
        })
    })
}

function justwork(a) { // Send messages to the channel after checks have been made.
    gamedig.query({type:a.game,host:a.ip,port:a.port})
    .then((state)=>{
        if(state.name.includes("lockdown") && !a.cache.includes("lockdown"))
            return sendit(a,"",state.name,a.name+": Server is now under lockdown."); // Server has been made un-accessible to the public
        else if(!state.name.includes("lockdown") && !a.cache.includes("online"))
            return sendit(a,"GREEN",state.name,a.name+": Server is now online."); // Server just turned online.
    })
    .catch((error)=>{
        if(!a.cache.includes("offline"))
            return sendit(a,"RED",error,a.name+": Server is now offline."); // Server just turned offline.
    });
}

function sendit(a,b,c,d) { // Sends messages in the proper formatting.
    a.cache = d
    console.log(d+"\n    "+c)
    fs.writeFileSync('servers.json', JSON.stringify(servers,null,4))
    return client.channels.get(channel).send("",{embed:new discord.MessageEmbed()
        .setDescription(d)
        .setColor(b)
        .setFooter(c)
    })
}