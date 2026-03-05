import React from "react";
import "./ConfirmButton.css";
import ConfirmIcon from "../../../assets/icons/confirm.svg";
interface ConfirmButtonProps {
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    children?: React.ReactNode;
    className?: string;
}

export const ConfirmButton: React.FC<ConfirmButtonProps> = ({
                                                                onClick,
                                                                disabled = false,
                                                                loading = false,
                                                                children = "Подтвердить",
                                                                className = ""
                                                            }) => {
    return (
        <button
            type="submit"
            className={`confirm-button ${className}`.trim()}
            onClick={onClick}
            disabled={disabled || loading}
        >
            {!loading && (
                <img
                    src={ConfirmIcon}
                    alt="Подтвердить"
                    className="confirm-icon"
                />
            )}
            {loading ? "Загрузка..." : children}
        </button>
    );
};

export default ConfirmButton;