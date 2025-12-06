import { useState, useEffect } from '@wordpress/element';
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";

export default function S1Accordion({
    title,
    children,
    defaultOpen = false,
    status = "inactive", // "active" | "inactive"
}) {
    const [open, setOpen] = useState(defaultOpen);

    // Active state class
    const isActive = status === "active";

    return (
        <div className={`s1-accordion ${isActive ? "is-active" : "is-inactive"}`}>
            
            <div className="s1-accordion-header" onClick={() => setOpen(!open)}>
                <span className="s1-accordion-title">
                    {title}
                </span>

                {/* ACTIVE BADGE LIKE STOREONE UI */}
                <div className="s1-accordion-status-wrapper">
                <span className={`s1-accordion-status ${isActive ? "on" : "off"}`}>
                    {isActive ? "Active" : "Inactive"}
                </span>
                {open ? (
                    <ChevronUpIcon className="s1-accordion-icon" />
                ) : (
                    <ChevronDownIcon className="s1-accordion-icon" />
                )}
                </div>
            </div>

            {open && (
                <div className="s1-accordion-body">
                    {children}
                </div>
            )}
        </div>
    );
}
