export const STORAGE_KEYS = {
    TOKEN: 'foxriver_admin_token',
    LAST_ACTIVE: 'foxriver_admin_last_active'
};

export const TIERS = ['Intern', 'Rank 1', 'Rank 2', 'Rank 3', 'Rank 4', 'Rank 5', 'Rank 6', 'Rank 7', 'Rank 8', 'Rank 9', 'Rank 10'];


export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        VERIFY: '/auth/verify',
    },
    ADMIN: {
        STATS: '/admin/stats',
        USERS: '/admin/users',
        SETTINGS: '/admin/settings',
        COMMISSIONS: '/admin/commissions',
        SALARIES: '/admin/salaries/process',
        ADMINS: '/admin/admins',
        PROFILE: '/admin/profile',
    },
    DEPOSITS: '/deposits',
    WITHDRAWALS: '/withdrawals',
    TASKS: '/tasks',
    NEWS: '/news',
    CHAT: '/chat',
    QNA: '/qna',
    BANK: '/bank',
    MEMBERSHIPS: '/memberships',
    WEALTH: '/wealth',
    SLOT_TIERS: '/slot-tiers',
    SPIN: '/spin',
    COURSES: '/courses',
};
