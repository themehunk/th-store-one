export function normalizeColor(v) {
	if (!v) return '#000';
	if (typeof v === 'string') return v;

	// WP ColorPicker object
	if (v.rgb) {
		const { r, g, b, a = 1 } = v.rgb;
		return `rgba(${r},${g},${b},${a})`;
	}
	return v.color || '#000';
}
