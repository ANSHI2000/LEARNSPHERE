export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
};

export const formatCurrency = (amount) => `₹${amount}`;

export const calculateCourseRevenue = (course) =>
  (course.price || 0) *
  (course.enrollments?.filter((e) => e.paymentStatus === 'paid').length || 0);

export const getPlayableVideoUrl = (value) => {
  const raw = (value || '').trim();
  if (!raw) return '';

  let normalized = raw;

  if (raw.startsWith('?v=')) {
    normalized = `https://www.youtube.com/watch${raw}`;
  } else if (/^[A-Za-z0-9_-]{11}$/.test(raw)) {
    normalized = `https://www.youtube.com/watch?v=${raw}`;
  } else if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
    normalized = `https://${raw.replace(/^\/+/, '')}`;
  }

  try {
    const parsed = new URL(normalized);

    if (parsed.hostname.includes('youtu.be')) {
      const videoId = parsed.pathname.replace('/', '').trim();
      if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
    }

    return parsed.toString();
  } catch (_e) {
    return '';
  }
};
