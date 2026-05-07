# 🧪 Plano de Garantia de Qualidade (QA Plan) - Fleet Monitor

Este documento descreve a estratégia, os níveis e os cenários de teste aplicados ao projeto **Fleet Monitor**, garantindo a integridade dos dados de telemetria e a confiabilidade do rastreamento em tempo real.

---

## 🎯 Objetivo
Garantir que o processamento de dados de localização seja resiliente a falhas de sensores, mantenha a consistência na base de dados e entregue atualizações precisas via WebSockets para o utilizador final.

---

## 🏗️ Pirâmide de Testes

A estratégia segue a distribuição clássica para otimizar a velocidade de execução e a cobertura de código:

1.  **Testes de Unidade (60%):** Validação isolada da camada de **Domínio** e **Casos de Uso** (Business Logic).
2.  **Testes de Integração (30%):** Validação da comunicação entre **Controllers**, **Use Cases** e **Repositórios (Prisma)**.
3.  **Testes E2E (10%):** Simulação do fluxo completo: do disparo do evento no Backend à renderização no mapa (React + Leaflet).

---

## 🛠️ Ferramentas Utilizadas

* **Jest:** Framework principal de testes.
* **Supertest:** Para testes de rotas API.
* **Cypress / Playwright:** (Planeado) Para automação de interface (E2E).
* **In-Memory Repositories:** Para testes de unidade ultra-rápidos sem dependência de base de dados.

---

## 📋 Cenários de Teste (Test Cases)

| ID | Cenário | Nível | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **TC-01** | Receber latitude/longitude zerada (`0,0`) | Unidade | O Use Case deve ignorar o ping ou retornar um erro de validação. |
| **TC-02** | Veículo ultrapassa 120km/h | Unidade | O sistema deve persistir o dado e emitir um alerta de segurança (Log/Evento). |
| **TC-03** | Listagem de veículos da frota | Integração | Deve retornar a lista atualizada vinda da base de dados real (Prisma). |
| **TC-04** | Persistência de telemetria | Integração | A cada atualização, um novo registo deve ser gerado na tabela `History`. |
| **TC-05** | Simulação de Rota (Manaus) | E2E | O ícone do veículo deve seguir os waypoints definidos sem saltos bruscos no mapa. |

---

## 🚀 Ciclo de Execução

1.  **Desenvolvimento:** Execução de testes de unidade locais (`npm test`).
2.  **CI/CD (GitHub Actions):** Pipeline configurada para correr toda a suíte de testes em cada Pull Request.
3.  **Ambiente de Teste:** Utilização de uma base de dados SQLite isolada para garantir que os testes não afetem os dados de produção.

---

## 🚧 Próximos Passos (Backlog de QA)
- [ ] Implementar **Mocks** para o Socket.io nos testes de Controller.
- [ ] Adicionar testes de **Carga** para simular 100+ veículos enviando pings simultâneos.
- [ ] Configurar relatórios de cobertura (**Code Coverage**) com meta de 80%.

---
*Documento gerado como parte da estruturação de Clean Architecture e Software Quality Assurance.*