const Discord = require('discord.js')
const {MessageActionRow , MessageButton , MessageEmbed} = require('discord.js')
const client = new Discord.Client({intents: 32767})
const db = require('quick.db')
const discordTranscripts = require('discord-html-transcripts');
const DiscordModal = require('discord-modal')
DiscordModal(client)
const config = {
  "staff" : "957354973484712086",
  "category" : "957355033383555092",
  "owner" : "600341504682360863",
  "log" :"968582450433363988",
  "token" : "OTY4NTkwNTg1OTIzNTEwMzMy.YmhERw.iOQPECs4vCPn5bt1B0H_GbS6eEw",
  "prefix" : "!",
} 

client.on('ready' , ()=> {
  console.log(client.user.tag + ' is Alive')
})



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
            .setCustomId("close_btn")
            .setEmoji('🔒'),
            new MessageButton()
            .setLabel('Rename Ticket')
            .setStyle('DANGER')
            .setCustomId("rename_btn")
            .setEmoji('⚙')
            ,
            new MessageButton()
            .setLabel('Claim Ticket')
            .setStyle('PRIMARY')
            .setCustomId("claim_btn")
            .setEmoji('📍')

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
        interaction.channel.permissionOverwrites.edit(userr, {
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
        await interaction.channel.delete()

      }
    }
  })

  client.on('interactionCreate' , async (interaction) => {
    if (interaction.isButton()){
      if (interaction.customId === 'rename_btn'){
        if (!interaction.member.roles.cache.has(config.staff)) return interaction.reply("INVALID PERMISSION.");
          
        const textinput = new DiscordModal.TextInput()
        .setCustomId("change_ticket_name")
        .setTitle("Ticket Rename")
        .addComponents(
          new DiscordModal.TextInputField()
          .setLabel("New Name?")
          .setStyle("short")
          .setCustomId("ask_1")
          .setRequired(true)
          )
          client.TextInputs.open(interaction, textinput) 

      }
    }
  })


  client.on("interactionTextInput",async(interaction)=>{
    if(interaction.customId == 'change_ticket_name'){
      await interaction.deferReply()
      let embed = new Discord.MessageEmbed()
      .setColor('GREEN')
      .setAuthor(`Changed Ticket name to => ${interaction.fields[0].value}`) 
       await interaction.editReply({embeds:[embed]})
       await interaction.channel.setName(interaction.fields[0].value)
    }
   })


   client.on('interactionCreate' , async (interaction) => {
    if (interaction.isButton()){
      if (interaction.customId === 'claim_btn'){
        if (!interaction.member.roles.cache.has(config.staff)) return interaction.reply("INVALID PERMISSION.");
            let embed = new Discord.MessageEmbed()
            .setAuthor(`Ticket Claimed!`)
            .addField(`Claimed` , `${interaction.user}`)
            .setColor('RED')
        interaction.channel.send({embeds : [embed]})
        const row = new MessageActionRow()
        .addComponents(
          new MessageButton()
            .setLabel('Close Ticket')
            .setStyle('DANGER')
            .setCustomId("close_btn"),
            new MessageButton()
            .setLabel('Rename Ticket')
            .setStyle('PRIMARY')
            .setCustomId("rename_btn"),
            new MessageButton()
            .setLabel('Claim Ticket')
            .setStyle('SECONDARY')
            .setCustomId("claim_btn")
            .setDisabled(true)
            );

            interaction.update({components : [row]})
      }

    }
  })
  
client.login(config.token)