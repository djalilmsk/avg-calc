const MAX_SHOWS_BEFORE_COOLDOWN = 2;
const REQUIRED_DISTINCT_GIFS_AFTER_COOLDOWN = 2;

export function createReactionPickerState() {
  return {
    lastReaction: null,
    reactions: new Map(),
  };
}

function getReactionState(pickerState, reaction) {
  if (!pickerState.reactions.has(reaction)) {
    pickerState.reactions.set(reaction, {
      showsSinceCooldown: 0,
      coolingDown: false,
      cooldownSeen: new Set(),
    });
  }

  return pickerState.reactions.get(reaction);
}

function isCoolingDown(reactionState) {
  return reactionState.coolingDown;
}

function updateCooldowns(pickerState, selectedReaction) {
  for (const [reaction, reactionState] of pickerState.reactions) {
    if (reaction === selectedReaction || !isCoolingDown(reactionState)) continue;

    reactionState.cooldownSeen.add(selectedReaction);

    if (
      reactionState.cooldownSeen.size >= REQUIRED_DISTINCT_GIFS_AFTER_COOLDOWN
    ) {
      reactionState.showsSinceCooldown = 0;
      reactionState.coolingDown = false;
      reactionState.cooldownSeen.clear();
    }
  }
}

function rememberReaction(pickerState, selectedReaction) {
  updateCooldowns(pickerState, selectedReaction);

  const selectedState = getReactionState(pickerState, selectedReaction);

  if (isCoolingDown(selectedState)) {
    selectedState.showsSinceCooldown = 0;
    selectedState.coolingDown = false;
    selectedState.cooldownSeen.clear();
  }

  selectedState.showsSinceCooldown += 1;

  if (selectedState.showsSinceCooldown >= MAX_SHOWS_BEFORE_COOLDOWN) {
    selectedState.showsSinceCooldown = MAX_SHOWS_BEFORE_COOLDOWN;
    selectedState.coolingDown = true;
    selectedState.cooldownSeen.clear();
  }

  pickerState.lastReaction = selectedReaction;
}

function pickRandomReaction(reactions) {
  const index = Math.floor(Math.random() * reactions.length);
  return reactions[index];
}

export function pickNextReaction(reactions, pickerState) {
  const uniqueReactions = [...new Set(reactions)].filter(Boolean);

  if (uniqueReactions.length === 0) return null;

  const nonRepeatingReactions = uniqueReactions.filter(
    (reaction) => reaction !== pickerState.lastReaction,
  );
  const repetitionSafeReactions =
    nonRepeatingReactions.length > 0 ? nonRepeatingReactions : uniqueReactions;
  const eligibleReactions = repetitionSafeReactions.filter(
    (reaction) => !isCoolingDown(getReactionState(pickerState, reaction)),
  );
  const pickableReactions =
    eligibleReactions.length > 0 ? eligibleReactions : repetitionSafeReactions;
  const selectedReaction = pickRandomReaction(pickableReactions);

  rememberReaction(pickerState, selectedReaction);

  return selectedReaction;
}
