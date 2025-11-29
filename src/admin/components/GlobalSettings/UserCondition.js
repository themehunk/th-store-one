import { SelectControl, ToggleControl } from '@wordpress/components';
import MultiWooSearchSelector from './MultiWooSearchSelector';
import { __ } from '@wordpress/i18n';

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
    Field,
}) {

    // SAFE DEFAULTS (so first load never breaks)
    const userCondition = rule.user_condition || "all";
    const excludeEnabled = rule.exclude_enabled || false;

    return (
        <div className="store-one-user-condition">

            {/* MAIN SELECT */}
            <Field label={__('User Condition', 'store-one')}>
                <SelectControl
                    value={userCondition}
                    options={[
                        { label: __('All Users', 'store-one'), value: 'all' },
                        { label: __('Selected Roles', 'store-one'), value: 'roles' },
                        { label: __('Selected Users', 'store-one'), value: 'users' },
                    ]}
                    onChange={(v) => updateField(index, 'user_condition', v)}
                />
            </Field>


            {/* ----------------------------------------------------
               ALL USERS MODE
               ---------------------------------------------------- */}
            {userCondition === "all" && (
                <>
                    {/* toggle appears always */}
                    <Field label={__('Exclude (Users / Roles)', 'store-one')}>
                        <ToggleControl
                            checked={excludeEnabled}
                            onChange={(v) => updateField(index, 'exclude_enabled', v)}
                        />
                    </Field>

                    {excludeEnabled && (
                        <>
                            {/* Exclude Roles */}
                            <Field label={__('Exclude Roles', 'store-one')}>
                                <MultiWooSearchSelector
                                    searchType="roles"
                                    customOptions={WP_ROLES}
                                    value={rule.exclude_roles || []}
                                    onChange={(items) => updateField(index, 'exclude_roles', items)}
                                />
                            </Field>

                            {/* Exclude Users */}
                            <Field label={__('Exclude Users', 'store-one')}>
                                <MultiWooSearchSelector
                                    searchType="user"
                                    value={rule.exclude_users || []}
                                    onChange={(items) => updateField(index, 'exclude_users', items)}
                                />
                            </Field>
                        </>
                    )}
                </>
            )}


            {/* ----------------------------------------------------
               SELECTED ROLES MODE
               ---------------------------------------------------- */}
            {userCondition === "roles" && (
                <>
                    <Field label={__('Allowed Roles', 'store-one')}>
                        <MultiWooSearchSelector
                            searchType="roles"
                            customOptions={WP_ROLES}
                            value={rule.allowed_roles || []}
                            onChange={(items) => updateField(index, 'allowed_roles', items)}
                        />
                    </Field>

                    {/* Only exclude USERS (not roles) */}
                    <Field label={__('Exclude Users', 'store-one')}>
                        <ToggleControl
                            checked={rule.exclude_users_enabled}
                            onChange={(v) => updateField(index, 'exclude_users_enabled', v)}
                        />
                    </Field>

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


            {/* ----------------------------------------------------
               SELECTED USERS MODE
               ---------------------------------------------------- */}
            {userCondition === "users" && (
                <>
                    {/* Only one selector — no exclude toggle */}
                    <Field label={__('Allowed Users', 'store-one')}>
                        <MultiWooSearchSelector
                            searchType="user"
                            value={rule.allowed_users || []}
                            onChange={(items) => updateField(index, 'allowed_users', items)}
                        />
                    </Field>
                </>
            )}

        </div>
    );
}
