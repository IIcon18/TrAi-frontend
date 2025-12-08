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
                                                                      children = "New account"
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
                    alt="New account"
                    className="new-account-icon"
                />
            )}
            {loading ? "Loading..." : children}
        </button>
    );
};

export default NewAccountButton;