# Conexão entre Estações — Sinais e Sincronização

> Documento de lógica de comunicação entre estações
> Referência cruzada: Design Base v1.3

---

## Visão Geral

As 5 estações funcionam como jogos separados rodando simultaneamente. A comunicação entre elas acontece por sinais — mensagens simples que uma estação escreve e as outras leem.

Esses sinais podem ser implementados via Firebase (campos de um documento compartilhado) ou por qualquer estrutura de estado centralizada. O importante é a lógica: quem envia, quem recebe, quando acontece e o que muda.

A comunicação entre jogadores é 100% verbal. Os sinais digitais coordenam apenas a progressão do jogo — cadeia de execução, cronômetro e eventos especiais.

---

## Lista de Sinais

| # | Sinal | Origem | Destino | Descrição curta |
|---|-------|--------|---------|-----------------|
| 1 | INICIO | Est.5 | Est.1 | Carapaça sinaliza para começar o jogo |
| 2 | AVANCAR | Est.1 | Todas | ENTER inicia a tarefa em todas as estações |
| 3 | EXECUCAO_OK | Est.3 / Est.4 | Est.2 | Estação de ação conclui seu passo na cadeia |
| 4 | MEDIDORES_OK | Est.2 | Est.1 | Medidores confirmados corretamente |
| 5 | TRAVAS_OK | Est.5 | Est.1 + Est.2 | Travas confirmadas corretamente |
| 6 | FALHA_RESOLVIDA | Est.3 / Est.4 | Est.2 | Falha crítica resolvida |
| 7 | PENALIDADE | Qualquer ação | Cronômetro | Confirmação errada em qualquer estação |
| 8 | FIM | Est.1 / Cronômetro | Todas | Jogo encerrado (vitória ou derrota) |

---

## Detalhamento de Cada Sinal

---

### 1 — INICIO

**Origem:** Estação 5 (Carapaça)
**Destino:** Estação 1 (Terminal Kirlian)

**Quando:** O operador da Carapaça pressiona o botão B enquanto a Estação 1 está no Estado 0 (tela de introdução). Não exige sequência correta nas travas — é apenas um "continuar".

**Efeito na Estação 1:** Transição do Estado 0 para o Estado 1 — exibe o briefing da Tarefa 1 e aguarda ENTER.

**Efeito nas demais:** Nenhum. As estações permanecem em espera até receber AVANCAR.

> Este sinal acontece uma única vez em toda a partida.

---

### 2 — AVANCAR

**Origem:** Estação 1 (Terminal Kirlian)
**Destino:** Todas as estações (inclusive a própria)

**Quando:** O operador da Estação 1 pressiona ENTER após ler o briefing de uma tarefa.

**Dados:** Número da tarefa que será iniciada (1 a 5).

**Efeito em todas as estações:**
- Atualizam sua interface para a tarefa indicada
- Resetam estados internos da tarefa anterior (medidores zeram, cadeia reinicia)
- Tarefa fica disponível para execução

**Efeitos adicionais dependendo da tarefa:**
- **T2:** Est.3 entra em Falha Crítica (controles invertidos). Est.2 acende linha E.
- **T3:** Est.4 entra em Falha Crítica (visores embaralhados). Est.2 acende linha E.
- **T4:** Est.2 entra em Falha Crítica (piscadas aleatórias no painel).
- **T5:** Est.2 acende linha D em roxo. Nenhuma estação tem execução.

> O cronômetro inicia na primeira vez que AVANCAR é disparado (Tarefa 1).
> Nas tarefas seguintes, o cronômetro já está rodando e continua normalmente.

> Este é o único sinal de mudança de fase — todas as estações escutam e avançam simultaneamente.

---

### 3 — EXECUCAO_OK

**Origem:** Estação 3 (Válvulas) ou Estação 4 (Alavancas)
**Destino:** Estação 2 (Painel de Luzes)

**Quando:**
- Est.3: operador aciona LIBERAR com as válvulas na posição correta
- Est.4: operador aciona Alavanca de Carga com as alavancas na posição correta

**Efeito na Estação 2:**
- A luz da estação que completou apaga no painel
- A próxima estação na cadeia passa a piscar rápido
- Se não há mais passos antes da Carapaça, aguarda o operador do Painel ajustar os faders

> O número exibido no medidor da estação é comunicado verbalmente — não faz parte do sinal digital. O operador do Painel registra manualmente nos faders PRESSÃO e ENERGIA.

> Se a confirmação estiver errada (posição incorreta), EXECUCAO_OK não é enviado — apenas PENALIDADE é disparado.

---

### 4 — MEDIDORES_OK

**Origem:** Estação 2 (Painel de Luzes)
**Destino:** Estação 1 (Terminal Kirlian)

**Quando:** O operador do Painel ajusta PRESSÃO e ENERGIA nos valores corretos e pressiona CONFIRMAR.

**Efeito na Estação 1:** A sobreposição de símbolos aparece (Estado 3), exibindo 3 opções de sequência para a Carapaça. Permanece na tela até TRAVAS_OK.

> Se os valores estiverem errados, MEDIDORES_OK não é enviado — apenas PENALIDADE é disparado.

---

### 5 — TRAVAS_OK

**Origem:** Estação 5 (Carapaça)
**Destino:** Estação 1 (Terminal Kirlian) + Estação 2 (Painel de Luzes)

**Quando:** O operador da Carapaça pressiona o botão B com as 4 travas posicionadas nos símbolos corretos.

**Efeito na Estação 1:**
- Fecha a sobreposição de símbolos
- Se a tarefa tem mais uma execução de travas (T3): exibe nova sobreposição com os símbolos da próxima execução automaticamente — sem necessidade de novo MEDIDORES_OK
- Se era a última execução: exibe "TAREFA CONCLUÍDA" → 5 segundos de transição → briefing da próxima tarefa aparece → aguarda ENTER

**Efeito na Estação 2:**
- Luz C correspondente apaga
- Se houver próximo passo na cadeia (T3: C3 → C4): próxima luz C pisca rápido

**Efeito no cronômetro (se última execução da tarefa):**
- +1 minuto adicionado ao cronômetro
- Cabo correspondente acende na Estação 5

> Se a sequência estiver errada, TRAVAS_OK não é enviado — apenas PENALIDADE.

> Na Tarefa 3, este sinal acontece duas vezes (Execução 1 e Execução 2). Apenas na segunda vez a tarefa é concluída.

---

### 6 — FALHA_RESOLVIDA

**Origem:** Estação 3 (Válvulas) ou Estação 4 (Alavancas)
**Destino:** Estação 2 (Painel de Luzes)

**Quando:**
- Est.3 (T2): LIBERAR acionado com a sequência de falha crítica correta
- Est.4 (T3): Alavanca de Carga acionada 3 vezes com as sequências FC corretas

**Efeito na Estação 2:**
- Linha E apaga
- A cadeia normal da tarefa pode começar (primeira luz pisca rápido)

**Efeito na estação de origem:**
- Efeitos visuais da falha desaparecem (tonalidade, fumaça, inversão, embaralhamento)
- Controles voltam ao normal
- Estação liberada para execução normal

> A Falha Crítica da Tarefa 4 é local na Estação 2 — não gera este sinal. O próprio operador resolve com 5 sequências de medidores, e o painel volta ao normal sozinho.

---

### 7 — PENALIDADE

**Origem:** Qualquer estação de ação
**Destino:** Cronômetro (todas as estações)

**Quando:** Confirmação com valores/posição/sequência errada:
- Est.2: CONFIRMAR com medidores errados
- Est.3: LIBERAR com válvulas erradas
- Est.4: Alavanca de Carga com alavancas erradas
- Est.5: Botão B com travas erradas

**Efeito:** Cronômetro perde 30 segundos em todas as estações simultaneamente.

> A estação que errou não avança — o operador corrige e tenta novamente.

---

### 8 — FIM

**Origem:** Estação 1 (ENTER na T5) ou Cronômetro (tempo = 0)
**Destino:** Todas as estações

**Dados:** Tipo de encerramento — vitória ou derrota.

**Quando:**
- **Vitória:** Operador da Est.1 pressiona ENTER durante o briefing da Tarefa 5
- **Derrota:** Cronômetro atinge zero em qualquer momento da partida

**Efeito em todas as estações:**
- Cronômetro para imediatamente
- Todas as telas exibem brilho roxo por 10 segundos
- Simulação encerrada — sem retorno

---

## Fluxo Completo — Tarefa Genérica

```
    Est.1 mostra briefing → operador lê
                ↓
          ENTER pressionado
                ↓
    ══════ AVANCAR ══════ → Todas as estações atualizam
                ↓
    (se tarefa com FC: aguarda FALHA_RESOLVIDA)
                ↓
    Est.2 mostra cadeia (luzes acendem)
                ↓
    ┌── CADEIA DE EXECUÇÃO ─────────────────────────┐
    │                                                │
    │   Estação com piscada rápida executa            │
    │         ↓                                      │
    │   Confirmação correta                          │
    │         ↓                                      │
    │   ══ EXECUCAO_OK ══ → Est.2 atualiza cadeia     │
    │         ↓                                      │
    │   Próxima estação pisca rápido                 │
    │         ↓                                      │
    │   (repete até Válvulas e Alavancas concluírem) │
    │                                                │
    └────────────────────────────────────────────────┘
                ↓
    Operador do Painel recebe números (verbal)
    Ajusta faders PRESSÃO e ENERGIA
                ↓
          CONFIRMAR pressionado
                ↓
    ══════ MEDIDORES_OK ══════ → Est.1
                ↓
    Est.1 mostra sobreposição com 3 opções de símbolos
    Operador informa Est.5 (verbal)
                ↓
    Est.5 posiciona travas → Botão B
                ↓
    ══════ TRAVAS_OK ══════ → Est.1 + Est.2
                ↓
    "TAREFA CONCLUÍDA" → +1 min → 5 segundos
                ↓
    Briefing da próxima tarefa (volta ao topo)
```

---

## Particularidades por Tarefa

---

### Tarefa 1 — Sem Falha Crítica

Fluxo genérico sem alterações. Cadeia: A5, B2, A3, C1.

A Estação 3 executa duas vezes (A5 e A3). Apenas o medidor da segunda execução é reportado ao Painel.

> O cronômetro inicia ao receber AVANCAR pela primeira vez.

---

### Tarefa 2 — Falha Crítica na Est.3

1. AVANCAR(2) dispara:
   - Est.3 entra em FC (controles invertidos, tela verde)
   - Est.2 acende linha E
2. Est.3 resolve FC (sequência + LIBERAR)
3. FALHA_RESOLVIDA → Est.2: linha E apaga
4. Cadeia normal começa: B4, A2, B1, C2

A Estação 4 executa duas vezes (B4 e B1). Apenas o medidor da segunda execução é reportado.

> A cadeia NÃO começa até a Falha Crítica ser resolvida. Enquanto a linha E estiver acesa, as luzes da cadeia não aparecem.

---

### Tarefa 3 — Falha Crítica na Est.4 + 2 Execuções da Carapaça

1. AVANCAR(3) dispara:
   - Est.4 entra em FC (visores embaralhados)
   - Est.2 acende linha E
2. Est.4 resolve FC (3 sequências + Carga cada)
3. FALHA_RESOLVIDA → Est.2: linha E apaga
4. Cadeia normal começa: A1, B3, C3, C4
5. Após A1 e B3: medidores confirmados (MEDIDORES_OK) — acontece uma única vez
6. C3: Est.1 mostra símbolos (Execução 1) → Est.5 confirma → TRAVAS_OK
7. Est.1 fecha sobreposição e mostra novos símbolos (Execução 2) automaticamente — sem novo MEDIDORES_OK
8. C4: Est.5 confirma → TRAVAS_OK → tarefa concluída

> MEDIDORES_OK acontece uma única vez na T3. Após o primeiro TRAVAS_OK, os símbolos da Execução 2 aparecem automaticamente.

---

### Tarefa 4 — Falha Crítica na Est.2

1. AVANCAR(4) dispara:
   - Est.2 entra em FC (luzes piscam aleatoriamente)
2. Est.2 resolve localmente (5 sequências de medidores)
   - Não gera sinal FALHA_RESOLVIDA — é tudo interno
3. Painel volta ao normal → cadeia começa: A4, B5, C5
4. Fluxo normal até o fim

> A Falha Crítica da T4 é a única 100% local. Nenhum sinal externo é necessário para resolvê-la.

---

### Tarefa 5 — Extração Final

1. AVANCAR(5) dispara:
   - Est.2 acende linha D em roxo
   - Todas as estações mostram estado final
2. Sem cadeia, sem execução, sem medidores, sem travas
3. ENTER na Est.1 → FIM(vitória) → todas as estações

> Única tarefa onde o ENTER no briefing dispara FIM em vez de iniciar uma cadeia.

---

## Cronômetro — Sincronização

O cronômetro é compartilhado entre todas as estações. Todas exibem o mesmo valor simultaneamente.

**Início:** Quando AVANCAR(1) é disparado (ENTER na Tarefa 1).

**Contagem:** Regressiva a partir de 15 minutos (900.000 ms), incluindo milésimos de segundo.

**Modificações:**
| Evento | Efeito | Quando |
|--------|--------|--------|
| Tarefa concluída | +1 minuto (+60.000 ms) | Após TRAVAS_OK da última execução |
| Confirmação errada | −30 segundos (−30.000 ms) | Após PENALIDADE |
| Tarefa 5 ENTER | Para o cronômetro | FIM(vitória) |
| Tempo = 0 | Para o cronômetro | FIM(derrota) |

**Exibição por estação:**
| Estação | Formato | Posição |
|---------|---------|---------|
| Est.1 — Terminal | Texto CMD verde, sem caixa | Canto inferior direito |
| Est.2 — Painel | Caixa flutuante, números vermelhos, milésimos | Sem interferir na interface |
| Est.3 — Válvulas | Caixa flutuante, números vermelhos, milésimos | Sem interferir na interface |
| Est.4 — Alavancas | Caixa flutuante, números vermelhos, milésimos | Sem interferir na interface |
| Est.5 — Carapaça | Caixa flutuante, números vermelhos, milésimos | Sem interferir na interface |

> O cronômetro deve ser a mesma fonte de verdade para todas as estações. Uma estação controla o valor; as demais leem e exibem.

---

## Resumo — O que cada estação envia e recebe

---

### Estação 1 — Terminal Kirlian

| Direção | Sinal | Para/De quem |
|---------|-------|-------------|
| **Recebe** | INICIO | Est.5 |
| **Envia** | AVANCAR | Todas |
| **Recebe** | MEDIDORES_OK | Est.2 |
| **Recebe** | TRAVAS_OK | Est.5 |
| **Envia** | FIM | Todas |

---

### Estação 2 — Painel de Luzes

| Direção | Sinal | Para/De quem |
|---------|-------|-------------|
| **Recebe** | AVANCAR | Est.1 |
| **Recebe** | EXECUCAO_OK | Est.3 / Est.4 |
| **Envia** | MEDIDORES_OK | Est.1 |
| **Recebe** | TRAVAS_OK | Est.5 |
| **Recebe** | FALHA_RESOLVIDA | Est.3 / Est.4 |
| **Envia** | PENALIDADE | Cronômetro |

---

### Estação 3 — Válvulas de Pressão

| Direção | Sinal | Para/De quem |
|---------|-------|-------------|
| **Recebe** | AVANCAR | Est.1 |
| **Envia** | EXECUCAO_OK | Est.2 |
| **Envia** | FALHA_RESOLVIDA | Est.2 |
| **Envia** | PENALIDADE | Cronômetro |

---

### Estação 4 — Alavancas de Energia

| Direção | Sinal | Para/De quem |
|---------|-------|-------------|
| **Recebe** | AVANCAR | Est.1 |
| **Envia** | EXECUCAO_OK | Est.2 |
| **Envia** | FALHA_RESOLVIDA | Est.2 |
| **Envia** | PENALIDADE | Cronômetro |

---

### Estação 5 — Travas da Carapaça (3 sinais diferentes)

| Direção | Sinal | Para/De quem |
|---------|-------|-------------|
| **Envia** | INICIO | Est.1 |
| **Recebe** | AVANCAR | Est.1 |
| **Envia** | TRAVAS_OK | Est.1 + Est.2 |
| **Envia** | PENALIDADE | Cronômetro |

> A Carapaça é a estação que envia mais tipos de sinais distintos: INICIO (começo do jogo), TRAVAS_OK (conclusão de cadeia + conclusão de tarefa) e PENALIDADE (erro nas travas). Cada um vai para um destino diferente.

---

## Cadeia de Execução — Gerenciamento Local

A cadeia de prioridade (qual luz pisca rápido ou lento) é gerenciada internamente pela Estação 2. Não existe sinal de "troque a prioridade" — o Painel sabe a sequência predefinida de cada tarefa e reage localmente aos sinais EXECUCAO_OK.

**Lógica do Painel ao receber AVANCAR:**
1. Carrega a sequência da tarefa (ex: A5, B2, A3, C1)
2. Se a tarefa tem FC (T2/T3): aguarda FALHA_RESOLVIDA antes de acender a cadeia
3. Primeiro passo pisca rápido, demais piscam lento

**Lógica do Painel ao receber EXECUCAO_OK:**
1. Luz do passo concluído apaga
2. Próximo passo na sequência pisca rápido
3. Se todos os passos de Válvulas e Alavancas concluíram: aguarda operador ajustar medidores

**Lógica do Painel ao receber TRAVAS_OK:**
1. Luz C correspondente apaga
2. Se há próximo passo C na cadeia (T3): próxima luz C pisca rápido
3. Se era o último passo: cadeia encerrada

---

## Estado Compartilhado — Campos Necessários

Independente da implementação (Firebase ou local), os seguintes campos precisam existir no estado compartilhado:

| Campo | Tipo | Quem escreve | Quem lê | Descrição |
|-------|------|-------------|---------|-----------|
| fase | 0–5 | Est.1 | Todas | Tarefa atual (0 = intro) |
| tarefaIniciada | booleano | Est.1 | Todas | ENTER foi pressionado |
| cadeiaPasso | número | Est.2 | Est.2 | Passo atual na cadeia (local) |
| medidoresOk | booleano | Est.2 | Est.1 | Medidores confirmados |
| travasOk | booleano | Est.5 | Est.1, Est.2 | Travas confirmadas |
| travasExecucao | número | Est.5 | Est.1 | Qual execução (para T3) |
| falhaCriticaResolvida | booleano | Est.3/Est.4 | Est.2 | FC resolvida |
| cronometroMs | número | Gerenciador | Todas | Tempo restante em ms |
| penalidades | contador | Qualquer | Cronômetro | Incrementa a cada erro |
| jogoEncerrado | booleano | Est.1/Cronômetro | Todas | Partida terminou |
| tipoFim | texto | Est.1/Cronômetro | Todas | "vitoria" ou "derrota" |

> Alguns campos são resetados a cada tarefa (medidoresOk, travasOk, travasExecucao, falhaCriticaResolvida). Outros acumulam ao longo da partida (fase, cronometroMs, penalidades).

---

## O que este documento cobre

- [x] Todos os sinais entre estações (8 sinais identificados)
- [x] Fluxo genérico de uma tarefa
- [x] Particularidades de cada tarefa (T1–T5)
- [x] Cronômetro — início, modificações, exibição e sincronização
- [x] Estado compartilhado — campos necessários
- [x] Cadeia de execução — gerenciamento local no Painel
- [x] Resumo de envio/recebimento por estação
