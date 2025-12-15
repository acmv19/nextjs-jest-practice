const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFiles: ["<rootDir>/jest.polyfills.js"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  // Configuración para MSW v2 - Necesario para que Jest resuelva correctamente los módulos
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  // Transformar módulos ESM de node_modules para MSW
  transformIgnorePatterns: [
    'node_modules/(?!(msw|@mswjs|@bundled-es-modules|until-async|strict-event-emitter|@open-draft)/)',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
// Usamos async function para poder modificar la config después de que Next.js la procese
module.exports = async () => {
  const nextJestConfig = await createJestConfig(customJestConfig)()

  // Asegurarnos de que transformIgnorePatterns se aplique correctamente
  return {
    ...nextJestConfig,
    transformIgnorePatterns: [
      '/node_modules/(?!(msw|@mswjs|@bundled-es-modules|until-async|strict-event-emitter|@open-draft)/)',
    ],
  }
}
