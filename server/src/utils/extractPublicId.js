const extractPublicId = url => {
  if (!url.includes('cloudinary.com')) return null;
  
  const parts = url.split('/');
  const uploadIndex = parts.findIndex(part => part === 'upload');
  return parts.slice(uploadIndex + 2).join('/').split('.')[0]; 
}

export default extractPublicId;