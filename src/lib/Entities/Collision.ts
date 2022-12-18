export default function Collision(key: string) {
	return (target: any, name: string, descriptor: PropertyDescriptor) => {
		const original = descriptor.value;
		console.log({ target, name, descriptor, original, key });
	}
}
