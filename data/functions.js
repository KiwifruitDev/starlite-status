// This file is used for various functions for the bot to
// easily calculate anything without clutter it's main file.
// There may not be much documentation, I apologize.
// I hope this all makes sense to you. ♥

var discord = require("discord.js"),
    gamedig = require("gamedig"),
    delay = require('delay'),
    fs = require('fs'),
    servers = require("./servers.json"),
    e = true

exports.check = check
function check() { // Allows intervals of checks
    var d = "360000" // 6 minutes
    if(e){d = "1000";e=false} // Set delay for the first check to be one second
    else console.log("Check completed.")
    delay(d).then(() => {
        servers = JSON.parse(fs.readFileSync('./data/servers.json'))
        console.log("Checking...")
        for (m = 0; m < servers.length; m++) {
            justwork(servers[m],m)
        }
        delay("5000").then(() => {
            return check()
        })
    })
}

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return hour + ":" + min + " PST"

}

exports.justwork = justwork
function justwork(a,m) { // Send messages to the channel after checks have been made.
    var n = "",
        g = a.game
    if(a.name)
        n = a.name+" / "
    if(a.gametrackergame)
        g = a.gametrackergame
    console.log(g)
    gamedig.query({type:a.game,host:a.queryip,port:a.port,socketTimeout:3000})
    .then((state)=>{
        var playercollection = [],
            numplayers = state.players.length,
            map = ""

        if(state.map)
            map = state.map.toLowerCase().replace("-","_").replace("*","")
        else if(state.raw.map)
            map = state.raw.map.toLowerCase().replace("-","_").replace("*","")

        if(a.mapprefixreplacements) {
            for(var i = 0; i != a.mapprefixreplacements.length; i++) {
                if(map.indexOf(a.mapprefixreplacements[i][0]) == 0) 
                    map = (a.mapprefixreplacements[i][1]+map.slice(a.mapprefixreplacements[i][0].length))
            }
        }

        if(state.password)
            console.log(n+a.queryip+":"+a.port+" - Password-protected")
        else
            console.log(n+a.queryip+":"+a.port+" - Online")

        if(state.raw.numplayers)
            numplayers = state.raw.numplayers //used for servers without individual player objects

        if(numplayers <= 0)
            playercollection.push("None")

        for(var i = 0; i != numplayers; i++) {
            if(state.players[i] != undefined) {
                console.log(state.players[i])
                if(state.players.length > 0 && state.players[i].name) {
                    if(state.players[i].score)
                        state.players[i].name = (state.players[i].name.replace("*","\\*").replace("_","\\_").replace("`","\\`").replace("~","\\~"))+" | Score: "+state.players[i].score
                    if((playercollection.join("\n").length + (state.players[i].name.replace("*","\\*").replace("_","\\_").replace("`","\\`").replace("~","\\~")).length) <= 1012) {
                        if(state.players[i].score)
                            playercollection.push((state.players[i].name.replace("*","\\*").replace("_","\\_").replace("`","\\`").replace("~","\\~"))+" | Score: "+state.players[i].score)
                        else
                            playercollection.push((state.players[i].name.replace("*","\\*").replace("_","\\_").replace("`","\\`").replace("~","\\~")))
                    } else playercollection.push("+ "+(numplayers-(i+1))+" more")
                } else playercollection = ["Player info is private."]
            }
        }
        //console.log(state)
        var embed = new discord.MessageEmbed()
        if(state.name) 
            embed.setTitle(state.name)
        else if(a.nameoverride) 
            embed.setTitle(a.name)
        else
            embed.setTitle("Unknown server")
        if(state.password) {
            if(a.steamjoinurl)
                embed.setDescription(":orange_book: Server is password-protected.\nsteam://connect/"+a.ip+":"+a.port+"/")
            else embed.setDescription(":orange_book: Server is password-protected.")
        } else if(a.steamjoinurl)
            embed.setDescription(":green_book: Server is online.\nsteam://connect/"+a.ip+":"+a.port+"/")
        else
            embed.setDescription(":green_book: Server is online.")
        embed.addField("Players ("+numplayers+"/"+state.maxplayers+"):",playercollection.join("\n"),true)
        if(map) embed.addField("Map:",map,true)
        embed.setColor("GREEN")
        embed.setFooter(a.ip+":"+a.port+" | Last updated at "+getDateTime())
        if(a.badmaps && a.badmaps.includes(map))
            embed.setThumbnail("https://image.gametracker.com/images/maps/160x120/nomap.jpg")
        else if(map)
            embed.setThumbnail("https://image.gametracker.com/images/maps/160x120/"+g+"/"+map+".jpg")
        else embed.setThumbnail("https://image.gametracker.com/images/maps/160x120/nomap.jpg")
        client.channels.get(a.channel).messages.fetch(a.message)
        .then(message => message.edit({embed:embed}))
        .catch((error)=> {
            console.log(error)
            client.channels.get(a.channel).send("",{embed:embed}).then(message=>{
                servers[m].message = message.id
                console.log(message.id)
                fs.writeFileSync('./data/servers.json', JSON.stringify(servers,null,4))
            })
        })
    })
    .catch((error)=>{
        console.log(error)
        //console.log(n+a.queryip+":"+a.port+" - "+error)
        client.channels.get(a.channel).messages.fetch(a.message)
        .then(message => {
            var embed = client.channels.get(a.channel).messages.get(a.message).embeds[0]
            if(a.steamjoinurl)
                embed.setDescription(":closed_book: Server is offline.\nsteam://connect/"+a.ip+":"+a.port+"/")
            else
                embed.setDescription(":closed_book: Server is offline.")
            embed.setColor("RED")
            embed.fields = []
            embed.setThumbnail("https://image.gametracker.com/images/maps/160x120/nomap.jpg")
            message.edit({embed:embed})
        })
        .catch((error)=> {
            var embed = new discord.MessageEmbed()
            embed.setTitle("Unknown server")
            if(a.steamjoinurl)
                embed.setDescription(":closed_book: Server is offline.\nsteam://connect/"+a.ip+":"+a.port+"/")
            else
                embed.setDescription(":closed_book: Server is offline.")
            embed.setColor("RED")
            embed.setThumbnail("https://image.gametracker.com/images/maps/160x120/nomap.jpg")
            embed.setFooter(a.ip+":"+a.port+" | Last updated at "+getDateTime())
            client.channels.get(a.channel).send("",{embed:embed}).then(message=>{
                servers[m].message = message.id
                console.log(message.id)
                fs.writeFileSync('./data/servers.json', JSON.stringify(servers,null,4))
            })
        })
    })
}
