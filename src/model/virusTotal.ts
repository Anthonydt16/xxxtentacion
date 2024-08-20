import { Client, EmbedBuilder, TextChannel, User } from "discord.js";

class VirusTotal {
    apikey: string;
    channelIdLogVirusTotal: string;
    constructor(){
        this.apikey = process.env.VIRUSTOTAL_TOKEN || '';
        this.channelIdLogVirusTotal = process.env.CHANNEL_ID_LOG_VIRUSTOTAL || '';
    }

    async getReport(url: string){
        const response = await fetch(`https://www.virustotal.com/vtapi/v2/url/report?apikey=${this.apikey}&resource=${url}`);
        const json = await response.json();
        return json;
    }

    async logVirusTotal(url: string, report: any, user: User, client: Client) {
        const logEmbed = new EmbedBuilder()
            .setColor(0xff0000)
            .setTitle('Lien bloqué par VirusTotal')
            .setDescription(`Le lien (${url}) a été bloqué par VirusTotal car ${report.positives}/${report.total} moteurs de détection ont détecté un virus.`)
            .setFooter({
                text: `Demandé par ${user.tag}, id: ${user.id}`,
                iconURL: user.displayAvatarURL()
            });
    
        // Récupérer l'ID du channel depuis les variables d'environnement
        const channelIdLogVirusTotal = process.env.CHANNEL_ID_LOG_VIRUSTOTAL;
        
        if (!channelIdLogVirusTotal) {
            console.error('CHANNEL_ID_LOG_VIRUSTOTAL non défini dans le fichier .env');
            return;
        }
    
        const channel = await client.channels.fetch(channelIdLogVirusTotal);
    
        if (channel && channel.isTextBased()) {
            await (channel as TextChannel).send({ embeds: [logEmbed] });
        } else {
            console.error('Le channel spécifié pour le log de VirusTotal est introuvable ou n\'est pas un TextChannel');
        }
    }
    
    
}

export default VirusTotal;