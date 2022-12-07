export const REGEX = {
  characters: "^[A-Za-z'\\-\\s]+$",
  password: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).*$',
}

export const MESSAGE = {
  characters: "Can only include a-z or A-Z and the following special characters ( - ,  , ')",
  password:
    'Must contain at least 1 uppercase character, 1 lowercase character, 1 digit, 1 special character',
}
