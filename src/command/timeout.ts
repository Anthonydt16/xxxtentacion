import { CommandInteraction, GuildMember, GuildMemberRoleManager } from "discord.js";
import Command from "./command";
import SpotifyApi from "../model/spotify";

class Timeout extends Command {
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
        const hasPermission = await this.permissionCheck();
        if (!hasPermission) return;  // Si l'utilisateur n'a pas la permission, arrête l'exécution
        if (this.interaction.commandName === 'timeout') {
            const userDiscordId = this.interaction.options.get('user')?.user;
            const durationStr = this.interaction.options.get('time')?.value as string;
            const reason = this.interaction.options.get('reason')?.value as string || "No reason provided";

            const duration = this.parseDuration(durationStr);

            if (!duration || duration > 28 * 24 * 60 * 60 * 1000) {
                await this.interaction.reply({ content: "La durée spécifiée est invalide ou dépasse 28 jours.", ephemeral: true });
                return;
            }

            // Vérifier si l'utilisateur est protégé par un rôle
            if (this.interaction.member && this.interaction.member.roles instanceof GuildMemberRoleManager) {
                if (!this.interaction.member.roles.cache.some((role) => this.roleList.includes(role.name))) {
                    await this.interaction.reply({ content: "Vous ne pouvez pas mettre en sourdine un utilisateur ayant le rôle couronne.", ephemeral: true });
                    return;
                }
            }

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
                // Fetch the member to timeout
                const member = await guild.members.fetch(userDiscordId);

                if (member) {
                    // Mute the member
                    await member.timeout(duration, reason);
                    await this.interaction.reply({ content: `${member.user.tag} a été mis en sourdine pendant ${durationStr} pour la raison suivante : ${reason}` });
                } else {
                    await this.interaction.reply({ content: "Utilisateur non trouvé.", ephemeral: true });
                }
            } catch (error) {
                console.error("Error while trying to timeout a user:", error);
                await this.interaction.reply({ content: "Une erreur s'est produite lors de la mise en sourdine de l'utilisateur.", ephemeral: true });
            }
        } else if (this.interaction.commandName === 'untimeout') {
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
                // Fetch the member to untimeout
                const member = await guild.members.fetch(userDiscordId);

                if (member) {
                    // Unmute the member by setting timeout to null
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
}

export default Timeout;
