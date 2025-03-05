module.exports = {
  // Mock for image files
  'png|jpg|jpeg|gif|ico|svg': 'test-image-stub',
  
  // Mock for font files
  'woff|woff2|ttf|eot': 'test-font-stub',
  
  // Mock for media files
  'mp4|webm|wav|mp3': 'test-media-stub',
  
  // Mock for document files
  'pdf|doc|docx': 'test-document-stub',
  
  // Default mock for other file types
  '*': 'test-file-stub'
};