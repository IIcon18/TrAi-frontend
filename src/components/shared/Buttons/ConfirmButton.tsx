import React from "react";
import "./ConfirmButton.css";
import ConfirmIcon from "../../../assets/icons/confirm.svg";
    interface ConfirmButtonProps {
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    children?: React.ReactNode;
}

export const ConfirmButton: React.FC<ConfirmButtonProps> = ({
                                                                onClick,
                                                                disabled = false,
                                                                loading = false,
                                                                children = "Confirm"
                                                            }) => {
    return (
        <button
            type="submit"
            className="confirm-button"
            onClick={onClick}
            disabled={disabled || loading}
        >
            {!loading && (
                <img
                    src={ConfirmIcon}
                    alt="Confirm"
                    className="confirm-icon"
                />
            )}
            {loading ? "Loading..." : children}
        </button>
    );
};

export default ConfirmButton;