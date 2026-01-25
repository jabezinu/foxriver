import { useState, useEffect } from 'react';
import { HiX, HiUsers, HiChevronDown, HiChevronRight, HiIdentification } from 'react-icons/hi';
import { adminUserAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import Loading from './Loading';
import { getServerUrl } from '../config/api.config';
import Badge from './shared/Badge';

const ReferenceTreeModal = ({ isOpen, userId, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [treeData, setTreeData] = useState(null);
    const [expandedNodes, setExpandedNodes] = useState(new Set());

    useEffect(() => {
        if (isOpen && userId) {
            fetchReferenceTree();
        }
    }, [isOpen, userId]);

    const fetchReferenceTree = async () => {
        setLoading(true);
        try {
            const response = await adminUserAPI.getUserReferenceTree(userId);
            setTreeData(response.data);
            // Auto-expand first level
            setExpandedNodes(new Set(['root']));
        } catch (error) {
            toast.error('Failed to load reference tree');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleNode = (nodeId) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };

    const UserNode = ({ user, level = 0, nodeId, children = [] }) => {
        const hasChildren = children.length > 0;
        const isExpanded = expandedNodes.has(nodeId);
        const levelColors = {
            0: 'bg-blue-50 border-blue-200 text-blue-800',
            1: 'bg-green-50 border-green-200 text-green-800',
            2: 'bg-purple-50 border-purple-200 text-purple-800'
        };

        return (
            <div className="w-full">
                <div 
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 ${levelColors[level]} mb-2 transition-all hover:shadow-md`}
                    style={{ marginLeft: `${level * 20}px` }}
                >
                    {hasChildren && (
                        <button
                            onClick={() => toggleNode(nodeId)}
                            className="flex-shrink-0 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                            {isExpanded ? (
                                <HiChevronDown className="text-sm" />
                            ) : (
                                <HiChevronRight className="text-sm" />
                            )}
                        </button>
                    )}
                    
                    {!hasChildren && <div className="w-6 flex-shrink-0" />}

                    {user.profilePhoto ? (
                        <img
                            src={user.profilePhoto.startsWith('http') ? user.profilePhoto : `${getServerUrl()}${user.profilePhoto}`}
                            alt={user.name || 'User'}
                            className="w-10 h-10 rounded-lg object-cover shadow-sm border border-white flex-shrink-0"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                            {user.name ? user.name.charAt(0).toUpperCase() : <HiIdentification className="text-lg" />}
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-sm truncate">
                                {user.name || 'No name set'}
                            </h4>
                            <Badge variant={user.membershipLevel === 'Intern' ? 'gray' : 'indigo'} size="sm">
                                {user.membershipLevel}
                            </Badge>
                        </div>
                        <p className="text-xs font-mono text-gray-600 truncate">{user.phone}</p>
                        {level > 0 && (
                            <div className="text-xs font-bold mt-1">
                                Level {user.levelLabel} • {children.length} direct referrals
                            </div>
                        )}
                    </div>

                    {hasChildren && (
                        <div className="flex items-center gap-1 text-xs font-bold flex-shrink-0">
                            <HiUsers className="text-sm" />
                            <span>{children.length}</span>
                        </div>
                    )}
                </div>

                {hasChildren && isExpanded && (
                    <div className="ml-4 border-l-2 border-gray-200 pl-4">
                        {children.map((child, index) => (
                            <UserNode
                                key={child.id}
                                user={child}
                                level={level + 1}
                                nodeId={`${nodeId}-${child.id}`}
                                children={child.children || []}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Reference Tree</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Hierarchical view of user referrals up to C level
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                        <HiX className="text-xl text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col min-h-0">
                    {loading ? (
                        <div className="h-64">
                            <Loading />
                        </div>
                    ) : treeData ? (
                        <>
                            {/* Stats */}
                            <div className="flex-shrink-0 p-6 bg-gray-50 border-b border-gray-200">
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">{treeData.stats.aLevel}</div>
                                        <div className="text-xs font-bold text-gray-600 uppercase">A Level</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">{treeData.stats.bLevel}</div>
                                        <div className="text-xs font-bold text-gray-600 uppercase">B Level</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">{treeData.stats.cLevel}</div>
                                        <div className="text-xs font-bold text-gray-600 uppercase">C Level</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-800">{treeData.stats.total}</div>
                                        <div className="text-xs font-bold text-gray-600 uppercase">Total</div>
                                    </div>
                                </div>
                            </div>

                            {/* Tree - Scrollable Area */}
                            <div className="flex-1 overflow-y-auto min-h-0">
                                <div className="p-6">
                                    {treeData.referenceTree.length > 0 ? (
                                        <div className="space-y-2">
                                            {/* Root User */}
                                            <UserNode
                                                user={treeData.user}
                                                level={0}
                                                nodeId="root"
                                                children={treeData.referenceTree}
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <HiUsers className="text-6xl text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-bold text-gray-600 mb-2">No Referrals Found</h3>
                                            <p className="text-gray-500">This user hasn't referred anyone yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <p className="text-gray-500">Failed to load reference tree</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReferenceTreeModal;