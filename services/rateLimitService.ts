export const rateLimitService = {
  getInfo: () => ({
    limit: null,
    remaining: null,
    reset: null
  }),
  getStats: () => ({
    totalBlocked: 0,
    activeWindows: 0,
    logs: [] as any[]
  })
};

export default rateLimitService;
