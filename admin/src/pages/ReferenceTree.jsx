import { useState } from 'react';
import { useAdminUserStore } from '../store/userStore';
import { HiSearch, HiUsers, HiIdentification, HiChevronDown, HiChevronRight } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import Loading from '../components/Loading';
import { getServerUrl } from '../config/api.config';
import Card from '../components/shared/Card';
import Badge from '../components/shared/Badge';
import PageHeader from '../components/shared/PageHeader';

export default function ReferenceTree() {
    const { fetchUserReferenceTree } = useAdminUserStore();
    const [searchId, setSearchId] = useState('');
    const [treeData, setTreeData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [expandedNodes, setExpandedNodes] = useState(new Set());

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchId.trim()) return;
        setLoading(true);
        const res = await fetchUserReferenceTree(searchId);
        if (res.success) {
            setTreeData(res.data);
            setExpandedNodes(new Set([res.data.id]));
        } else {
            toast.error(res.message);
        }
        setLoading(false);
    };

    const toggleNode = (id) => {
        setExpandedNodes(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const renderNode = (node, level = 0) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedNodes.has(node.id);

        return (
            <div key={node.id} className="select-none">
                <div 
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer hover:bg-gray-50 ${level === 0 ? 'bg-indigo-50/50 border border-indigo-100' : ''}`}
                    style={{ marginLeft: `${level * 24}px` }}
                    onClick={() => hasChildren && toggleNode(node.id)}
                >
                    {hasChildren ? (
                        isExpanded ? <HiChevronDown className="text-gray-400" /> : <HiChevronRight className="text-gray-400" />
                    ) : (
                        <div className="w-4" />
                    )}
                    
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white flex-shrink-0">
                        {node.avatar ? (
                            <img src={node.avatar.startsWith('http') ? node.avatar : `${getServerUrl()}${node.avatar}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-xs uppercase">
                                {node.name?.charAt(0) || 'U'}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800 text-sm">{node.name}</span>
                            <Badge variant={node.membershipLevel?.toLowerCase() || 'standard'}>
                                {node.membershipLevel || 'Level 0'}
                            </Badge>
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{node.phone}</span>
                    </div>

                    <div className="ml-auto flex items-center gap-4 px-4 border-l border-gray-100">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-gray-400 font-black uppercase">Directs</span>
                            <span className="text-xs font-bold text-gray-700">{node.children?.length || 0}</span>
                        </div>
                    </div>
                </div>

                {hasChildren && isExpanded && (
                    <div className="mt-1 space-y-1">
                        {node.children.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="animate-fadeIn space-y-8">
            <PageHeader 
                title="Node Ancestry Trace"
                subtitle="Visualize multi-level referral hierarchy and personnel genealogy within the network matrix."
            />

            <Card className="p-6">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="relative flex-1">
                        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Enter User UUID or Phone Signal to trace ancestry..."
                            className="admin-input pl-12"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="admin-btn-primary px-8" disabled={loading}>
                        {loading ? 'Scanning...' : 'Initiate Trace'}
                    </button>
                </form>
            </Card>

            {loading ? (
                <div className="py-24"><Loading /></div>
            ) : treeData ? (
                <Card className="p-8">
                    <div className="space-y-4">
                        {renderNode(treeData)}
                    </div>
                </Card>
            ) : (
                <div className="py-32 text-center flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl text-gray-300">
                    <HiUsers className="text-6xl mb-6 opacity-20" />
                    <p className="font-black uppercase tracking-[0.3em] text-[10px] mb-2 text-gray-400">Ancestry Core Offline</p>
                    <p className="text-xs font-bold max-w-xs leading-relaxed">Awaiting personnel identification signal to visualize network hierarchy.</p>
                </div>
            )}
        </div>
    );
}