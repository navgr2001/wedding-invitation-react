export const NAME_MAX_LENGTH = 50;
export const RSVP_MAX_GUESTS = 10;
export const RSVP_MESSAGE_MAX_LENGTH = 320;

// Allow letters, numbers, spaces, & and .
const INVALID_NAME_CHARACTERS = /[^\p{L}\p{M}\p{N} &.]/gu;

const VALID_NAME = /^[\p{L}\p{M}\p{N} &.]+$/u;

export const cleanGuestName = (value) =>
  String(value ?? "")
    .replace(INVALID_NAME_CHARACTERS, "")
    .slice(0, NAME_MAX_LENGTH);

export const isValidGuestName = (value) => {
  const name = String(value ?? "");

  return (
    name.length <= NAME_MAX_LENGTH &&
    name.trim().length > 0 &&
    VALID_NAME.test(name)
  );
};
