import { CommandInteraction, GuildMember, GuildMemberRoleManager } from "discord.js";
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
        const hasPermission = await this.permissionCheck();
        if (!hasPermission) return;  // Si l'utilisateur n'a pas la permission, arrête l'exécution

        const commandInteraction = this.interaction as CommandInteraction;

        if (commandInteraction.commandName === 'ban') {
            const userDiscordId = commandInteraction.options.get('user')?.user;
            const reason = commandInteraction.options.get('reason')?.value as string;

            if (commandInteraction.member && commandInteraction.member.roles instanceof GuildMemberRoleManager) {
                if (commandInteraction.member.roles.cache.some((role) => this.roleList.includes(role.name))) {
                    await commandInteraction.reply({ content: "Vous ne pouvez pas bannir un utilisateur ayant le rôle couronne.", ephemeral: true });
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

            //si l'id est le même que celui de l'utilisateur qui a lancé la commande on refuse
            console.log(userDiscordId.id);
            console.log(commandInteraction.user.id);
            
            if (userDiscordId.id === commandInteraction.user.id) {
                await commandInteraction.reply({ content: "Vous ne pouvez pas vous bannir vous-même.", ephemeral: true });
                return;
            }

            try {
                const member = await guild.members.fetch(userDiscordId);
                if (member) {
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
                if (userDiscordId) {
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
