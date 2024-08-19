import { CommandInteraction, GuildMember } from "discord.js";
import Command from "./command";
import SpotifyApi from "../model/spotify";

class Ban extends Command {
    spotifyApi: SpotifyApi;
    roleList: string[] = [];
    interaction: CommandInteraction;

    constructor(
        interaction: CommandInteraction,
        spotifyApi: SpotifyApi,
        roleList: string[]
    ) {
        super(interaction, spotifyApi, roleList);
        this.interaction = interaction;
        this.spotifyApi = spotifyApi;
        this.roleList = roleList;
        this.run();
    }

    async run() {
        if (this.interaction.commandName === 'ban') {
            const userDiscordId = this.interaction.options.get('user')?.user;
            const reason = this.interaction.options.get('reason')?.value as string;

            const guild = this.interaction.guild;
            if (!guild) {
                await this.interaction.reply({ content: "La commande doit être exécutée dans un serveur.", ephemeral: true });
                return;
            }

            if (!userDiscordId) {
                await this.interaction.reply({ content: "L'argument user est manquant.", ephemeral: true });
                return;
            }

            try {
                // Fetch the member to ban using the userDiscordId
                const member = await guild.members.fetch(userDiscordId);

                if (member) {
                    // Ban the member from the guild
                    await member.ban({ reason: reason });
                    await this.interaction.reply({ content: `${member.user.tag} a été banni pour la raison suivante : ${reason}` });
                } else {
                    await this.interaction.reply({ content: "Utilisateur non trouvé.", ephemeral: true });
                }
            } catch (error) {
                console.error("Error while trying to ban a user:", error);
                await this.interaction.reply({ content: "Une erreur s'est produite lors du ban de l'utilisateur.", ephemeral: true });
            }
        } else if (this.interaction.commandName === 'unban') {
            const userDiscordId = this.interaction.options.get('user')?.user;

            const guild = this.interaction.guild;
            if (!guild) {
                await this.interaction.reply({ content: "La commande doit être exécutée dans un serveur.", ephemeral: true });
                return;
            }

            if (!userDiscordId) {
                await this.interaction.reply({ content: "L'argument user est manquant.", ephemeral: true });
                return;
            }

            try {
                // Fetch the member to unban using the userDiscordId
                const bannedUsers = await guild.bans.fetch();
                const user = bannedUsers.find((user) => user.user.id === userDiscordId.id);

                if (user) {
                    // Unban the user from the guild
                    await guild.bans.remove(userDiscordId.id);
                    await this.interaction.reply({ content: `${userDiscordId.tag} a été débanni.` });
                } else {
                    await this.interaction.reply({ content: "Utilisateur non trouvé.", ephemeral: true });
                }
            } catch (error) {
                console.error("Error while trying to unban a user:", error);
                await this.interaction.reply({ content: "Une erreur s'est produite lors du déban de l'utilisateur.", ephemeral: true });
            }
        }
    }
}

export default Ban;
