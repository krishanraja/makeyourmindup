type Pair = { twelveMonths: string; threeYears: string };

export const FALLBACK_PROSE: Record<string, Pair> = {
  same: {
    twelveMonths:
      'Your week settles into a shape you recognise. The work that needs you finds you. The work that does not, runs without you. You make fewer, sharper calls. You notice the difference in the room before anyone says it.',
    threeYears:
      'Your company looks like itself again, only honest about what it is. The same team, more capable. The same product, more deliberate. You run it the way you always thought you would.',
  },
  leaner: {
    twelveMonths:
      'Your week is quieter and louder at once. Half the meetings, twice the output. The people who stayed are the ones you wanted in the room. You stop apologising for the smaller team. You start defending it.',
    threeYears:
      'Your company is half the headcount and double the output. Margins are wider. Decisions are faster. The people who remain are the ones who were going to build the future anyway.',
  },
  hybrid: {
    twelveMonths:
      'Your week runs on two engines. Your team, smaller and sharper. Your agents, doing the work you used to ask for and never get. You manage one team made of both. You stop asking whether it is working.',
    threeYears:
      'Your company is a hybrid that nobody outside still calls a hybrid. Humans set direction. Agents execute. You evaluate the work, not the worker. The org chart looks like nothing you would have drawn three years ago.',
  },
  autonomous: {
    twelveMonths:
      'Your week is mostly direction and review. You set the targets. The system runs. You answer the calls that only you can answer. The rest happens whether you are awake or not.',
    threeYears:
      'Your company is a business that runs itself within the bounds you set. You are the operator of a system, not the manager of a team. The decisions are yours. The execution is theirs, and they are not people.',
  },
};
