import React from "react";
import "./NewAccountButton.css";
import NewAccountIcon from "../../../assets/icons/new_acc.svg"; // ← Исправленный путь

interface NewAccountButtonProps {
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    children?: React.ReactNode;
}

export const NewAccountButton: React.FC<NewAccountButtonProps> = ({
                                                                      onClick,
                                                                      disabled = false,
                                                                      loading = false,
                                                                      children = "Новый аккаунт"
                                                                  }) => {
    return (
        <button
            type="button"
            className="new-account-button"
            onClick={onClick}
            disabled={disabled || loading}
        >
            {!loading && (
                <img
                    src={NewAccountIcon}
                    alt="Новый аккаунт"
                    className="new-account-icon"
                />
            )}
            {loading ? "Загрузка..." : children}
        </button>
    );
};

export default NewAccountButton;