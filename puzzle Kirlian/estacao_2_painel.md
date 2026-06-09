# Estação 2 — Painel de Luzes

> Documento específico da Estação 2
> Referência cruzada: Design Base v1.2

---

## Visão Geral

Estação de visão responsável pelo monitoramento em tempo real do sistema e pela validação de cada tarefa. É o árbitro da cadeia de ação — dita quem age e quando. Também é a estação que confirma os medidores das estações de ação e libera a sequência para a Estação 5.

---

## Layout Visual

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   PAINEL DE LUZES — grade 5×5                   │
│                                                 │
│       1    2    3    4    5                      │
│  A  [ ]  [ ]  [ ]  [ ]  [ ]                     │
│  B  [ ]  [ ]  [ ]  [ ]  [ ]                     │
│  C  [ ]  [ ]  [ ]  [ ]  [ ]                     │
│  D  [ ]  [ ]  [ ]  [ ]  [ ]                     │
│  E  [ ]  [ ]  [ ]  [ ]  [ ]                     │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│   PRESSÃO  [pino ════════●════] 0-10            │
│                                                 │
│   ENERGIA  [pino ════════●════] 0-10            │
│                                                 │
│                    [ CONFIRMAR ]                │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Parte superior — Grade 5×5:**
- Não ocupa a tela inteira — área dedicada no topo do painel
- Linhas: A, B, C, D, E
- Colunas: 1, 2, 3, 4, 5
- Estética de painel soviético antigo

**Parte inferior — Medidores e confirmação:**
- **PRESSÃO:** pino estilo mesa sonora (fader), escala 0 a 10 — representa o número da Estação 3
- **ENERGIA:** pino estilo mesa sonora (fader), escala 0 a 10 — representa o número da Estação 4
- **Botão CONFIRMAR:** valida os dois medidores e libera a sequência para a Estação 5

---

## Significado das Linhas

| Linha | Representa |
|-------|-----------|
| A | Estação 3 — Válvulas de Pressão |
| B | Estação 4 — Alavancas de Energia |
| C | Estação 5 — Travas da Carapaça |
| D | Reservada (eventos especiais) |
| E | Falha crítica / alerta |

## Significado das Colunas

Os números das colunas indicam a **sequência de execução** da tarefa — qual passo vem primeiro, segundo, etc. O Manual usa esses números como referência para instruir as estações de ação.

---

## Sistema de Piscada — Cadeia de Prioridade

Quando uma tarefa começa, as luzes das estações de ação acendem simultaneamente:
- **Piscada rápida** = esta estação age agora
- **Piscada lenta** = aguardando sua vez

Quando uma estação conclui sua parte, a luz dela apaga e a próxima na cadeia passa a piscar rápido. O operador do Painel reporta verbalmente quem está piscando rápido.

**A ordem da cadeia é diferente a cada tarefa.**

---

## Falhas Críticas — Linha E

Quando as Tarefas 2 e 3 entram em falha crítica (sinalizado pelo Firebase ao trocar de tarefa), **a linha E inteira acende**. Quando a falha é resolvida na estação correspondente, essa estação dispara um sinal e a linha E apaga, voltando ao monitoramento normal.

---

## Sequências por Tarefa

> Notação:
> Letra = linha (estação) | Número = coluna (sequência/passo)
> A ordem de listagem é a ordem de piscada — o primeiro da lista pisca rápido primeiro

---

### Tarefa 1 — Foco: Válvulas (2 execuções na linha A)

```
Sequência: A5, B2, A3, C1
```

**Leitura:**
- A5 pisca rápido → Válvulas executam (Execução 1, passo 5)
- B2 pisca rápido → Alavancas executam (passo 2)
- A3 pisca rápido → Válvulas executam de novo (Execução 2, passo 3)
- C1 pisca rápido → Carapaça executa (passo 1)

**Medidores a confirmar (após cadeia completa):**
- PRESSÃO = 7 (medidor da Execução 2 das Válvulas)
- ENERGIA = 9

---

### Tarefa 2 — Foco: Alavancas (2 execuções na linha B) + Falha Crítica Est.3

Linha E acende ao entrar na tarefa → Válvulas resolvem falha → linha E apaga → sequência normal.

```
Sequência: B4, A2, B1, C2
```

**Leitura:**
- B4 pisca rápido → Alavancas executam (Execução 1, passo 4)
- A2 pisca rápido → Válvulas executam (passo 2)
- B1 pisca rápido → Alavancas executam de novo (Execução 2, passo 1)
- C2 pisca rápido → Carapaça executa (passo 2)

**Medidores a confirmar:**
- PRESSÃO = 3
- ENERGIA = 1 (medidor da Execução 2 das Alavancas)

---

### Tarefa 3 — Foco: Carapaça (2 execuções na linha C) + Falha Crítica Est.4

Linha E acende ao entrar na tarefa → Alavancas resolvem falha → linha E apaga → sequência normal.

```
Sequência: A1, B3, C3, C4
```

**Leitura:**
- A1 pisca rápido → Válvulas executam (passo 1)
- B3 pisca rápido → Alavancas executam (passo 3)
- C3 pisca rápido → Carapaça executa (Execução 1, passo 3)
- C4 pisca rápido → Carapaça executa de novo (Execução 2, passo 4)

**Medidores a confirmar:**
- PRESSÃO = 9
- ENERGIA = 6

---

### Tarefa 4 — Falha Crítica do Painel de Luzes

Ao entrar na Tarefa 4, as luzes do painel começam a **piscar aleatoriamente** — falha crítica da própria Estação 2.

**Como resolver — 5 sequências nos medidores, confirmando cada uma:**

| Sequência | PRESSÃO | ENERGIA | Efeito |
|-----------|---------|---------|--------|
| 1ª | 0 | 0 | Todas as luzes ficam vermelhas · linha 1 fica verde |
| 2ª | 10 | 10 | Linha 2 fica verde |
| 3ª | 10 | 0 | Linha 3 fica verde |
| 4ª | 0 | 10 | Linha 4 fica verde |
| 5ª | 5 | 5 | Linha 5 fica verde → todas as luzes piscam 2x em verde → painel volta ao normal |

Após normalizar, a sequência da tarefa segue:

```
Sequência: A4, B5, C5
```

**Leitura:**
- A4 pisca rápido → Válvulas executam (passo 4)
- B5 pisca rápido → Alavancas executam (passo 5)
- C5 pisca rápido → Carapaça executa (passo 5)

**Medidores a confirmar:**
- PRESSÃO = 4
- ENERGIA = 2

---

### Tarefa 5 — Extração Final

Sem sequência de luzes de ação nesta tarefa.

A linha D acende inteira em **roxo** — único momento em que essa linha é usada.
Permanece acesa até o encerramento da simulação.

Ao pressionar ENTER no Terminal Kirlian:
- Cronômetro para em todas as estações
- Todas as estações exibem brilho roxo por 10 segundos
- Simulação encerrada

---

## Resumo das Confirmações de Medidor

| Tarefa | PRESSÃO (Est.3) | ENERGIA (Est.4) |
|--------|----------------|----------------|
| 1 | 7 | 9 |
| 2 | 3 | 1 |
| 3 | 9 | 6 |
| 4 | 4 | 2 |

---

## Comunicação com outras estações

| Evento | Quem é notificado | Como |
|--------|------------------|------|
| Luz pisca rápido | Estação correspondente | Verbal — operador reporta |
| Estação conclui parte | Próxima na cadeia | Luz apaga, próxima pisca rápido |
| Botão CONFIRMAR correto | Estação 1 | Libera sequência das travas |
| Botão CONFIRMAR errado | Cronômetro | −30 segundos |
| Falha Crítica T2/T3 | Linha E acende | Firebase sinaliza troca de tarefa |
| Falha resolvida T2/T3 | Linha E apaga | Sinal da estação correspondente |
| Falha Crítica T4 | Painel todo | Piscadas aleatórias locais |
| Falha T4 resolvida | Painel todo | 2 piscadas verdes → normal |

---

## Definições Visuais e de Feedback

**Arte:** painel soviético antigo — botões desgastados, iluminação âmbar/verde nas luzes normais.

**Som:** nenhum.

**Luzes normais:** verde suave para monitoramento, piscada rápida em verde mais intenso para prioridade.

**Falha Crítica T2/T3:** linha E acende em vermelho.

**Falha Crítica T4:** luzes piscam aleatoriamente → ao resolver, linhas ficam vermelhas exceto as já normalizadas (verdes) → 2 piscadas verdes finais.

**Pinos dos medidores:** faders de mesa sonora, deslizam suavemente de 0 a 10.

**Botão CONFIRMAR:** visível e central na parte inferior do painel.

**Cronômetro:** caixa flutuante com números vermelhos em contagem regressiva, incluindo milésimos de segundo. Posicionada sem interferir na interface. Se chegar a zero, brilho roxo é acionado em todas as estações e a simulação encerra.

**Linha D:** normalmente apagada. Acende em roxo apenas na Tarefa 5, permanecendo até o encerramento.

