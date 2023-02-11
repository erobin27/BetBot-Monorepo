import { EmbedBuilder } from 'discord.js';
import { betbotLogo } from '@utils/constants';

export function embedValidationMessage(): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle('🔎 Validating')
    .setDescription('Placing bet and validating wager please wait...')
    .setFooter({ text: 'betbot', iconURL: betbotLogo });

  return embed;
}

export function embedWaitMessage(): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle('💬 Retrieving Data')
    .setDescription(
      'Getting UFC data this could take a few seconds, please wait...',
    )
    .setFooter({ text: 'betbot', iconURL: betbotLogo });

  return embed;
}
