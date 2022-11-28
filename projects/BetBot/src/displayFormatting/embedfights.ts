import { Colors, Embed, EmbedBuilder, EmbedData } from 'discord.js';
import { UfcEventResponse } from 'src/apis/ufcApi/responses/ufcEvent.response';
import { logServer } from '../utils';

function pagifyFightEmbeds(
  apiResponse: UfcEventResponse,
  matchupList: string[],
  embedTemplate,
): EmbedBuilder[] {
  let embedReturnList: EmbedBuilder[] = [];
  const numberOfMatches = matchupList.length;

  let embed = new EmbedBuilder(embedTemplate);
  let pageNumber = 1;
  for (let i = 0; i < numberOfMatches; i++) {
    if (i % 7 == 0 && i != 0) {
      embedReturnList.push(embed);
      embed = new EmbedBuilder({
        color: Colors.Green,
        footer: { text: `${pageNumber}` },
      });
      pageNumber++;
      embed.setFooter({
        text: `Page ${pageNumber}\n________________________________________________________________`,
      });
    }

    const { Red, Blue } = apiResponse.fights[matchupList[i]];
    embed.addFields({
      name: `**${i + 1}**`,
      value: '\u200B',
      inline: true,
    });
    embed.addFields({
      name: `__${Red.name}__`,
      value: Red.odds,
      inline: true,
    });
    embed.addFields({
      name: `__${Blue.name}__`,
      value: Blue.odds,
      inline: true,
    });

    if (i == numberOfMatches - 1) {
      embedReturnList.push(embed);
    }
  }

  return embedReturnList;
}

export function embedFights(apiResponse: UfcEventResponse): EmbedBuilder[] {
  const matchupList: string[] = Object.keys(apiResponse.fights);
  const embedTemplate: EmbedData = {
    title: apiResponse.eventTitle,
    description: apiResponse.date,
    url: apiResponse.url,
    color: Colors.Green,
    thumbnail: { url: apiResponse.image },
    author: {
      name: 'BetBot',
      iconURL:
        'https://cdn.discordapp.com/avatars/895536293356924979/fc5defd0df0442bd4a2326e552c11899.png?size=32',
    },
  };

  const embedList = pagifyFightEmbeds(
    apiResponse,
    matchupList,
    embedTemplate,
  );

  return embedList;
}

export function embedFighterChoice(apiResponse: UfcEventResponse, chosenMatch) {
  const matchUpData = apiResponse.fights[chosenMatch];

  const embed = new EmbedBuilder().setTitle('Who would you like to bet on?');

  embed.addFields({
    name: `__${matchUpData.Red.name}__`,
    value: matchUpData.Red.odds,
    inline: true,
  });

  embed.addFields({
    name: '\u200B \u200B \u200B',
    value: '\u200B \u200B \u200B',
    inline: true,
  })

  embed.addFields({
    name: `__${matchUpData.Blue.name}__`,
    value: matchUpData.Blue.odds,
    inline: true,
  });

  return embed;
}
