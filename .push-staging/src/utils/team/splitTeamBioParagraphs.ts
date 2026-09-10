/** Разбивает bio из `teamData` на абзацы (`\n\n` между блоками). */
export const splitTeamBioParagraphs = (bio: string): string[] =>
  bio.split('\n\n').map(paragraph => paragraph.trim()).filter(Boolean);
