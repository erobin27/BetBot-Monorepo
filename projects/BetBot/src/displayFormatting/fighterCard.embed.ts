import { BetDto, MatchDto } from '@betbot-monorepo/betbot-backend';
import { Colors, EmbedBuilder } from 'discord.js';
import { CreateMatchRequest } from 'src/apis/backendApi/requests/createMatch.request';
import { PlaceBetRequest } from 'src/apis/backendApi/requests/placeBet.request';

export function embedSelectedFighter(
  createdMatch: CreateMatchRequest,
  placedBet: PlaceBetRequest,
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(createdMatch.matchTitle)
    .setDescription(
      `${createdMatch[placedBet.selectedCorner].name} | ${
        createdMatch.eventTitle
      }`,
    )
    .setThumbnail(createdMatch[placedBet.selectedCorner].image)
    .setTimestamp(Date.now())
    .setFooter({ text: '📬' });

  embed.addFields({
    name: `Wager`,
    value: `$${placedBet.wagerAmount}`,
    inline: true,
  });

  embed.addFields({
    name: `Odds`,
    value: `${placedBet.wagerOdds}`,
    inline: true,
  });

  embed.addFields({
    name: `Payout`,
    value: `$${placedBet.amountToPayout}`,
    inline: true,
  });

  return embed;
}

export function embedPlacedBet(match: MatchDto, bet: BetDto): EmbedBuilder {
  let color = null;
  let payoutField = bet.amountToPayout;
  switch (bet.outcome) {
    case 'WIN':
      color = Colors.Green;
      break;
    case 'LOSS':
      color = Colors.Red;
      payoutField = 0;
      break;
    case 'DRAW':
      color = Colors.White;
      payoutField = 0;
      break;
    case 'NO_CONTEST':
      color = Colors.White;
      payoutField = bet.wagerAmount;
      break;
    default:
      break;
  }

  const embed = new EmbedBuilder()
    .setTitle(match.matchTitle)
    .setDescription(`${match[bet.selectedCorner].name} | ${match.eventTitle}`)
    .setThumbnail(match[bet.selectedCorner].image)
    .setTimestamp(bet.creationDate)
    .setColor(color);

  embed.addFields({
    name: `Wager`,
    value: `$${bet.wagerAmount}`,
    inline: true,
  });

  embed.addFields({
    name: `Odds`,
    value: `${bet.wagerOdds}`,
    inline: true,
  });

  embed.addFields({
    name: `Payout`,
    value: `$${payoutField}`,
    inline: true,
  });

  return embed;
}
