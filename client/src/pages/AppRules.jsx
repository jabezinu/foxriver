import { useState, useEffect } from 'react';
import { ArrowLeft, Info, TrendingUp, Users, Award, DollarSign, Video, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import Loading from '../components/Loading';

export default function AppRules() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState(null);
    const [expandedSection, setExpandedSection] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await userAPI.getSystemSettings();
            setSettings(res.data.settings);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    if (loading) return <Loading />;

    const rules = [
        {
            id: 'membership',
            title: 'Membership Levels',
            icon: Award,
            color: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
            content: [
                {
                    subtitle: 'Available Levels',
                    text: 'The platform offers 11 membership levels: Intern, Rank 1 through Rank 10. Each level provides different benefits and earning potential.'
                },
                {
                    subtitle: 'Daily Income',
                    text: 'Intern members earn 50 ETB per day. For paid memberships (Rank 1-10), daily income is calculated as: Membership Price ÷ 26 days (excluding Sundays).'
                },
                {
                    subtitle: 'Video Task Income',
                    text: 'Intern members earn 12.5 ETB per video. For paid memberships, income per video is: Daily Income ÷ 4 videos.'
                },
                {
                    subtitle: 'Withdrawal Rights',
                    text: 'Only paid membership levels (Rank 1 and above) can withdraw funds. Intern members cannot withdraw.'
                },
                {
                    subtitle: 'Upgrading',
                    text: 'You can upgrade to any higher membership level at any time using your Personal Wallet. Upgrades are processed instantly with no waiting time. Some rank ranges may require sequential progression - check with support for current restrictions.'
                }
            ]
        },
        {
            id: 'tasks',
            title: 'Video Tasks',
            icon: Video,
            color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
            content: [
                {
                    subtitle: 'Daily Videos',
                    text: `You can watch ${settings?.videosPerDay || 4} videos per day to earn income. Videos reset daily at midnight.`
                },
                {
                    subtitle: 'Watch Requirements',
                    text: `Each video must be watched for at least ${settings?.videoWatchTimeRequired || 8} seconds to qualify for payment.`
                },
                {
                    subtitle: 'Payment',
                    text: `Intern: ${settings?.videoPaymentAmount || 10} ETB per video. Paid memberships: Based on your membership level's daily income divided by 5.`
                },
                {
                    subtitle: 'Earnings Wallet',
                    text: 'All video task earnings go directly to your Income Wallet. You can use this wallet to upgrade membership or withdraw funds (if eligible).'
                }
            ]
        },
        {
            id: 'commission',
            title: 'Referral Commission System',
            icon: TrendingUp,
            color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
            content: [
                {
                    subtitle: 'Commission Levels',
                    text: `A-Level (Direct Referrals): ${settings?.commissionPercentA || 10}% commission\nB-Level (2nd Generation): ${settings?.commissionPercentB || 5}% commission\nC-Level (3rd Generation): ${settings?.commissionPercentC || 2}% commission`
                },
                {
                    subtitle: 'Eligibility Rules',
                    text: 'You earn commission from your referrals ONLY when:\n1. Your referral is NOT an Intern\n2. Your referral\'s membership level is EQUAL TO or LOWER than your level'
                },
                {
                    subtitle: 'Example 1: Equal Level',
                    text: 'If you are Rank 3 and your referral is Rank 3, you earn commission from their activities. ✅'
                },
                {
                    subtitle: 'Example 2: Lower Level',
                    text: 'If you are Rank 5 and your referral is Rank 2, you earn commission from their activities. ✅'
                },
                {
                    subtitle: 'Example 3: Higher Level',
                    text: 'If you are Rank 2 and your referral upgrades to Rank 5, you NO LONGER earn commission from them. ❌'
                },
                {
                    subtitle: 'Example 4: Intern Referral',
                    text: 'If your referral stays as Intern, you earn NO commission regardless of your level. ❌'
                },
                {
                    subtitle: 'Commission Sources',
                    text: 'You earn commission from:\n• Video task completions by qualified referrals\n• Membership purchases by qualified referrals'
                },
                {
                    subtitle: 'Upgrade to Earn More',
                    text: 'To continue earning from referrals who upgrade, make sure your membership level stays equal to or higher than theirs!'
                }
            ]
        },
        {
            id: 'salary',
            title: 'Monthly Salary Program',
            icon: DollarSign,
            color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
            content: [
                {
                    subtitle: 'Direct Referral Bonuses',
                    text: `${settings?.salaryDirect10Threshold || 10} Direct Referrals: ${settings?.salaryDirect10Amount || 10000} ETB/month\n${settings?.salaryDirect15Threshold || 15} Direct Referrals: ${settings?.salaryDirect15Amount || 15000} ETB/month\n${settings?.salaryDirect20Threshold || 20} Direct Referrals: ${settings?.salaryDirect20Amount || 20000} ETB/month`
                },
                {
                    subtitle: 'Network Bonus',
                    text: `${settings?.salaryNetwork40Threshold || 40} Total Network Members: ${settings?.salaryNetwork40Amount || 48000} ETB/month`
                },
                {
                    subtitle: 'Counting Rules',
                    text: 'Only referrals that meet these criteria are counted:\n1. NOT an Intern\n2. Membership level EQUAL TO or LOWER than yours'
                },
                {
                    subtitle: 'Payment Schedule',
                    text: 'Salaries are calculated and paid monthly. Check your Team page to see your current qualified referral count.'
                }
            ]
        },
        {
            id: 'wallets',
            title: 'Wallet System',
            icon: Shield,
            color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
            content: [
                {
                    subtitle: 'Income Wallet',
                    text: 'Receives:\n• Video task earnings\n• Referral commissions\n• Monthly salary payments\n\nCan be used for:\n• Membership upgrades\n• Withdrawals (if eligible)'
                },
                {
                    subtitle: 'Personal Wallet',
                    text: 'Receives:\n• Deposits you make\n\nCan be used for:\n• Membership upgrades\n• Withdrawals (if eligible)'
                },
                {
                    subtitle: 'Withdrawal Requirements',
                    text: '• Must have Rank 1 or higher membership\n• Must set up bank account in Settings\n• Must set 6-digit transaction PIN\n• Bank account changes require 3-day verification'
                }
            ]
        },
        {
            id: 'team',
            title: 'Team & Referrals',
            icon: Users,
            color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
            content: [
                {
                    subtitle: 'Referral Link',
                    text: 'Share your unique referral link to invite new members. Find it on your Team page.'
                },
                {
                    subtitle: 'Team Structure',
                    text: 'Your team consists of:\n• A-Level: Your direct referrals\n• B-Level: Referrals of your referrals\n• C-Level: Third generation referrals'
                },
                {
                    subtitle: 'Team Benefits',
                    text: 'Building a strong team helps you:\n• Earn more commissions\n• Qualify for monthly salaries\n• Grow passive income'
                },
                {
                    subtitle: 'Best Practices',
                    text: '• Encourage your referrals to upgrade their membership\n• Keep your membership level competitive\n• Support your team members to succeed'
                }
            ]
        }
    ];

    return (
        <div className="animate-fade-in min-h-screen bg-zinc-950 pb-20">
            {/* Header */}
            <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-3 flex items-center gap-4 sticky top-0 z-30 border-b border-zinc-800">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="flex items-center gap-2">
                    <Info size={24} className="text-primary-500" />
                    <h1 className="text-xl font-bold text-white">App Rules & Guide</h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">
                {/* Introduction */}
                <div className="bg-gradient-to-br from-primary-500/10 to-violet-500/10 rounded-2xl p-5 mb-6 border border-primary-500/20">
                    <h2 className="text-lg font-bold text-white mb-2">Welcome! 👋</h2>
                    <p className="text-sm text-zinc-300 leading-relaxed">
                        This guide explains how our platform works, including membership levels, earning opportunities, 
                        commission rules, and more. Tap any section below to learn more.
                    </p>
                </div>

                {/* Rules Sections */}
                <div className="space-y-3">
                    {rules.map((rule) => (
                        <div
                            key={rule.id}
                            className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden"
                        >
                            {/* Section Header */}
                            <button
                                onClick={() => toggleSection(rule.id)}
                                className="w-full p-4 flex items-center gap-4 hover:bg-zinc-800/50 transition-colors"
                            >
                                <div className={`p-3 rounded-xl border ${rule.color}`}>
                                    <rule.icon size={22} />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-bold text-white text-base">{rule.title}</p>
                                </div>
                                {expandedSection === rule.id ? (
                                    <ChevronUp size={20} className="text-zinc-400" />
                                ) : (
                                    <ChevronDown size={20} className="text-zinc-400" />
                                )}
                            </button>

                            {/* Section Content */}
                            {expandedSection === rule.id && (
                                <div className="px-4 pb-4 space-y-4 border-t border-zinc-800 pt-4">
                                    {rule.content.map((item, idx) => (
                                        <div key={idx}>
                                            <h3 className="text-sm font-bold text-primary-400 mb-1.5">
                                                {item.subtitle}
                                            </h3>
                                            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                                                {item.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer Note */}
                <div className="mt-6 bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
                    <p className="text-xs text-zinc-400 text-center leading-relaxed">
                        Have questions? Contact support through the app or check the Company News section for updates.
                    </p>
                </div>
            </div>
        </div>
    );
}
