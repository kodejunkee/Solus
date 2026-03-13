export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getFileTypeFromExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const typeMap: Record<string, string> = {
    pdf: 'pdf',
    doc: 'docx',
    docx: 'docx',
    ppt: 'ppt',
    pptx: 'pptx',
    png: 'image',
    jpg: 'image',
    jpeg: 'image',
    gif: 'image',
    zip: 'zip',
    rar: 'zip',
  };
  return typeMap[ext] || 'other';
}

export function getFileTypeIcon(fileType: string): string {
  const iconMap: Record<string, string> = {
    pdf: '📄',
    docx: '📝',
    ppt: '📊',
    pptx: '📊',
    image: '🖼️',
    zip: '📦',
    other: '📎',
  };
  return iconMap[fileType] || '📎';
}

export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateString);
}
