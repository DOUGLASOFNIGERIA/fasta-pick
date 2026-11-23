export const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const titleCase = (value = '') =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const statusInfo = (status) => {
  const map = {
    pending: { label: 'Order received', color: '#B45309', bg: '#FFF3D6', step: 0 },
    confirmed: { label: 'Confirmed', color: '#B45309', bg: '#FFF3D6', step: 1 },
    preparing: { label: 'Preparing your food', color: '#EA580C', bg: '#FFEAD9', step: 2 },
    ready_for_pickup: {
      label: 'Ready for pickup',
      color: '#B45309',
      bg: '#FFF3D6',
      step: 3,
    },
    on_the_way: { label: 'On the way', color: '#2563EB', bg: '#E6EFFD', step: 4 },
    delivered: { label: 'Delivered', color: '#16803C', bg: '#E6F6EC', step: 5 },
    cancelled: { label: 'Cancelled', color: '#D92D20', bg: '#FDECEA', step: -1 },
  };
  return map[status] || map.pending;
};

export const orderCode = (id = '') => id.toString().slice(-6).toUpperCase();

export const firstName = (name = '') => name.split(' ')[0] || 'there';
