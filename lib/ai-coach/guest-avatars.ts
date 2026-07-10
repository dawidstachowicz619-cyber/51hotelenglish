import {
  getGuestAvatarByCharacter,
  getGuestAvatarPosition,
  getGuestCharacter,
} from "@/lib/ai-coach/guest-characters";

export function getGuestAvatar(scenarioId: string, characterId?: string): string {
  if (characterId) return getGuestAvatarByCharacter(characterId);
  return getGuestAvatarByCharacter("anderson");
}

export function getGuestAvatarForScenario(characterId: string): {
  url: string;
  position: string;
  name: string;
  persona: string;
} {
  const character = getGuestCharacter(characterId);
  return {
    url: getGuestAvatarByCharacter(characterId),
    position: getGuestAvatarPosition(characterId),
    name: character?.name ?? "",
    persona: character?.persona ?? "",
  };
}
