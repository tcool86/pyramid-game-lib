module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/src'],
	modulePaths: ['<rootDir>/src'],
	moduleFileExtensions: ['js', 'ts'],
	transform: {
		'^.+\\.ts$': 'ts-jest',
	},
	testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts$',
	collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
	coveragePathIgnorePatterns: ['node_modules', 'src/index.ts'],
	coverageReporters: ['json', 'lcov', 'text', 'clover'],
};
