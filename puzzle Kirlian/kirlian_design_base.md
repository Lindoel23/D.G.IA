# Dispositivo Kirlian — Documento de Design Base

> Versão 1.3 — Estações 2, 3, 4 e 5 completas · Estação 1 a definir · Tarefa 5 a definir

---

## Visão Geral

Puzzle cooperativo para 5 jogadores. Objetivo: seguir os protocolos corretos para remover o núcleo Kirlian da carapaça e transferi-lo para a maleta de transporte.

- **Tempo base:** 15 minutos
- **Bônus por tarefa concluída corretamente:** +1 minuto
- **Penalidade por erro:** −30 segundos (confirmação errada em qualquer estação de ação: Válvulas, Alavancas, Painel de Luzes e Carapaça)
- **Tarefas:** 5 no total
- **Condição de vitória:** concluir as 5 tarefas dentro do tempo

---

## As 5 Estações

### Classificação

| Tipo | Estações |
|------|----------|
| Visão | Terminal Kirlian (Manual), Painel de Luzes |
| Ação | Válvulas de Pressão, Alavancas de Energia, Travas da Carapaça |

---

### Estação 1 — Terminal Kirlian (Manual)

**Tipo:** Visão
**Documento específico:** estacao_1_manual.md

**Interface:**
- Tela inteira estilo CMD antigo, cor temática verde, fonte monoespaçada
- Tela principal: exibe leitura contínua estilo loading — comportamento por tarefa a definir
- Botão **[MANUAL]** no canto superior direito · atalho: **Ctrl**

**Manual — 7 páginas navegáveis:**
Manual · Painel de Controle · Válvulas · Alavancas · Carapaça · Falhas Críticas · Eventos

**Navegação:** botões ← → na barra inferior · scroll ↑ ↓ entre eles · fechar com **[Esc]**

**Fluxo da tela principal:**
- Carregamento → introdução do protocolo de emergência (15 min) → aguarda sinal da Carapaça para iniciar
- Carapaça envia sinal → briefing da Tarefa 1 aparece → ENTER dispara Firebase → todas as estações avançam
- Durante tarefa → tela em loading mostrando tarefas anteriores com OK
- Estação 2 confirma medidores → sobreposição com 3 opções de símbolos aparece (qualquer tela)
- Estação 5 confirma corretamente → sobreposição fecha → briefing da próxima tarefa
- Próximas tarefas: mesma lógica, histórico de OK acumula na tela

**Posição do cronômetro:** canto inferior direito (único diferente das outras estações)
**Botão ENTER:** canto inferior esquerdo, ao lado do cronômetro

**Sem abreviações ou sequências em código no texto do manual — tudo escrito por extenso.**

---

### Estação 2 — Painel de Luzes

**Tipo:** Visão
**Documento específico:** estacao_2_painel.md

**Componentes:**
- Grade 5×5 na parte superior (linhas A–E, colunas 1–5) — não ocupa tela inteira
- Dois pinos estilo mesa sonora (PRESSÃO e ENERGIA), escala 0 a 10
- Botão CONFIRMAR — valida os medidores e libera sequência para Estação 5
- Estética de painel soviético antigo

**Linhas:** A = Válvulas · B = Alavancas · C = Carapaça · D = reservada · E = falha crítica

**Colunas:** sequência de execução (número do passo na tarefa)

**Cadeia de prioridade:** piscada rápida = age agora · piscada lenta = aguarda. Ordem diferente a cada tarefa.

**Falhas Críticas:**
- T2 e T3: linha E acende ao entrar na tarefa, apaga quando a estação afetada resolve a falha
- T4: painel pisca aleatoriamente — resolvido com 5 sequências de medidores (0,0 → 10,10 → 10,0 → 0,10 → 5,5), cada uma normalizando uma linha até 2 piscadas verdes finais

**Confirmação errada → −30 segundos.**

**Sequências por tarefa:**
- T1: A5, B2, A3, C1 · medidores 7/9
- T2: B4, A2, B1, C2 · medidores 3/1
- T3: A1, B3, C3, C4 · medidores 9/6
- T4: A4, B5, C5 · medidores 4/2 (após resolver falha)

---

### Estação 3 — Válvulas de Pressão

**Tipo:** Ação
**Documento específico:** estacao_3_valvulas.md

**Componentes:**
- 4 canos verticais (v1 a v4, esquerda para direita), estética desgastada soviética
- 1 cano horizontal (v5 — Cano de Liberação), posicionado na frente e abaixo dos 4
- Botões ↑ (esquerda) e ↓ (direita) em cada cano vertical
- Cano de Liberação: botão LIBERAR → + medidor semicircular (0 a 10)

**Lógica de validação:** contador por válvula iniciando em 0. Esquerda = −1, Direita = +1. Posição final validada ao apertar LIBERAR.

**Falha Crítica (Tarefa 2):** controles invertidos + tela esverdeada. Resolvida com sequência específica antes de executar a tarefa normalmente.

**Medidores por tarefa:** T1 = 7 · T2 = 3 · T3 = 9 · T4 = 4

**Como recebe instrução:** Manual informa posições alvo; Painel sinaliza vez desta estação (piscada rápida na linha A)

---

### Estação 4 — Alavancas de Energia

**Tipo:** Ação
**Documento específico:** estacao_4_alavancas.md

**Componentes:**
- 5 alavancas de execução (A1–A5): A1, A2, A3 na fileira superior / A4, A5 na fileira inferior
- Cada alavanca tem visor numérico identificador e 3 posições: Superior / Neutro / Inferior
- Alavanca de Carga (A6): dupla, maior, separada — mecanismo de confirmação
- Medidor régua (0 a 10) abaixo de todas as alavancas — zera a cada nova tarefa

**Cenário:** parede desgastada com placa de metal, estética soviética industrial.

**Lógica de validação:** posição final de cada alavanca comparada ao alvo ao acionar a Alavanca de Carga. Confirmação errada → −30 segundos.

**Falha Crítica (Tarefa 3):** visores numéricos trocam de posição nas alavancas. O Manual mostra ordem normal, mas os visores na tela estão embaralhados. Resolvida com 3 execuções específicas antes de executar a tarefa normalmente.

**Medidores por tarefa:** T1 = 9 · T2 = 1 · T3 = 6 · T4 = 2 · T5 = sem execução

**Como recebe instrução:** Manual informa posições alvo; Painel sinaliza vez desta estação (piscada rápida na linha B)

---

### Estação 5 — Travas da Carapaça

**Tipo:** Ação
**Documento específico:** estacao_5_carapaca.md

**Componentes:**
- 4 travas rotativas (T1–T4) na superfície metálica da carapaça
- Cada trava possui 5 símbolos geométricos na parte giratória
- Ponto vermelho fixo em cada trava indica onde o símbolo correto deve ser alinhado
- 4 cabos visuais acima das travas — acendem conforme tarefas são concluídas
- Botão redondo de confirmação (B), sem texto

**Ativação:** a sequência correta só aparece na Estação 1 após a Estação 2 confirmar os medidores. A Estação 1 exibe 3 opções de sequência — apenas uma é verdadeira. O operador decide verbalmente com a equipe.

**Tarefa 3:** duas execuções — a Estação 1 exibe 3 opções a cada vez.

**Tarefa 5:** sem execução de travas — comportamento diferente a definir.

**Confirmação errada → −30 segundos.**

**Conclusão de tarefa:** botão B correto → Estação 1 exibe "TAREFA CONCLUÍDA" → 5 segundos de transição → Firebase dispara sinal → todas as estações avançam simultaneamente.

**Como recebe instrução:** Estação 1 exibe os símbolos após Estação 2 confirmar; Painel sinaliza vez desta estação (piscada rápida na linha C)

---

## Fluxo de uma Tarefa

1. **Painel de Luzes** detecta e exibe a combinação ativa
2. **Operador do Manual** lê o painel, navega no manual e instrui as estações de ação
3. **Painel** acende as 3 estações de ação simultaneamente — uma pisca rápido, duas piscam lento
4. **Operador do Painel** reporta verbalmente quem está piscando rápido
5. Estação ativa executa → aciona seu mecanismo de confirmação
6. Painel atualiza: luz da estação concluída apaga, próxima vira rápida
7. Cadeia continua até Estações 3 e 4 concluírem e reportarem seus números ao Painel
8. **Operador do Painel** ajusta os dois volumes (número da Est.3 e número da Est.4) e aperta finalizar
9. **Estação 1** exibe os 4 símbolos corretos para as travas
10. **Estação 5** posiciona as 4 travas e aperta o Botão Vermelho
11. Tarefa encerrada — +1 cabo destravado — cronômetro recebe +1 minuto

**A ordem da cadeia (qual pisca rápido primeiro) é diferente a cada tarefa.**

---

## As 5 Tarefas

### Tarefa 1 — Calibração de Pressão
- Foco principal: Válvulas
- Resultado: Trava T1 definida, Cabo 1 destravado

### Tarefa 2 — Sincronização de Energia
- Foco principal: Alavancas
- Resultado: Trava T2 definida, Cabo 2 destravado

### Tarefa 3 — Contenção Paranormal
- Foco principal: Carapaça (2 execuções) · Falha Crítica na Estação 4
- Resultado: Trava T3 definida, Cabo 3 destravado

### Tarefa 4 — Autorização de Extração
- Foco principal: Painel de Luzes (Falha Crítica) · Válvulas e Alavancas com 2 execuções cada
- Resultado: Trava T4 definida, Cabo 4 destravado

### Tarefa 5 — Extração Final
- Estação 1: exibe briefing final → ENTER para do cronômetro → brilho roxo 10s → fim
- Estação 2: monitoramento passivo, sem sequência de luzes
- Estação 3: sem execução, aguarda sinal de encerramento
- Estação 4: sem execução, aguarda sinal de encerramento
- Estação 5: exibe 4 cabos destravados, sem travas, aguarda sinal de encerramento
- **Cronômetro zerado:** aciona o mesmo brilho roxo em todas as estações → fim por tempo esgotado

---

## O que ainda precisa ser definido

- [x] Estação 1 — Terminal Kirlian / Manual (estacao_1_manual.md)
- [x] Tarefa 5 — comportamento completo em todas as estações
- [x] Encerramento — ENTER para cronômetro + brilho roxo 10s (vitória ou derrota)
- [x] Cronômetro — caixa vermelha com milésimos nas Est. 2, 3, 4 e 5 · texto CMD na Est. 1
- [ ] Comportamento especial da Estação 5 na Tarefa 5
- [ ] Sequência e comportamento de todas as estações na Tarefa 5
- [ ] Condição de derrota (o que acontece se o tempo zera)

## O que já está definido ✓

- [x] Estação 2 — Painel de Luzes (estacao_2_painel.md)
- [x] Estação 3 — Válvulas de Pressão (estacao_3_valvulas.md)
- [x] Estação 4 — Alavancas de Energia (estacao_4_alavancas.md)
- [x] Estação 5 — Travas da Carapaça (estacao_5_carapaca.md)
- [x] Sequências do Painel por tarefa (T1–T4)
- [x] Medidores de Pressão e Energia por tarefa (T1–T4)
- [x] Execuções das Válvulas por tarefa (T1–T4)
- [x] Execuções das Alavancas por tarefa (T1–T4)
- [x] Sequências verdadeiras e falsas das Travas (T1–T4)
- [x] Falha Crítica T2 — Válvulas (controles invertidos)
- [x] Falha Crítica T3 — Alavancas (visores embaralhados)
- [x] Falha Crítica T4 — Painel (piscadas aleatórias, 5 sequências de reset)
- [x] Lógica Firebase — sinal único da Estação 1 avança todas as estações simultaneamente
- [x] Símbolos geométricos das travas (5 por trava, 4 travas)
- [x] 4 cabos visuais na Estação 5 (Tarefas 1–4)

---

## Notas de Implementação

- Cada estação é uma tela/jogo separado funcionando simultaneamente via código
- T1, T2, T3, T4 são identificadores internos de código — nunca aparecem na interface do jogador
- Os números gerados pelas Estações 3 e 4 ficam visíveis no medidor/manômetro para o operador do Painel registrar verbalmente
- A comunicação entre jogadores é 100% verbal — nenhum jogador tem informação suficiente sozinho
- **Firebase:** a Estação 1 envia um único sinal de mudança de fase — todas as estações escutam o documento e avançam de tarefa simultaneamente
- **Cronômetro:** exibido em todas as telas no canto — gera pressão coletiva
- **Execuções e lógicas** ficam hardcoded por tarefa no Firebase — sem geração aleatória, tudo pré-definido
