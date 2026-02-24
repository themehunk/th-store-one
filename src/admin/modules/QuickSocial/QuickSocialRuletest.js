import { useEffect, useRef } from '@wordpress/element';
import { TextControl, SelectControl, Button } from '@wordpress/components';
import Sortable from 'sortablejs';
import { S1Field } from '@storeone-global/S1Field';
import {
    CopyIcon,
    TrashIcon,
    DragHandleDots2Icon,
    ChevronDownIcon,
    ChevronUpIcon
} from "@radix-ui/react-icons";
import { ICONS } from '@storeone-global/icons';

const newItem = () => ({
    id: crypto.randomUUID(),
    type: 'icon',
    selected_icon: 'facebook',
    custom_svg: '',
    image_url: '',
    url: '',
    open: true,
});

const ICON_OPTIONS = [
    { id: 'FACEBOOK', icon: ICONS.FACEBOOK },
    { id: 'INSTAGRAM', icon: ICONS.INSTAGRAM },
    { id: 'TWITTER', icon: ICONS.TWITTER },
    { id: 'LINKEDIN', icon: ICONS.LINKEDIN },
    { id: 'YOUTUBE', icon: ICONS.YOUTUBE },
    { id: 'WHATSAPP', icon: ICONS. WHATSAPP },
    { id: 'TELEGRAM', icon: ICONS.TELEGRAM },
    { id: 'PINTEREST', icon: ICONS.PINTEREST },
];

function SortableWrapper({ items, onSortEnd, children }) {
    const ref = useRef(null);

    useEffect(() => {
        if (!ref.current) return;

        const sortable = Sortable.create(ref.current, {
            animation: 150,
            handle: ".drag-handle",
            onEnd: (evt) => onSortEnd(evt.oldIndex, evt.newIndex),
        });

        return () => sortable.destroy();
    }, [items]);

    return <div ref={ref}>{children}</div>;
}

export default function QuickSocialRule({ links = [], onChange }) {

    useEffect(() => {
        if (!links.length) {
            onChange([newItem()]);
        }
    }, []);

    const updateAll = (arr) => onChange([...arr]);

    const updateField = (i, field, val) => {
        const arr = [...links];
        arr[i][field] = val;
        updateAll(arr);
    };

    const reorder = (oldIndex, newIndex) => {
        const arr = [...links];
        const moved = arr.splice(oldIndex, 1)[0];
        arr.splice(newIndex, 0, moved);
        updateAll(arr);
    };

    const addItem = () => updateAll([...links, newItem()]);
    const removeItem = (i) => {
        const arr = [...links];
        arr.splice(i, 1);
        updateAll(arr.length ? arr : [newItem()]);
    };

    const duplicateItem = (i) => {
        const arr = [...links];
        arr.splice(i + 1, 0, { ...arr[i], id: crypto.randomUUID() });
        updateAll(arr);
    };

    const toggleOpen = (i) => {
        const arr = [...links];
        arr[i].open = !arr[i].open;
        updateAll(arr);
    };

    const openMediaLibrary = (callback) => {
    const media = window.wp.media({
        title: 'Select Image',
        button: { text: 'Use Image' },
        multiple: false,
    });

    media.on('select', () => {
        const attachment = media.state().get('selection').first().toJSON();
        callback(attachment);
    });

    media.open();
};


    return (
        <div className="store-one-rules-container">

            <SortableWrapper items={links} onSortEnd={reorder}>
                {links.map((item, index) => (
                    <div key={item.id} className="store-one-rule-item">

                        <div className="store-one-rule-header">
                            <DragHandleDots2Icon className="drag-handle s1-icon" />
                            <strong className="s1-rule-title">
                                {`Link ${index + 1}`}
                            </strong>

                            <CopyIcon className="s1-icon" onClick={() => duplicateItem(index)} />
                            <TrashIcon className="s1-icon s1-icon-danger" onClick={() => removeItem(index)} />

                            {item.open ? (
                                <ChevronUpIcon className="s1-icon" onClick={() => toggleOpen(index)} />
                            ) : (
                                <ChevronDownIcon className="s1-icon" onClick={() => toggleOpen(index)} />
                            )}
                        </div>

                        {item.open && (
                            <div className="store-one-rule-body">

                                <S1Field label="Icon Type">
                                    <SelectControl
                                        value={item.type}
                                        options={[
                                            { label: 'Icon', value: 'icon' },
                                            { label: 'Image', value: 'image' },
                                            { label: 'SVG', value: 'custom_svg' },
                                            
                                        ]}
                                        onChange={(v) =>
                                            updateField(index, 'type', v)
                                        }
                                    />
                                </S1Field>

                                {item.type === 'icon' && (
                                    <S1Field classN="s1-toggle-wrpapper list-icon">
    
                                    {ICON_OPTIONS.map(({ id, icon }) => (
                                        <div
                                            key={id}
                                            className={`s1-icon-option ${
                                                item.selected_icon === id ? 'active' : ''
                                            }`}
                                            onClick={() =>
                                                updateField(index, 'selected_icon', id)
                                            }
                                        >
                                            {icon}
                                        </div>
                                    ))}
                               
                            </S1Field>

                                )}

                                {item.type === 'custom_svg' && (
                                    <S1Field label="SVG Code">
                                        <TextControl
                                            value={item.custom_svg}
                                            onChange={(v) =>
                                                updateField(index, 'custom_svg', v)
                                            }
                                        />
                                    </S1Field>
                                )}

                               {item.type === 'image' && (
    <S1Field label="Upload Image">
        <div className="s1-image-upload-wrapper">

            {item.image_url ? (
                <div className="s1-image-card">

                    <div className="s1-image-preview">
                        <img src={item.image_url} alt="" />
                    </div>

                    <div className="s1-image-actions">

                        <button
                            type="button"
                            className="s1-btn s1-btn-edit"
                            onClick={() =>
                                openMediaLibrary((media) =>
                                    updateField(index, 'image_url', media.url)
                                )
                            }
                        >
                            <span className="s1-btn-icon">
                                {ICONS.SETTINGS}
                            </span>
                            Change
                        </button>

                        <button
                            type="button"
                            className="s1-btn s1-btn-remove"
                            onClick={() =>
                                updateField(index, 'image_url', '')
                            }
                        >
                            <TrashIcon />
                        </button>

                    </div>

                </div>
            ) : (
                <button
                    type="button"
                    className="s1-upload-card"
                    onClick={() =>
                        openMediaLibrary((media) =>
                            updateField(index, 'image_url', media.url)
                        )
                    }
                >
                    <span className="s1-btn-icon">
                        {ICONS.DISPLAY}
                    </span>
                    <div className="s1-upload-text">
                        <strong>Upload Image</strong>
                        <p>Select from media library</p>
                    </div>
                </button>
            )}

        </div>
    </S1Field>
)}



                                <S1Field label="Link URL">
                                    <TextControl
                                        value={item.url}
                                        onChange={(v) =>
                                            updateField(index, 'url', v)
                                        }
                                    />
                                </S1Field>

                            </div>
                        )}
                    </div>
                ))}
            </SortableWrapper>

            <div className="store-one-add-rule" onClick={addItem}>
                + Add Social Link
            </div>

        </div>
    );
}