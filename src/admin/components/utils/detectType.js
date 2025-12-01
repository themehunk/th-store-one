export function detectType(str) {
	if (!str) return 'color';

	const val = String(str);

	if (/linear-gradient|radial-gradient/i.test(val)) return 'gradient';
	if (/^#[0-9A-F]{3,6}$/i.test(val)) return 'color';
	if (/^rgba?\(/i.test(val)) return 'color';
	if (typeof str === 'object' && str.url) return 'image';

	return 'color';
}
