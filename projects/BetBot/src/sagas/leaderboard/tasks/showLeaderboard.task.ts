import {
  getButtonInteraction,
  getSelectOptionInteraction,
  listToSelectOptions,
} from '@displayFormatting';
import { embedCancellation } from '@displayFormatting/cancellation.embed';
import { embedsToPages } from '@displayFormatting/embedsToPages';
import { embedLeaderboard } from '@displayFormatting/leaderboard.embed';
import { messageBuilder } from '@displayFormatting/messageBuilder';
import {
  ActionRowBuilder,
  ButtonInteraction,
  CacheType,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  User,
} from 'discord.js';
import { TaskError } from 'src/sagas/framework/error';
import { ITaskData } from 'src/sagas/framework/task';
import { v4 as uuidv4 } from 'uuid';

export async function showLeaderboardTask(
  input: ITaskData,
): Promise<ITaskData> {
  const userEmbeds = [];
  const sortChoice =
    Object.keys(input.sort)[0].split('.')[1].slice(0, -1) || 'walletAmount';
  let count = 1;
  let statKeys = [];
  const uniqueId = uuidv4();
  // eslint-disable-next-line no-restricted-syntax
  for (const user of input.guildUsers) {
    if (statKeys.length === 0) statKeys = Object.keys(user.stats);

    let discordUser: User = input.interaction.guild.client.users.cache.get(
      user.userId,
    );
    if (!discordUser)
      // TODO: fix this
      // eslint-disable-next-line no-await-in-loop
      discordUser = await input.interaction.guild.client.users.fetch(
        user.userId,
      );

    if (discordUser) {
      userEmbeds.push(embedLeaderboard(discordUser, user.stats, count));
      count += 1;
    }
  }

  const selctor = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`StatSort-${uniqueId}`)
      .setPlaceholder(sortChoice)
      .addOptions(
        listToSelectOptions(
          statKeys.filter((item) => item !== sortChoice), // Remove the currently selected sort option from the list
          false,
        ),
      ),
  );

  const msg = embedsToPages(userEmbeds, input.selectedPage || 0, {
    uuid: uniqueId,
  });
  msg.components.push(selctor as never);

  const leaderBoardMsg = await input.interaction.editReply(msg);

  const buttonRes = getButtonInteraction(
    leaderBoardMsg,
    input.interaction.user.id,
    { uuid: uniqueId, deferUpdate: true },
  );
  const selectionRes = getSelectOptionInteraction(
    leaderBoardMsg,
    input.interaction.user.id,
    { uuid: uniqueId, deferUpdate: true },
  );

  const response = await Promise.race([buttonRes, selectionRes]);
  // END CASES:
  // Timeout
  if (!response) {
    throw new TaskError('Leaderboard Viewing Timeout.', {
      interaction: input.interaction,
      action: 'EDIT',
      message: messageBuilder(
        {
          ...embedsToPages(userEmbeds, input.selectedPage, {
            timeout: true,
          }),
          content:
            'Response Timed out do /leaderboard again to select a new page.',
        },
        true,
      ),
    });
  }

  // Cancel
  if (response.customId.startsWith('Cancel')) {
    throw new TaskError('Cancelled Leaderboard Viewing.', {
      interaction: input.interaction,
      action: 'EDIT',
      message: messageBuilder({
        embeds: [
          embedCancellation(
            'Leaderboard',
            'You have stopped viewing your leaderboard, please use /leaderboard to restart.',
          ),
        ],
      }),
    });
  }

  let sort = {};
  if (response instanceof StringSelectMenuInteraction<CacheType>) {
    sort[`sort[stats.${response.values[0]}]`] = 'desc';
  } else {
    sort = input.sort;
  }

  const selectedPage =
    response instanceof ButtonInteraction<CacheType>
      ? Number(response.customId.split('|')[0])
      : input.selectedPage;

  return { selectedPage, sort };
}
