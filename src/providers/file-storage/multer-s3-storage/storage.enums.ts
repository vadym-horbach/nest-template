export enum MulterExceptionsEnum {
  LIMIT_PART_COUNT = 'Too many parts',
  LIMIT_FILE_SIZE = 'File too large',
  LIMIT_FILE_COUNT = 'Too many files',
  LIMIT_FIELD_KEY = 'Field name too long',
  LIMIT_FIELD_VALUE = 'Field value too long',
  LIMIT_FIELD_COUNT = 'Too many fields',
  LIMIT_UNEXPECTED_FILE = 'Unexpected field',
  INVALID_IMAGE_FILE_TYPE = 'Invalid Image File Type',
  // Custom
  ONLY_IMAGES_ALLOWED = 'Only images are allowed',
}
export enum ExtendedOptionsEnum {
  CREATE_THUMBNAIL = 'thumbnail',
  RESIZE_IMAGE = 'resize',
  RESIZE_IMAGE_MULTIPLE_SIZES = 'resizeMultiple',
}
