import { CommandInteraction, GuildMember, GuildMemberRoleManager } from "discord.js";
import Command from "./command";
import SpotifyApi from "../model/spotify";

class Timeout extends Command {
    constructor(
        interaction: CommandInteraction,
        requiredRoles: string[],
        requiredPermissions: bigint[],
      ) {
        super(interaction, requiredRoles, requiredPermissions);
        this.run();
    }

    parseDuration(duration: string): number | null {
        const regex = /^(\d+)([smhd])$/; // Regex pour capturer les nombres suivis de 's', 'm', 'h', ou 'd'
        const match = duration.match(regex);

        if (!match) return null;

        const value = parseInt(match[1], 10);
        const unit = match[2];

        switch (unit) {
            case 's': return value * 1000; // secondes -> millisecondes
            case 'm': return value * 60 * 1000; // minutes -> millisecondes
            case 'h': return value * 60 * 60 * 1000; // heures -> millisecondes
            case 'd': return value * 24 * 60 * 60 * 1000; // jours -> millisecondes
            default: return null;
        }
    }

    async run() {
        const hasPermission = await this.hasPermission(); // Vérifie les permissions
        if (!hasPermission) return;

        if (this.interaction.commandName === 'timeout') {
            await this.handleTimeout();
        } else if (this.interaction.commandName === 'untimeout') {
            await this.handleUnTimeout();
        }
    }

    private async handleTimeout() {
        const userDiscordId = this.interaction.options.get('user')?.user;
        const durationStr = this.interaction.options.get('time')?.value as string;
        const reason = this.interaction.options.get('reason')?.value as string || "No reason provided";

        if (!durationStr) {
            await this.interaction.reply({ content: "La durée est manquante.", ephemeral: true });
            return;
        }

        const duration = this.parseDuration(durationStr);

        if (!duration || duration > 28 * 24 * 60 * 60 * 1000) {
            await this.interaction.reply({ content: "La durée spécifiée est invalide ou dépasse 28 jours.", ephemeral: true });
            return;
        }

        const guild = this.interaction.guild;
        if (!guild || !userDiscordId) {
            await this.interaction.reply({ content: "Une erreur est survenue. Vérifiez les arguments.", ephemeral: true });
            return;
        }

        try {
            const member = await guild.members.fetch(userDiscordId.id);
            if (member) {
                await member.timeout(duration, reason);
                await this.interaction.reply({ content: `${member.user.tag} a été mis en sourdine pendant ${durationStr} pour la raison suivante : ${reason}` });
            } else {
                await this.interaction.reply({ content: "Utilisateur non trouvé.", ephemeral: true });
            }
        } catch (error) {
            console.error("Error while trying to timeout a user:", error);
            await this.interaction.reply({ content: "Une erreur s'est produite lors de la mise en sourdine de l'utilisateur.", ephemeral: true });
        }
    }

    private async handleUnTimeout() {
        const userDiscordId = this.interaction.options.get('user')?.user;

        const guild = this.interaction.guild;
        if (!guild || !userDiscordId) {
            await this.interaction.reply({ content: "Une erreur est survenue. Vérifiez les arguments.", ephemeral: true });
            return;
        }

        try {
            const member = await guild.members.fetch(userDiscordId.id);
            if (member) {
                await member.timeout(null);
                await this.interaction.reply({ content: `${member.user.tag} n'est plus en sourdine.` });
            } else {
                await this.interaction.reply({ content: "Utilisateur non trouvé.", ephemeral: true });
            }
        } catch (error) {
            console.error("Error while trying to untimeout a user:", error);
            await this.interaction.reply({ content: "Une erreur s'est produite lors du retrait de la sourdine de l'utilisateur.", ephemeral: true });
        }
    }
}

export default Timeout;
