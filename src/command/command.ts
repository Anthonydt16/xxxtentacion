import { CommandInteraction, GuildMemberRoleManager } from "discord.js";
import SpotifyApi from "../model/spotify";

class Command {
    interaction: CommandInteraction;
    spotifyApi: SpotifyApi;
    roleList: string[] = [];
    constructor(
        interaction: CommandInteraction,
        spotifyApi: SpotifyApi,
        roleList: string[]
    ) {
        this.interaction = interaction;
        this.spotifyApi = spotifyApi;
        this.roleList = roleList;
        this.run();
    }

    async run() {
      const commandInteraction = this.interaction as CommandInteraction;
      if (commandInteraction.member && commandInteraction.member.roles instanceof GuildMemberRoleManager) {
        if (!commandInteraction.member.roles.cache.some((role) => this.roleList.includes(role.name))) {
          await commandInteraction.reply({
            content: "Vous n'avez pas la permission d'utiliser cette commande.",
            ephemeral: true,
          });
          return;
        }
      } else {
        await commandInteraction.reply({
          content: "Impossible de vérifier vos rôles. Veuillez contacter un administrateur.",
          ephemeral: true,
        });
        return;
      }
    
      if (!this.interaction.isCommand()) return;
        await this.interaction.deferReply();
    }
}

export default Command;
