import { CommandInteraction, GuildMember, GuildMemberRoleManager } from "discord.js";
import Command from "./command";
import SpotifyApi from "../model/spotify";

class Ban extends Command {
    constructor(
        interaction: CommandInteraction,
        requiredRoles: string[],
        requiredPermissions: bigint[],
      ) {
        super(interaction, requiredRoles, requiredPermissions);
        this.run();
    }

    async run() {
        const hasPermission = await this.hasPermission();
        if (!hasPermission) return;

        if (this.interaction.commandName === 'ban') {
            await this.handleBan();
        } else if (this.interaction.commandName === 'unban') {
            await this.handleUnban();
        }
    }

    private async handleBan() {
        const userDiscordId = this.interaction.options.get('user')?.user;
        const reason = this.interaction.options.get('reason')?.value as string || "No reason provided";

        if (!userDiscordId) {
            await this.interaction.reply({ content: "L'argument user est manquant.", ephemeral: true });
            return;
        }

        if (userDiscordId.id === this.interaction.user.id) {
            await this.interaction.reply({ content: "Vous ne pouvez pas vous bannir vous-même.", ephemeral: true });
            return;
        }

        const guild = this.interaction.guild;
        if (!guild) {
            await this.interaction.reply({ content: "La commande doit être exécutée dans un serveur.", ephemeral: true });
            return;
        }

        try {
            const member = await guild.members.fetch(userDiscordId.id);
            if (member) {
                await member.ban({ reason });
                await this.interaction.reply({ content: `${member.user.tag} a été banni pour la raison suivante : ${reason}` });
            } else {
                await this.interaction.reply({ content: "Utilisateur non trouvé.", ephemeral: true });
            }
        } catch (error) {
            console.error("Error while trying to ban a user:", error);
            await this.interaction.reply({ content: "Une erreur s'est produite lors du ban de l'utilisateur.", ephemeral: true });
        }
    }

    private async handleUnban() {
        const userDiscordId = this.interaction.options.get('user')?.user;

        if (!userDiscordId) {
            await this.interaction.reply({ content: "L'argument user est manquant.", ephemeral: true });
            return;
        }

        const guild = this.interaction.guild;
        if (!guild) {
            await this.interaction.reply({ content: "La commande doit être exécutée dans un serveur.", ephemeral: true });
            return;
        }

        try {
            const banInfo = await guild.bans.fetch(userDiscordId.id);
            if (banInfo) {
                await guild.bans.remove(userDiscordId.id);
                await this.interaction.reply({ content: `${userDiscordId.tag} a été débanni.` });
            } else {
                await this.interaction.reply({ content: "Utilisateur non trouvé ou non banni.", ephemeral: true });
            }
        } catch (error) {
            console.error("Error while trying to unban a user:", error);
            await this.interaction.reply({ content: "Une erreur s'est produite lors du déban de l'utilisateur.", ephemeral: true });
        }
    }
}

export default Ban;
