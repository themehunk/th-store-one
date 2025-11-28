import { SelectControl, ToggleControl } from '@wordpress/components';
import MultiWooSearchSelector from './MultiWooSearchSelector';
import { __ } from '@wordpress/i18n';

/* WP roles – static list */
const WP_ROLES = [
    { label: 'Administrator', value: 'administrator' },
    { label: 'Editor', value: 'editor' },
    { label: 'Author', value: 'author' },
    { label: 'Contributor', value: 'contributor' },
    { label: 'Subscriber', value: 'subscriber' },
    { label: 'Customer', value: 'customer' },
    { label: 'Shop Manager', value: 'shop_manager' },
];

export default function UserCondition({
    rule,
    index,
    updateField,
    Field,            // <-- IMPORTANT: Passed from parent, same wrapper you use everywhere
}) {

    return (
        <div className="store-one-user-condition">

            {/* MAIN CONDITION SELECT */}
            <Field label={__('User Condition', 'store-one')}>
                <SelectControl
                    value={rule.user_condition}
                    options={[
                        { label: __('All Users', 'store-one'), value: 'all' },
                        { label: __('Selected Roles', 'store-one'), value: 'roles' },
                        { label: __('Selected Users', 'store-one'), value: 'users' },
                    ]}
                    onChange={(v) => updateField(index, 'user_condition', v)}
                />
            </Field>

            {/* ------------------------- ROLES MODE ------------------------- */}
            {rule.user_condition === 'roles' && (
                <>
                    {/* Allowed Roles */}
                    <Field label={__('Allowed Roles', 'store-one')}>
                        <MultiWooSearchSelector
                            searchType="roles"
                            customOptions={WP_ROLES}
                            value={rule.allowed_roles || []}
                            onChange={(items) => updateField(index, 'allowed_roles', items)}
                        />
                    </Field>

                    {/* Toggle */}
                    <Field label={__('Exclude Roles', 'store-one')}>
                        <ToggleControl
                            checked={rule.exclude_roles_enabled}
                            onChange={(v) => updateField(index, 'exclude_roles_enabled', v)}
                        />
                    </Field>

                    {/* Excluded Roles */}
                    {rule.exclude_roles_enabled && (
                        <Field label={__('Excluded Roles', 'store-one')}>
                            <MultiWooSearchSelector
                                searchType="roles"
                                customOptions={WP_ROLES}
                                value={rule.exclude_roles || []}
                                onChange={(items) => updateField(index, 'exclude_roles', items)}
                            />
                        </Field>
                    )}
                </>
            )}

            {/* ------------------------- USERS MODE ------------------------- */}
            {rule.user_condition === 'users' && (
                <>
                    {/* Allowed Users */}
                    <Field label={__('Allowed Users', 'store-one')}>
                        <MultiWooSearchSelector
                            searchType="user"
                            value={rule.allowed_users || []}
                            onChange={(items) => updateField(index, 'allowed_users', items)}
                        />
                    </Field>

                    {/* Exclude Users toggle */}
                    <Field label={__('Exclude Users', 'store-one')}>
                        <ToggleControl
                            checked={rule.exclude_users_enabled}
                            onChange={(v) => updateField(index, 'exclude_users_enabled', v)}
                        />
                    </Field>

                    {/* Excluded Users */}
                    {rule.exclude_users_enabled && (
                        <Field label={__('Excluded Users', 'store-one')}>
                            <MultiWooSearchSelector
                                searchType="user"
                                value={rule.exclude_users || []}
                                onChange={(items) => updateField(index, 'exclude_users', items)}
                            />
                        </Field>
                    )}
                </>
            )}
        </div>
    );
}
