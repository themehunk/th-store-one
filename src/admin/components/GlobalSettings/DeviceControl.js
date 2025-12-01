import { Icon, DropdownMenu, MenuItemsChoice } from '@wordpress/components';
import { mobile, tablet, desktop } from '@wordpress/icons';
import useDeviceStore from '@storeone/store/device-store';

export default function DeviceControl() {
    const device = useDeviceStore((s) => s.device);
    const setDevice = useDeviceStore((s) => s.setDevice);

    const icons = { Desktop: desktop, Tablet: tablet, Mobile: mobile };

    return (
        <DropdownMenu label="Device" icon={<Icon icon={icons[device]} />}>
            {() => (
                <MenuItemsChoice
                    value={device}
                    choices={[
                        { label: "Desktop", value: "Desktop" },
                        { label: "Tablet", value: "Tablet" },
                        { label: "Mobile", value: "Mobile" },
                    ]}
                    onSelect={(d) => setDevice(d)}
                />
            )}
        </DropdownMenu>
    );
}