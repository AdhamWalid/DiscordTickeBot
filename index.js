const Discord = require('discord.js')
const {MessageActionRow , MessageButton , MessageEmbed} = require('discord.js')
const client = new Discord.Client({intents: 32767})
const db = require('quick.db')
const discordTranscripts = require('discord-html-transcripts');


const config = {
  staff : "",
  category : "",
  owner : "",
  log :"",
  token : process.env.token,
  prefix : ""
}


client.on('messageCreate' , async (message) => {
    if (message.content === config.prefix + 'send-panel'){
      if (!message.author.id === config.owner) return;
      let embed = new Discord.MessageEmbed()
      .setAuthor({name : `${message.guild.name}` , iconURL : message.guild.iconURL({dynamics : true})})
      .setColor("BLURPLE")
      .setDescription("**Open a Ticket by Clicking the Button**")
      .setThumbnail(message.guild.iconURL({dynamics : true}))
      .setFooter({text : "Please don't open a ticket for no reason."})
      
      
      const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel('Open Ticket')
          .setStyle('PRIMARY')
          .setCustomId("ticket_btn")
          );

      message.channel.send({embeds  : [embed] , components : [row]})
    }
  })



  client.on('interactionCreate' , async (interaction) => {
    if (interaction.isButton()){
      if (interaction.customId === 'ticket_btn'){
        let count = db.get(`count_${interaction.guild.id}`)
        if (count === null){
            let count = db.set(`count_${interaction.guild.id}` , 1)
        }
        
        db.add(`count_${interaction.guild.id}` ,1)
        let num = db.get(`count_${interaction.guild.id}`)
        console.log(num)
        interaction.guild.channels.create(`${interaction.user.username}`, { //Create a channel
          type: 'text', //Make sure the channel is a text channel
          parent : config.category,
      }).then((newChannel) => {

 newChannel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, {
          SEND_MESSAGES: false,
          VIEW_CHANNEL: false,
          ATTACH_FILES: false
        })

        newChannel.permissionOverwrites.edit(interaction.user.id, {
          SEND_MESSAGES: true,
          VIEW_CHANNEL: true,
          ATTACH_FILES: true
        })

        newChannel.setTopic(interaction.user.id)
        let embed = new Discord.MessageEmbed()
        .setAuthor(`${interaction.guild.name}`)
        .setDescription("Please wait for the support team.")
        .addField(`Ticket Author` , `${interaction.user.tag}`, true)
        .addField(`Date` , `<t:${Date.now().toString().slice(0 , 10)}:R>` , true )
        .setColor("BLURPLE")
        .setThumbnail(interaction.guild.iconURL({dynamics  : true}))

        const row = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setLabel('Close Ticket')
            .setStyle('DANGER')
            .setCustomId("close_btn"),

            );

        newChannel.send({content : `${interaction.user} <@&${config.staff}>`,embeds : [embed] ,  components : [row]})



            interaction.reply({content : `Ticket Opened at ${newChannel}` , ephemeral :true})
        })
      }
    }
  })



  client.on('interactionCreate' , async (interaction) => {
    if (interaction.isButton){
      if (interaction.customId === 'close_btn'){


      
        let log = client.channels.cache.get(config.log);
        let channel = interaction.channel;
        const attachment = await discordTranscripts.createTranscript(channel , {
          returnBuffer: false,
          fileName: 'Developers-Center.html'
        });

        let userr = client.users.cache.get(interaction.channel.topic);
        interaction.channel.permissionOverwrites.edit(userr.id, {
          SEND_MESSAGES: false,
          VIEW_CHANNEL: false,
          ATTACH_FILES: false
        })
        let embed = new Discord.MessageEmbed()
        .setAuthor({name : `${interaction.guild.name}` , iconURL : interaction.guild.iconURL({dynamics  : true})})
        .addField(`Ticket Owner` , `${userr.username}` , true)
        .setColor("BLURPLE")
        
        
        log.send({
          embeds : [embed],
          files: [attachment]
      });


      const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setLabel('Delete Ticket')
          .setStyle('DANGER')
          .setCustomId("delete_btn")
          );

        interaction.reply({content : `Ticket Closed By ${interaction.user}`, components : [row]})              

      }
    }
  })

  client.on('interactionCreate' , async (interaction) => {
    if (interaction.isButton()){
      if (interaction.customId === 'delete_btn'){
        if (!interaction.member.roles.cache.has(config.staff)) return interaction.reply("INVALID PERMISSION.");
        interaction.reply("Deleting..")
        await interaction.channel.delete()

      }
    }
  })


client.login(config.token)