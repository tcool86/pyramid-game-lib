export default function Collision(key: string) {
	return (target: any, name: string, descriptor: PropertyDescriptor) => {
		const original = descriptor.value;
		target._collision ??= new Map();
		target._collision.set(key, { name, original });
	}
}
