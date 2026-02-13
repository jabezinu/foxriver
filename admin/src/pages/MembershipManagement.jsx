import { useState, useEffect } from 'react';
import { useAdminMembershipStore } from '../store/membershipStore';
import Loading from '../components/Loading';
import { toast } from 'react-hot-toast';
import PageHeader from '../components/shared/PageHeader';
import RankProgressionPanel from '../components/RankProgressionPanel';
import MembershipTierTable from '../components/MembershipTierTable';

export default function MembershipManagement() {
    const { 
        tiers, 
        restrictedRange, 
        loading, 
        fetchTiers, 
        fetchRestrictedRange, 
        setRestrictedRange, 
        clearRestrictedRange, 
        updateTierPrice, 
        toggleVisibility 
    } = useAdminMembershipStore();
    
    // Restriction state
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
    }, [fetchTiers, fetchRestrictedRange]);

    const handleToggleVisibility = async (tierId) => {
        setTogglingVisibility(prev => ({ ...prev, [tierId]: true }));
        const res = await toggleVisibility(tierId);
        if (res.success) {
            toast.success('Visibility toggled');
        } else {
            toast.error(res.message);
        }
        setTogglingVisibility(prev => ({ ...prev, [tierId]: false }));
    };

    const handleSetRestriction = async () => {
        if (!restrictStart || !restrictEnd) return toast.error('Select rank range');
        const start = parseInt(restrictStart);
        const end = parseInt(restrictEnd);
        if (start > end) return toast.error('Check range logic');
        if (end - start < 1) return toast.error('Protocol requires at least 2 ranks');

        setRestrictionLoading(true);
        const res = await setRestrictedRange({ startRank: start, endRank: end });
        if (res.success) {
            toast.success('Restricted range updated');
            setRestrictStart(''); setRestrictEnd('');
        } else {
            toast.error(res.message);
        }
        setRestrictionLoading(false);
    };

    const handleClearRestriction = async () => {
        if (!confirm('Clear all rank progression protocols?')) return;
        setRestrictionLoading(true);
        const res = await clearRestrictedRange();
        if (res.success) {
            toast.success('Range cleared');
        } else {
            toast.error(res.message);
        }
        setRestrictionLoading(false);
    };

    const handleSavePrice = async (tier) => {
        const newPrice = editingPrices[tier.id];
        if (newPrice === undefined || newPrice === tier.price) {
            setEditingPrices(prev => { const s = { ...prev }; delete s[tier.id]; return s; });
            return;
        }

        setSavingPrices(prev => ({ ...prev, [tier.id]: true }));
        const res = await updateTierPrice(tier.id, { price: newPrice });
        if (res.success) {
            toast.success('Price normalized');
            setEditingPrices(prev => { const s = { ...prev }; delete s[tier.id]; return s; });
        } else {
            toast.error(res.message);
        }
        setSavingPrices(prev => ({ ...prev, [tier.id]: false }));
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
