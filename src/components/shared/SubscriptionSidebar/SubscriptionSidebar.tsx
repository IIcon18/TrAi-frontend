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
        title: "Трекинг питания",
        description: "Полный доступ к журналу питания и подсчёту калорий",
    },
    {
        icon: "🤖",
        title: "ИИ-планирование питания",
        description: "Персональные планы питания от ИИ на основе ваших целей",
    },
    {
        icon: "📊",
        title: "Расширенная аналитика",
        description: "Детальные графики и инсайты прогресса по питанию и тренировкам",
    },
    {
        icon: "⚡",
        title: "ИИ-интеллект тренировок",
        description: "Умные рекомендации и корректировки тренировок в реальном времени",
    },
    {
        icon: "🎯",
        title: "Оптимизация целей",
        description: "Динамическая перекалибровка целей по мере вашего прогресса",
    },
    {
        icon: "💬",
        title: "Приоритетная поддержка",
        description: "Быстрый доступ к нашей команде поддержки",
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
                            <span>PRO Активен</span>
                        </div>
                        <h2 className="subscription-sidebar__title">Ваш TrAi PRO</h2>
                        <p className="subscription-sidebar__subtitle">
                            У вас полный доступ ко всем премиум-функциям.
                        </p>

                        <div className="subscription-sidebar__divider" />

                        <h3 className="subscription-sidebar__section-title">Что вы получаете</h3>
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
                            <h2 className="subscription-sidebar__title">Перейти на PRO</h2>
                            <p className="subscription-sidebar__subtitle">
                                Раскройте весь потенциал ИИ-тренировок и питания.
                            </p>
                        </div>

                        <div className="subscription-sidebar__divider" />

                        <h3 className="subscription-sidebar__section-title">Преимущества PRO</h3>
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
                                Получить PRO сейчас
                            </button>
                            <p className="subscription-sidebar__cta-note">
                                Обратитесь к администратору для активации.
                            </p>
                        </div>
                    </div>
                )}
            </aside>
        </>
    );
};

export default SubscriptionSidebar;