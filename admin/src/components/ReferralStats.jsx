import React from 'react';
import { HiCurrencyDollar, HiUserGroup, HiTrendingUp } from 'react-icons/hi';
import StatCard from './shared/StatCard';

export default function ReferralStats({ commissions }) {
    const totalEarned = commissions.reduce((sum, c) => sum + (c.amountEarned || 0), 0);
    const todayCommissions = commissions
        .filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString())
        .reduce((sum, c) => sum + (c.amountEarned || 0), 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
                label="Total Disbursement"
                value={`${totalEarned.toLocaleString()} ETB`}
                icon={<HiCurrencyDollar />}
                trend={{ value: 'System Total', isPositive: true, label: 'Audit Log' }}
                color="green"
            />
            <StatCard
                label="Network Transactions"
                value={commissions.length.toLocaleString()}
                icon={<HiUserGroup />}
                trend={{ value: commissions.length, isPositive: true, label: 'Audit Log Count' }}
                color="blue"
            />
            <StatCard
                label="Daily Velocity"
                value={`${todayCommissions.toLocaleString()} ETB`}
                icon={<HiTrendingUp />}
                trend={{ value: 'Active', isPositive: true, label: '24h Pulse' }}
                color="indigo"
            />
        </div>
    );
}
