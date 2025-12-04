import { useState } from '@wordpress/element';
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";

export default function S1Accordion({ title, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="s1-accordion">
            
            <div className="s1-accordion-header" onClick={() => setOpen(!open)}>
                <span className="s1-accordion-title">{title}</span>

                {open ? (
                    <ChevronUpIcon className="s1-accordion-icon" />
                ) : (
                    <ChevronDownIcon className="s1-accordion-icon" />
                )}
            </div>

            {open && (
                <div className="s1-accordion-body">
                    {children}
                </div>
            )}
        </div>
    );
}