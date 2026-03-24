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
}) {

    const userCondition  = rule.user_condition || "all";
    const excludeEnabled = rule.exclude_enabled || false;

    return (
        <>

            {/* ==============================
               USER CONDITION SELECT
            ============================== */}
            <div className="s1-field-wrapper">
                <label className="s1-field-label">
                    {__('User Condition', 'th-store-one')}
                </label>

                <div className="s1-field-control">
                    <SelectControl
                        value={userCondition}
                        options={[
                            { label: __('All Users', 'th-store-one'), value: 'all' },
                            { label: __('Selected Roles', 'th-store-one'), value: 'roles' },
                            { label: __('Selected Users', 'th-store-one'), value: 'users' },
                        ]}
                        onChange={(v) => updateField(index, 'user_condition', v)}
                    />
                </div>
            </div>


            {/* ==============================
               ALL USERS MODE
            ============================== */}
            {userCondition === "all" && (
                <>
                    <div className="s1-field-wrapper">
                        <label className="s1-field-label">
                            {__('Exclude (Users / Roles)', 'th-store-one')}
                        </label>

                        <div className="s1-field-control">
                            <ToggleControl
                                checked={excludeEnabled}
                                onChange={(v) => updateField(index, 'exclude_enabled', v)}
                            />
                        </div>
                    </div>

                    {excludeEnabled && (
                        <>
                            <div className="s1-field-wrapper">
                                <label className="s1-field-label">
                                    {__('Exclude Roles', 'th-store-one')}
                                </label>

                                <div className="s1-field-control">
                                    <MultiWooSearchSelector
                                        searchType="roles"
                                        customOptions={WP_ROLES}
                                        value={rule.exclude_roles || []}
                                        onChange={(items) => updateField(index, 'exclude_roles', items)}
                                    />
                                </div>
                            </div>

                            <div className="s1-field-wrapper">
                                <label className="s1-field-label">
                                    {__('Exclude Users', 'th-store-one')}
                                </label>

                                <div className="s1-field-control">
                                    <MultiWooSearchSelector
                                        searchType="user"
                                        value={rule.exclude_users || []}
                                        onChange={(items) => updateField(index, 'exclude_users', items)}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}


            {/* ==============================
               SELECTED ROLES MODE
            ============================== */}
            {userCondition === "roles" && (
                <>
                    <div className="s1-field-wrapper">
                        <label className="s1-field-label">
                            {__('Allowed Roles', 'th-store-one')}
                        </label>

                        <div className="s1-field-control">
                            <MultiWooSearchSelector
                                searchType="roles"
                                customOptions={WP_ROLES}
                                value={rule.allowed_roles || []}
                                onChange={(items) => updateField(index, 'allowed_roles', items)}
                            />
                        </div>
                    </div>

                    <div className="s1-field-wrapper">
                        <label className="s1-field-label">
                            {__('Exclude Users', 'th-store-one')}
                        </label>

                        <div className="s1-field-control">
                            <ToggleControl
                                checked={rule.exclude_users_enabled}
                                onChange={(v) => updateField(index, 'exclude_users_enabled', v)}
                            />
                        </div>
                    </div>

                    {rule.exclude_users_enabled && (
                        <div className="s1-field-wrapper">
                            <label className="s1-field-label">
                                {__('Excluded Users', 'th-store-one')}
                            </label>

                            <div className="s1-field-control">
                                <MultiWooSearchSelector
                                    searchType="user"
                                    value={rule.exclude_users || []}
                                    onChange={(items) => updateField(index, 'exclude_users', items)}
                                />
                            </div>
                        </div>
                    )}
                </>
            )}


            {/* ==============================
               SELECTED USERS MODE
            ============================== */}
            {userCondition === "users" && (
                <div className="s1-field-wrapper">
                    <label className="s1-field-label">
                        {__('Allowed Users', 'th-store-one')}
                    </label>

                    <div className="s1-field-control">
                        <MultiWooSearchSelector
                            searchType="user"
                            value={rule.allowed_users || []}
                            onChange={(items) => updateField(index, 'allowed_users', items)}
                        />
                    </div>
                </div>
            )}

        </>
    );
}