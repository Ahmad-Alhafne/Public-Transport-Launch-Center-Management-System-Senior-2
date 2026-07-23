export const getNotificationAccountKey = (user, token) => {
  const accountId = user?.id ?? user?.userId ?? 'anonymous';
  return `${accountId}:${token ?? ''}`;
};
