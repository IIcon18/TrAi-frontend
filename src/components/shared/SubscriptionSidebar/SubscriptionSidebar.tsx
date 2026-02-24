import React from "react";
import { isPro } from "../../../utils/auth";
import "./SubscriptionSidebar.css";

interface SubscriptionSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const PRO_BENEFITS = [
    {
        icon: "🥗",
        title: "Nutrition Tracking",
        description: "Full access to meal logging and calorie tracking",
    },
    {
        icon: "🤖",
        title: "AI Meal Planning",
        description: "Personalized meal plans built by AI based on your goals",
    },
    {
        icon: "📊",
        title: "Advanced Analytics",
        description: "Detailed charts and progress insights for nutrition and workouts",
    },
    {
        icon: "⚡",
        title: "AI Workout Intelligence",
        description: "Smart workout recommendations and real-time adjustments",
    },
    {
        icon: "🎯",
        title: "Goal Optimization",
        description: "Dynamic goal recalibration as your fitness evolves",
    },
    {
        icon: "💬",
        title: "Priority Support",
        description: "Fast-track access to our support team",
    },
];

const SubscriptionSidebar: React.FC<SubscriptionSidebarProps> = ({ isOpen, onClose }) => {
    const userIsPro = isPro();

    return (
        <>
            <div
                className={`subscription-overlay ${isOpen ? "subscription-overlay--visible" : ""}`}
                onClick={onClose}
            />

            <aside className={`subscription-sidebar ${isOpen ? "subscription-sidebar--open" : ""}`}>
                <button className="subscription-sidebar__close" onClick={onClose} aria-label="Close">
                    ✕
                </button>

                {userIsPro ? (
                    <div className="subscription-sidebar__content">
                        <div className="subscription-sidebar__status-badge">
                            <span className="subscription-sidebar__status-icon">✦</span>
                            <span>PRO Active</span>
                        </div>
                        <h2 className="subscription-sidebar__title">Your TrAi PRO</h2>
                        <p className="subscription-sidebar__subtitle">
                            You have full access to all premium features.
                        </p>

                        <div className="subscription-sidebar__divider" />

                        <h3 className="subscription-sidebar__section-title">What you get</h3>
                        <ul className="subscription-sidebar__benefits">
                            {PRO_BENEFITS.map((b) => (
                                <li key={b.title} className="subscription-sidebar__benefit">
                                    <span className="subscription-sidebar__benefit-icon">{b.icon}</span>
                                    <div>
                                        <p className="subscription-sidebar__benefit-title">{b.title}</p>
                                        <p className="subscription-sidebar__benefit-desc">{b.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="subscription-sidebar__content">
                        <div className="subscription-sidebar__upgrade-header">
                            <span className="subscription-sidebar__crown">♛</span>
                            <h2 className="subscription-sidebar__title">Upgrade to PRO</h2>
                            <p className="subscription-sidebar__subtitle">
                                Unlock the full power of AI-driven training and nutrition.
                            </p>
                        </div>

                        <div className="subscription-sidebar__divider" />

                        <h3 className="subscription-sidebar__section-title">PRO Benefits</h3>
                        <ul className="subscription-sidebar__benefits">
                            {PRO_BENEFITS.map((b) => (
                                <li key={b.title} className="subscription-sidebar__benefit">
                                    <span className="subscription-sidebar__benefit-icon">{b.icon}</span>
                                    <div>
                                        <p className="subscription-sidebar__benefit-title">{b.title}</p>
                                        <p className="subscription-sidebar__benefit-desc">{b.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="subscription-sidebar__cta">
                            <button className="subscription-sidebar__cta-button">
                                Get PRO Now
                            </button>
                            <p className="subscription-sidebar__cta-note">
                                Contact your administrator to upgrade your account.
                            </p>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
};

export default SubscriptionSidebar;