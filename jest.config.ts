import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Forneça o caminho para o seu app Next.js para carregar next.config.js e arquivos .env nos seus testes
  dir: './',
})

// Configurações personalizadas para o Jest
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // Adicione mais opções de configuração aqui
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    // Lidar com aliases de caminho (ajuste conforme seu tsconfig.json)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  preset: 'ts-jest',
}

// createJestConfig é exportado desta forma para garantir que next/jest possa carregar a configuração do Next.js que é assíncrona
export default createJestConfig(config)
