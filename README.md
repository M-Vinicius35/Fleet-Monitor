🛰️ Fleet Monitor - Real-Time Telemetry and Monitoring System
This project is a robust fleet monitoring solution, developed with a focus on scalability, performance, and data reliability. The application was designed following Clean Architecture and Clean Code principles, ensuring the system is highly maintainable and testable.

🎯 Objective (The Problem it Solves)
Fleet managers often struggle to visualize vehicle positions and statuses in real-time, which directly impacts decision-making and safety. Fleet Monitor centralizes this data into an intelligent dashboard, providing:

Precise telemetry visualization.

Reduced latency in data updates.

Intuitive interface for rapid alert response.

🛠️ Tech Stack
For this project, I selected tools that enable high performance and type safety:

Frontend: React.js + Vite (for ultra-fast builds) + TypeScript.

Backend: Node.js + TypeScript (ensuring end-to-end data consistency).

Communication: Socket.io (for Real-time data streaming).

Styling: Tailwind CSS (focused on modern, responsive UI).

🚀 Key Features
🔒 Secure Authentication: Login system with robust route protection.

📊 Telemetry Dashboard: Interactive panel with metrics for speed, battery, and location.

🚨 Alert System: Real-time notifications if a vehicle exceeds safety parameters.

🗺️ Geographic Monitoring: Map integration for spatial fleet visualization.

🧠 Engineering & QA Mindset
Unlike a generic project, Fleet Monitor was built with a QA Engineer's mindset:

Separation of Concerns (SoC): Business logic is strictly isolated from the UI.

Clean Code: Semantic variables and small, modular functions that facilitate the creation of Unit Tests.

QA Strategy: The project is structured to support integration tests and automation using tools like Cypress or Playwright, focusing on the "Happy Path" and edge-case error handling.

⚙️ How to Run the Project
1. Backend
Bash
cd backend
npm install
npm run dev
2. Frontend
Bash
cd frontend
npm install
npm run dev

-- PORTUGUÊS --

🛰️ Fleet Monitor - Sistema de Telemetria e Monitoramento em Tempo Real
Este projeto é uma solução robusta para o monitoramento de frotas, desenvolvida com foco em escalabilidade, performance e confiabilidade de dados. A aplicação foi projetada seguindo os princípios de Clean Architecture e Clean Code, garantindo que o sistema seja fácil de manter e testar.

🎯 Objetivo (O Problema que Resolve)
Gestores de frota muitas vezes enfrentam dificuldades em visualizar a posição e o status dos veículos em tempo real, o que impacta na tomada de decisão e na segurança. O Fleet Monitor centraliza esses dados em um dashboard inteligente, oferecendo:

Visualização precisa de telemetria.

Redução de latência na atualização de dados.

Interface intuitiva para resposta rápida a alertas.

🛠️ Stack Tecnológica
Para este projeto, selecionei ferramentas que permitem alta performance e tipagem segura:

Frontend: React.js + Vite (para um build ultra rápido) + TypeScript.

Backend: Node.js + TypeScript (garantindo consistência de dados de ponta a ponta).

Comunicação: Socket.io (para o fluxo de dados em tempo real/Real-time).

Estilização: Tailwind CSS (focado em UI moderna e responsiva).

🚀 Funcionalidades Principais
🔒 Autenticação Segura: Sistema de login com proteção de rotas.

📊 Dashboard de Telemetria: Painel interativo com métricas de velocidade, bateria e localização.

🚨 Sistema de Alertas: Notificações em tempo real caso algum veículo saia dos parâmetros de segurança.

🗺️ Monitoramento Geográfico: Integração com mapas para visualização espacial da frota.

🧠 Mindset de Engenharia e QA
Diferente de um projeto genérico, o Fleet Monitor foi construído com a mentalidade de um Engenheiro de QA:

Separação de Responsabilidades (SoC): Lógica de negócio isolada da interface.

Clean Code: Variáveis semânticas e funções pequenas que facilitam a criação de Testes Unitários.

Estratégia de QA: O projeto foi estruturado para suportar testes de integração e automação com ferramentas como Cypress ou Playwright, focando no "Happy Path" e no tratamento de erros.

⚙️ Como Executar o Projeto
1. Backend
Bash
cd backend
npm install
npm run dev
2. Frontend
Bash
cd frontend
npm install
npm run dev