import { CommandInteraction, GuildMemberRoleManager } from 'discord.js';

class Command {
  interaction: CommandInteraction;
  requiredRoles: string[] = []; // Liste des IDs des rôles nécessaires
  requiredPermissions: bigint[] = []; // Liste des permissions nécessaires

  constructor(
    interaction: CommandInteraction,
    requiredRoles: string[] = [],
    requiredPermissions: bigint[] = []
  ) {
    this.interaction = interaction;
    this.requiredRoles = requiredRoles;
    this.requiredPermissions = requiredPermissions;
  }

  async hasPermission(): Promise<boolean> {
    const member = this.interaction.member;

    // Vérification des permissions
    console.log(member);
    console.log(member?.permissions);
    console.log(this.requiredPermissions);
    console.log((member?.permissions as any).has(this.requiredPermissions));

    if (this.requiredPermissions.length > 0) {
      const hasPermission = member && (member.permissions as any).has(this.requiredPermissions);
      if (!hasPermission) {
        await this.interaction.reply({
          content: "Vous n'avez pas les permissions nécessaires pour exécuter cette commande.",
          ephemeral: true,
        });
        return false;
      }
    }

    // Vérification des rôles
    if (this.requiredRoles.length > 0) {
      if (member && member.roles instanceof GuildMemberRoleManager) {
        const hasRole = this.requiredRoles.some((roleId) =>
          (member.roles as GuildMemberRoleManager).cache.has(roleId)
        );
        if (!hasRole) {
          await this.interaction.reply({
            content: "Vous n'avez pas le rôle nécessaire pour exécuter cette commande.",
            ephemeral: true,
          });
          return false;
        }
      }
    }

    return true;
  }
}

export default Command;
