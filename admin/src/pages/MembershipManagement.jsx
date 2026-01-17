import { useState, useEffect } from 'react';
import { adminMembershipAPI } from '../services/api';
import Loading from '../components/Loading';
import { toast } from 'react-hot-toast';
import PageHeader from '../components/shared/PageHeader';
import RankProgressionPanel from '../components/RankProgressionPanel';
import MembershipTierTable from '../components/MembershipTierTable';

export default function MembershipManagement() {
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Restriction state
    const [restrictedRange, setRestrictedRange] = useState(null);
    const [restrictStart, setRestrictStart] = useState('');
    const [restrictEnd, setRestrictEnd] = useState('');
    const [restrictionLoading, setRestrictionLoading] = useState(false);

    // Price editing state
    const [editingPrices, setEditingPrices] = useState({});
    const [savingPrices, setSavingPrices] = useState({});

    // Visibility toggling state
    const [togglingVisibility, setTogglingVisibility] = useState({});

    useEffect(() => {
        fetchTiers();
        fetchRestrictedRange();
    }, []);

    const fetchTiers = async () => {
        try {
            setLoading(true);
            const res = await adminMembershipAPI.getAllTiers();
            setTiers(res.data.tiers);
        } catch (error) {
            toast.error('Failed to fetch tiers');
        } finally {
            setLoading(false);
        }
    };

    const fetchRestrictedRange = async () => {
        try {
            const res = await adminMembershipAPI.getRestrictedRange();
            setRestrictedRange(res.data.restrictedRange);
        } catch (error) { }
    };

    const handleToggleVisibility = async (tierId) => {
        try {
            setTogglingVisibility(prev => ({ ...prev, [tierId]: true }));
            const res = await adminMembershipAPI.toggleVisibility(tierId);
            toast.success(res.data.message);
            fetchTiers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to toggle visibility');
        } finally {
            setTogglingVisibility(prev => ({ ...prev, [tierId]: false }));
        }
    };

    const handleSetRestriction = async () => {
        if (!restrictStart || !restrictEnd) return toast.error('Select rank range');
        const start = parseInt(restrictStart);
        const end = parseInt(restrictEnd);
        if (start > end) return toast.error('Check range logic');
        if (end - start < 1) return toast.error('Protocol requires at least 2 ranks');

        try {
            setRestrictionLoading(true);
            const res = await adminMembershipAPI.setRestrictedRange({ startRank: start, endRank: end });
            toast.success(res.data.message);
            fetchRestrictedRange();
            setRestrictStart(''); setRestrictEnd('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update protocol');
        } finally {
            setRestrictionLoading(false);
        }
    };

    const handleClearRestriction = async () => {
        if (!confirm('Clear all rank progression protocols?')) return;
        try {
            setRestrictionLoading(true);
            const res = await adminMembershipAPI.clearRestrictedRange();
            toast.success(res.data.message);
            fetchRestrictedRange();
        } catch (error) {
            toast.error('Failed to clear protocol');
        } finally {
            setRestrictionLoading(false);
        }
    };

    const handleSavePrice = async (tier) => {
        const newPrice = editingPrices[tier.id];
        if (newPrice === undefined || newPrice === tier.price) {
            setEditingPrices(prev => { const s = { ...prev }; delete s[tier.id]; return s; });
            return;
        }

        try {
            setSavingPrices(prev => ({ ...prev, [tier.id]: true }));
            const res = await adminMembershipAPI.updatePrice(tier.id, { price: newPrice });
            toast.success('Price normalized');
            fetchTiers();
            setEditingPrices(prev => { const s = { ...prev }; delete s[tier.id]; return s; });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to sync price');
        } finally {
            setSavingPrices(prev => ({ ...prev, [tier.id]: false }));
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="animate-fadeIn">
            <PageHeader
                title="Membership Matrix"
                subtitle="Configure personnel clearance, rank protocols, and valuation scales."
            />

            <RankProgressionPanel
                restrictedRange={restrictedRange}
                start={restrictStart} setStart={setRestrictStart}
                end={restrictEnd} setEnd={setRestrictEnd}
                onSet={handleSetRestriction}
                onClear={handleClearRestriction}
                loading={restrictionLoading}
            />

            <MembershipTierTable
                tiers={tiers}
                editingPrices={editingPrices}
                onEditPrice={(id, price) => setEditingPrices(prev => ({ ...prev, [id]: price }))}
                onCancelEdit={(id) => setEditingPrices(prev => { const s = { ...prev }; delete s[id]; return s; })}
                onPriceChange={(id, val) => {
                    const n = parseFloat(val);
                    if (!isNaN(n) && n >= 0) setEditingPrices(prev => ({ ...prev, [id]: n }));
                }}
                onSavePrice={handleSavePrice}
                savingPrices={savingPrices}
                onToggleVisibility={handleToggleVisibility}
                togglingVisibility={togglingVisibility}
            />
        </div>
    );
}
